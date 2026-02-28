"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, BookOpen, Search, ClipboardList, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import SubjectCard from "@/components/tutoring/SubjectCard";
import RequestForm from "@/components/tutoring/RequestForm";
import { useActiveTutoringSubjects } from "@/lib/hooks/useTutoringSubject";
import { useMySubscriptions } from "@/lib/hooks/useTutoringEnrollment";

export default function TutoringSubjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);

  const { data, isLoading, error, refetch } = useActiveTutoringSubjects();
  const { data: enrollmentsData } = useMySubscriptions();

  // Build set of subject IDs the student is already enrolled in
  const enrolledSubjectIds = new Set(
    (enrollmentsData?.data || []).map((e) => e.subject?._id || e.subject)
  );

  // Filter subjects based on search term
  const subjects = data?.data || [];
  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subject.description && subject.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle subject selection for tutoring request
  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setIsRequestFormOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="px-4 py-6 sm:py-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="px-4 py-6 sm:py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load subjects</h3>
              <p className="text-muted-foreground mb-4">{error.message}</p>
              <button
                onClick={() => refetch()}
                className="text-primary hover:underline"
              >
                Try again
              </button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold mb-1">Private Tutoring</h1>
            <p className="text-sm text-muted-foreground">
              Browse available subjects for 1:1 private tutoring sessions
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/student-dashboard/tutoring/my-requests">
                <ClipboardList className="h-4 w-4 mr-2" />
                My Requests
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/student-dashboard/tutoring/my-subscriptions">
                <CreditCard className="h-4 w-4 mr-2" />
                My Subscriptions
              </Link>
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Empty state */}
        {subjects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No subjects available</h3>
              <p className="text-muted-foreground">
                Check back later for available tutoring subjects.
              </p>
            </CardContent>
          </Card>
        ) : filteredSubjects.length === 0 ? (
          /* No search results */
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No subjects found</h3>
              <p className="text-muted-foreground">
                No subjects match "{searchTerm}". Try a different search term.
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Subject Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubjects.map((subject) => (
              <SubjectCard
                key={subject._id}
                subject={subject}
                enrolled={enrolledSubjectIds.has(subject._id)}
                onSelect={handleSubjectSelect}
              />
            ))}
          </div>
        )}

        {/* Info note */}
        {subjects.length > 0 && (
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>How it works:</strong> Select a subject you need help with, submit a tutoring request,
              and our admin will match you with a qualified instructor. You'll get a trial period to evaluate
              before subscribing monthly.
            </p>
          </div>
        )}

        {/* Request Form Dialog */}
        <RequestForm
          open={isRequestFormOpen}
          onOpenChange={setIsRequestFormOpen}
          subject={selectedSubject}
        />
      </div>
    </DashboardLayout>
  );
}
