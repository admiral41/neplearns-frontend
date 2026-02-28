'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout';
import AdminLiveClassCalendar from '@/components/admin/AdminLiveClassCalendar';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RefreshCw,
  Video,
  Calendar,
  PlayCircle,
  CheckCircle,
  CalendarDays,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { courseAPI } from '@/lib/api/courses';
import { livestreamAPI } from '@/lib/api/livestream';

function AllSessionsContent() {
  const [courses, setCourses] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedInstructor, setSelectedInstructor] = useState('all');

  // Fetch all courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoadingCourses(true);
        const response = await courseAPI.getAllCourses({ limit: 500 });
        setCourses(response.data || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses');
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  // Fetch all live classes
  const fetchAllLiveClasses = async () => {
    try {
      setIsLoadingClasses(true);
      const response = await livestreamAPI.getAllLivestreams({
        limit: 500,
      });
      setLiveClasses(response.data || []);
    } catch (error) {
      console.error('Error fetching live classes:', error);
      toast.error('Failed to load live classes');
    } finally {
      setIsLoadingClasses(false);
    }
  };

  useEffect(() => {
    fetchAllLiveClasses();
  }, []);

  const handleRefresh = () => {
    fetchAllLiveClasses();
  };

  // Extract unique instructors from live classes
  const instructors = useMemo(() => {
    const instructorMap = new Map();
    liveClasses.forEach((lc) => {
      const instructor = lc.createdBy || lc.instructor;
      if (instructor && instructor._id) {
        const name = `${instructor.firstname || ''} ${instructor.lastname || ''}`.trim();
        if (name && !instructorMap.has(instructor._id)) {
          instructorMap.set(instructor._id, {
            _id: instructor._id,
            name: name || 'Unknown',
          });
        }
      }
    });
    return Array.from(instructorMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [liveClasses]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: liveClasses.length,
      upcoming: liveClasses.filter((lc) => lc.status === 'scheduled').length,
      live: liveClasses.filter((lc) => lc.status === 'live').length,
      ended: liveClasses.filter((lc) => lc.status === 'ended').length,
      instructors: instructors.length,
    };
  }, [liveClasses, instructors]);

  return (
    <AdminDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold mb-1 flex items-center gap-2">
              <CalendarDays className="h-6 w-6" />
              All Sessions
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              View all live classes across all courses and instructors
            </p>
          </div>

          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoadingClasses}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoadingClasses ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Video className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.upcoming}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Live Now</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.live}
                  </p>
                </div>
                <PlayCircle className="h-8 w-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ended</p>
                  <p className="text-2xl font-bold">{stats.ended}</p>
                </div>
                <CheckCircle className="h-8 w-8 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Instructors</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.instructors}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Course Filter */}
              <div className="flex items-center gap-2 flex-1">
                <label className="text-sm font-medium whitespace-nowrap">
                  Course:
                </label>
                <div className="w-full sm:w-64">
                  {isLoadingCourses ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      value={selectedCourse}
                      onValueChange={setSelectedCourse}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Courses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        {courses.map((course) => (
                          <SelectItem key={course._id} value={course._id}>
                            {course.courseTitle}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {/* Instructor Filter */}
              <div className="flex items-center gap-2 flex-1">
                <label className="text-sm font-medium whitespace-nowrap">
                  Instructor:
                </label>
                <div className="w-full sm:w-64">
                  <Select
                    value={selectedInstructor}
                    onValueChange={setSelectedInstructor}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Instructors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Instructors</SelectItem>
                      {instructors.map((instructor) => (
                        <SelectItem key={instructor._id} value={instructor._id}>
                          {instructor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <AdminLiveClassCalendar
          liveClasses={liveClasses}
          isLoading={isLoadingClasses}
          courseFilter={selectedCourse}
          instructorFilter={selectedInstructor}
          onRefresh={handleRefresh}
        />

        {/* Empty state */}
        {!isLoadingClasses && liveClasses.length === 0 && (
          <div className="text-center py-12 mt-6">
            <Video className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Live Classes Yet</h3>
            <p className="text-muted-foreground">
              No live classes have been scheduled by any instructor.
            </p>
          </div>
        )}

        {/* Legend */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="font-medium">Status Legend:</span>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span>Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span>Live</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-500"></span>
                <span>Ended</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span>Cancelled</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}

export default function AllSessionsPage() {
  return (
    <Suspense
      fallback={
        <AdminDashboardLayout>
          <div className="px-4 py-6 sm:py-8 space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </AdminDashboardLayout>
      }
    >
      <AllSessionsContent />
    </Suspense>
  );
}
