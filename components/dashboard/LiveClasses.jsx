"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Video, Clock, User, Copy, ExternalLink, Info, Loader2, Calendar, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { livestreamAPI } from "@/lib/api/livestream";
import { courseAPI } from "@/lib/api/courses";
import { format, formatDistanceToNow, isToday, isTomorrow } from "date-fns";

export default function LiveClasses() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState(null);
  const [liveClasses, setLiveClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [jitsiConfig, setJitsiConfig] = useState(null);
  const [showJitsiDialog, setShowJitsiDialog] = useState(false);

  useEffect(() => {
    fetchLiveClasses();
  }, []);

  const fetchLiveClasses = async () => {
    try {
      setIsLoading(true);
      // First get enrolled courses
      const coursesResponse = await courseAPI.getMyCourses('enrolled');
      const courses = coursesResponse.data || [];

      if (courses.length === 0) {
        setLiveClasses([]);
        return;
      }

      // Fetch livestreams for all enrolled courses
      const allStreams = [];
      for (const course of courses) {
        try {
          const response = await livestreamAPI.getLivestreamsByCourse(course._id);
          if (response.data) {
            const streamsWithCourse = response.data.map(stream => ({
              ...stream,
              courseTitle: course.courseTitle,
              courseSlug: course.courseSlug
            }));
            allStreams.push(...streamsWithCourse);
          }
        } catch (error) {
          console.error(`Error fetching livestreams for course ${course.courseTitle}:`, error);
        }
      }

      // Filter to show only live and upcoming classes, sorted by time
      const now = new Date();
      const relevantStreams = allStreams
        .filter(stream => {
          const startTime = new Date(stream.scheduledStartTime);
          return stream.status === 'live' ||
                 (stream.status === 'scheduled' && startTime > now);
        })
        .sort((a, b) => {
          // Live classes first, then by start time
          if (a.status === 'live' && b.status !== 'live') return -1;
          if (b.status === 'live' && a.status !== 'live') return 1;
          return new Date(a.scheduledStartTime) - new Date(b.scheduledStartTime);
        })
        .slice(0, 4); // Show max 4 classes on dashboard

      setLiveClasses(relevantStreams);
    } catch (error) {
      console.error('Error fetching live classes:', error);
      toast.error('Failed to load live classes');
    } finally {
      setIsLoading(false);
    }
  };

  const formatClassDate = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  const formatClassTime = (dateString) => {
    return format(new Date(dateString), "h:mm a");
  };

  const formatDuration = (startTime, endTime) => {
    if (!endTime) return "1 hour";
    const start = new Date(startTime);
    const end = new Date(endTime);
    const minutes = Math.round((end - start) / (1000 * 60));
    if (minutes >= 60) {
      const hours = minutes / 60;
      return `${hours % 1 === 0 ? hours : hours.toFixed(1)} hour${hours > 1 ? 's' : ''}`;
    }
    return `${minutes} min`;
  };

  const getInstructorName = (stream) => {
    if (stream.lecturers && stream.lecturers.length > 0 && stream.lecturers[0].user) {
      const user = stream.lecturers[0].user;
      return `${user.firstname} ${user.lastname}`.trim();
    }
    if (stream.createdBy) {
      return `${stream.createdBy.firstname} ${stream.createdBy.lastname}`.trim();
    }
    return "Instructor";
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleJoinStream = async (stream) => {
    try {
      setIsJoining(true);
      setSelectedClass(stream);

      const response = await livestreamAPI.joinLivestream(stream.streamSlug);
      const { meetingInfo } = response.data || {};

      if (meetingInfo && meetingInfo.url) {
        // Open external meeting URL in new tab
        window.open(meetingInfo.url, '_blank');
        toast.success(`Opening ${meetingInfo.platform || 'meeting'}...`);
      } else {
        toast.error("Failed to get meeting information");
      }
    } catch (error) {
      console.error('Error joining livestream:', error);
      toast.error(error.message || 'Failed to join livestream');
    } finally {
      setIsJoining(false);
    }
  };

  const getStatusBadge = (stream) => {
    const now = new Date();
    const startTime = new Date(stream.scheduledStartTime);
    const minutesUntilStart = Math.round((startTime - now) / (1000 * 60));

    if (stream.status === "live") {
      return (
        <Badge className="bg-red-600 text-white animate-pulse">
          Live Now
        </Badge>
      );
    }
    if (stream.status === "scheduled" && minutesUntilStart <= 30) {
      return (
        <Badge variant="secondary" className="bg-green-600 text-white">
          Starting Soon
        </Badge>
      );
    }
    return <Badge variant="outline">Scheduled</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Live Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Live Classes
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => router.push('/student-dashboard/live-classes')}
          >
            View All
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {liveClasses.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No upcoming live classes</p>
            <p className="text-xs mt-1">Classes will appear here when scheduled</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {liveClasses.map((stream) => (
              <div
                key={stream._id}
                className="p-3 sm:p-4 border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-sm sm:text-base line-clamp-1 flex-1">
                    {stream.title}
                  </h4>
                  {getStatusBadge(stream)}
                </div>

                <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                  {stream.courseTitle || stream.course?.courseTitle}
                </p>

                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{getInstructorName(stream)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {formatClassDate(stream.scheduledStartTime)} at {formatClassTime(stream.scheduledStartTime)} ({formatDuration(stream.scheduledStartTime, stream.scheduledEndTime)})
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  className="w-full"
                  variant={stream.status === "live" ? "default" : "outline"}
                  onClick={() => handleJoinStream(stream)}
                  disabled={isJoining}
                >
                  {isJoining ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Video className="h-4 w-4 mr-2" />
                  )}
                  {stream.status === "live" ? "Join Now" : "Join Class"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Jitsi Meeting Dialog */}
      <Dialog open={showJitsiDialog} onOpenChange={setShowJitsiDialog}>
        <DialogContent className="max-w-6xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              {selectedClass?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedClass?.courseTitle || selectedClass?.course?.courseTitle} - {getInstructorName(selectedClass || {})}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0">
            {jitsiConfig && (
              <div className="w-full h-full border rounded-lg overflow-hidden">
                <iframe
                  src={`https://meet.jit.si/${jitsiConfig.roomName}`}
                  className="w-full h-full border-0"
                  allow="camera; microphone; display-capture; fullscreen"
                  allowFullScreen
                  title="Jitsi Meet Conference"
                />
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Room: {jitsiConfig?.roomName}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const joinUrl = `${window.location.origin}/student-dashboard/live-classes/${selectedClass?.streamSlug}`;
                  navigator.clipboard.writeText(joinUrl);
                  toast.success("Join link copied!");
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowJitsiDialog(false);
                  setJitsiConfig(null);
                }}
              >
                Leave Stream
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
