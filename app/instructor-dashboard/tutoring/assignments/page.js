'use client';

import { useState, useMemo } from 'react';
import InstructorDashboardLayout from '@/components/instructor/InstructorDashboardLayout';
import {
  useInstructorAssignments,
} from '@/lib/hooks/useTutoringAssignment';
import { useMyTutoringStudents } from '@/lib/hooks/useTutoringSession';
import AssignmentCard from '@/components/tutoring/assignments/AssignmentCard';
import AssignmentCreateDialog from '@/components/tutoring/assignments/AssignmentCreateDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, FileText, ClipboardList, CheckCircle, RotateCcw } from 'lucide-react';

export default function InstructorAssignmentsPage() {
  const [studentFilter, setStudentFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  // Build query params
  const queryParams = useMemo(() => {
    const params = {};
    if (studentFilter !== 'all') params.studentId = studentFilter;
    return params;
  }, [studentFilter]);

  const { data: assignments, isLoading, isError, error } = useInstructorAssignments(queryParams);
  const { data: studentsData } = useMyTutoringStudents();

  // Flatten students for the filter and create dialog
  const allStudents = useMemo(() => {
    if (!studentsData?.bySubject) return [];
    const students = [];
    const seen = new Set();
    Object.values(studentsData.bySubject).forEach((group) => {
      group.students?.forEach((enrollment) => {
        const studentId = enrollment.student?._id;
        if (studentId && !seen.has(studentId)) {
          seen.add(studentId);
          students.push(enrollment.student);
        }
      });
    });
    return students;
  }, [studentsData]);

  // Flatten enrollments for create dialog student selector
  const enrollmentOptions = useMemo(() => {
    if (!studentsData?.bySubject) return [];
    const options = [];
    Object.values(studentsData.bySubject).forEach((group) => {
      group.students?.forEach((enrollment) => {
        options.push({
          enrollmentId: enrollment.enrollmentId,
          student: enrollment.student,
          subject: group.subject,
        });
      });
    });
    return options;
  }, [studentsData]);

  // Group assignments by status
  const { needsReview, awaitingRevision, active, reviewed } = useMemo(() => {
    if (!assignments) return { needsReview: [], awaitingRevision: [], active: [], reviewed: [] };
    return {
      needsReview: assignments.filter((a) => a.status === 'submitted'),
      awaitingRevision: assignments.filter((a) => a.status === 'revision_requested'),
      active: assignments.filter((a) => a.status === 'active'),
      reviewed: assignments.filter((a) => a.status === 'reviewed'),
    };
  }, [assignments]);

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setCreateOpen(true);
  };

  const handleCreateClose = (open) => {
    setCreateOpen(open);
    if (!open) setEditingAssignment(null);
  };

  return (
    <InstructorDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-lg sm:text-xl font-bold">Assignments</h1>

            <div className="flex items-center gap-3">
              {/* Student Filter */}
              <Select value={studentFilter} onValueChange={setStudentFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  {allStudents.map((student) => (
                    <SelectItem key={student._id} value={student._id}>
                      {student.firstname} {student.lastname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Create Assignment
              </Button>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-red-600">
              Error: {error?.message || 'Failed to load assignments'}
            </div>
          ) : assignments?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No assignments yet</p>
              <p className="text-sm mt-1">Create your first assignment for a student.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Needs Review */}
              {needsReview.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-amber-500" />
                    <h2 className="text-lg font-semibold">Needs Review ({needsReview.length})</h2>
                  </div>
                  <div className="space-y-3">
                    {needsReview.map((a) => (
                      <AssignmentCard
                        key={a._id}
                        assignment={a}
                        role="instructor"
                        onEdit={handleEdit}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Awaiting Revision */}
              {awaitingRevision.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-5 w-5 text-orange-500" />
                    <h2 className="text-lg font-semibold">Awaiting Revision ({awaitingRevision.length})</h2>
                  </div>
                  <div className="space-y-3">
                    {awaitingRevision.map((a) => (
                      <AssignmentCard
                        key={a._id}
                        assignment={a}
                        role="instructor"
                        onEdit={handleEdit}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Active */}
              {active.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <h2 className="text-lg font-semibold">Active ({active.length})</h2>
                  </div>
                  <div className="space-y-3">
                    {active.map((a) => (
                      <AssignmentCard
                        key={a._id}
                        assignment={a}
                        role="instructor"
                        onEdit={handleEdit}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Reviewed */}
              {reviewed.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h2 className="text-lg font-semibold">Reviewed ({reviewed.length})</h2>
                  </div>
                  <div className="space-y-3">
                    {reviewed.map((a) => (
                      <AssignmentCard
                        key={a._id}
                        assignment={a}
                        role="instructor"
                        onEdit={handleEdit}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {/* Create/Edit Dialog */}
        <AssignmentCreateDialog
          open={createOpen}
          onOpenChange={handleCreateClose}
          students={enrollmentOptions}
          editingAssignment={editingAssignment}
        />
      </div>
    </InstructorDashboardLayout>
  );
}
