'use client';

import InstructorDashboardLayout from '@/components/instructor/InstructorDashboardLayout';
import { useMyTutoringStudents } from '@/lib/hooks/useTutoringSession';
import StudentListCard from '@/components/tutoring/sessions/StudentListCard';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Users, Loader2 } from 'lucide-react';

/**
 * InstructorStudentsPage - Displays instructor's assigned tutoring students grouped by subject
 * Enables instructors to view student subscription status and schedule sessions
 */
export default function InstructorStudentsPage() {
  const { data, isLoading, isError, error } = useMyTutoringStudents();

  const bySubject = data?.bySubject || {};
  const subjectIds = Object.keys(bySubject);

  return (
    <InstructorDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-red-600">
            Error: {error?.message || 'Failed to load students'}
          </div>
        ) : subjectIds.length === 0 ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-lg sm:text-xl font-bold">My Tutoring Students</h1>
            </div>
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>You have no assigned tutoring students yet.</p>
              <p className="text-sm mt-2">
                Students will appear here once they are assigned to you.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-lg sm:text-xl font-bold">My Tutoring Students</h1>
              <p className="text-sm text-muted-foreground">
                {subjectIds.length} subject{subjectIds.length !== 1 ? 's' : ''}
              </p>
            </div>

            {subjectIds.map((subjectId) => {
              const group = bySubject[subjectId];
              const studentCount = group.students?.length || 0;

              return (
                <Card key={subjectId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {group.subject?.name || 'Unknown Subject'}
                      </CardTitle>
                      <span className="text-sm text-muted-foreground">
                        {studentCount} student{studentCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {studentCount > 0 ? (
                      group.students.map((enrollment) => (
                        <StudentListCard
                          key={enrollment.enrollmentId || enrollment._id}
                          enrollment={enrollment}
                        />
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No students in this subject
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </InstructorDashboardLayout>
  );
}
