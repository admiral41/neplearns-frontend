'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import InstructorDashboardLayout from '@/components/instructor/InstructorDashboardLayout';
import LiveClassCalendar from '@/components/instructor/LiveClassCalendar';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { courseAPI } from '@/lib/api/courses';
import { livestreamAPI } from '@/lib/api/livestream';

function MySessionsContent() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('all');

  // Fetch instructor's courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoadingCourses(true);
        const response = await courseAPI.getMyCourses('created');
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

  // Fetch all live classes for the instructor
  const fetchAllLiveClasses = async () => {
    try {
      setIsLoadingClasses(true);
      // Fetch all livestreams - the backend filters by createdBy for lecturers
      const response = await livestreamAPI.getAllLivestreams({
        limit: 500, // Get all classes
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

  const handleEdit = (liveClass) => {
    // Navigate to the live-classes page with the course selected
    const courseId = liveClass.course?._id || liveClass.course;
    router.push(`/instructor-dashboard/live-classes?course=${courseId}`);
  };

  // Calculate stats
  const stats = {
    total: liveClasses.length,
    upcoming: liveClasses.filter((lc) => lc.status === 'scheduled').length,
    live: liveClasses.filter((lc) => lc.status === 'live').length,
    ended: liveClasses.filter((lc) => lc.status === 'ended').length,
  };

  return (
    <InstructorDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold mb-1 flex items-center gap-2">
              <CalendarDays className="h-6 w-6" />
              My Sessions
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              View all your scheduled live classes across all courses
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
        </div>

        {/* Course Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <label className="text-sm font-medium whitespace-nowrap">
                Filter by Course:
              </label>
              <div className="w-full sm:w-80">
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
          </CardContent>
        </Card>

        {/* Calendar */}
        <LiveClassCalendar
          liveClasses={liveClasses}
          isLoading={isLoadingClasses}
          courseFilter={selectedCourse}
          onRefresh={handleRefresh}
          onEdit={handleEdit}
        />

        {/* Empty state */}
        {!isLoadingClasses && liveClasses.length === 0 && (
          <div className="text-center py-12 mt-6">
            <Video className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Live Classes Yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven&apos;t scheduled any live classes yet.
            </p>
            <Button
              onClick={() => router.push('/instructor-dashboard/live-classes')}
            >
              Schedule Your First Class
            </Button>
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
    </InstructorDashboardLayout>
  );
}

export default function MySessionsPage() {
  return (
    <Suspense
      fallback={
        <InstructorDashboardLayout>
          <div className="px-4 py-6 sm:py-8 space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </InstructorDashboardLayout>
      }
    >
      <MySessionsContent />
    </Suspense>
  );
}
