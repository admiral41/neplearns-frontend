'use client';

import { useMemo } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useStudentAssignments } from '@/lib/hooks/useTutoringAssignment';
import AssignmentCard from '@/components/tutoring/assignments/AssignmentCard';
import { Loader2, FileText, ClipboardList, CheckCircle, Upload, RotateCcw } from 'lucide-react';

export default function StudentAssignmentsPage() {
  const { data: assignments, isLoading, isError, error } = useStudentAssignments();

  // Group assignments: Needs Revision -> To Do (active) -> Submitted -> Reviewed
  const { needsRevision, toDo, submitted, reviewed } = useMemo(() => {
    if (!assignments) return { needsRevision: [], toDo: [], submitted: [], reviewed: [] };
    return {
      needsRevision: assignments.filter((a) => a.status === 'revision_requested'),
      toDo: assignments.filter((a) => a.status === 'active'),
      submitted: assignments.filter((a) => a.status === 'submitted'),
      reviewed: assignments.filter((a) => a.status === 'reviewed'),
    };
  }, [assignments]);

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-lg sm:text-xl font-bold">My Assignments</h1>
            <p className="text-muted-foreground mt-1">
              View and submit your tutoring assignments
            </p>
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
              <p className="text-sm mt-1">
                Your instructor will assign work here when ready.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Needs Revision */}
              {needsRevision.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-5 w-5 text-orange-500" />
                    <h2 className="text-lg font-semibold">Needs Revision ({needsRevision.length})</h2>
                  </div>
                  <div className="space-y-3">
                    {needsRevision.map((a) => (
                      <AssignmentCard key={a._id} assignment={a} role="student" />
                    ))}
                  </div>
                </section>
              )}

              {/* To Do */}
              {toDo.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-blue-500" />
                    <h2 className="text-lg font-semibold">To Do ({toDo.length})</h2>
                  </div>
                  <div className="space-y-3">
                    {toDo.map((a) => (
                      <AssignmentCard key={a._id} assignment={a} role="student" />
                    ))}
                  </div>
                </section>
              )}

              {/* Submitted */}
              {submitted.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-amber-500" />
                    <h2 className="text-lg font-semibold">Submitted ({submitted.length})</h2>
                  </div>
                  <div className="space-y-3">
                    {submitted.map((a) => (
                      <AssignmentCard key={a._id} assignment={a} role="student" />
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
                      <AssignmentCard key={a._id} assignment={a} role="student" />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
