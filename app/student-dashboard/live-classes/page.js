"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw, 
  Video, 
  Clock, 
  User, 
  Copy, 
  Calendar, 
  BookOpen, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  PlayCircle, 
  Loader2, 
  Users, 
  Timer, 
  CalendarDays, 
  ArrowLeft,
  Globe,
  Lock,
  Eye,
  ExternalLink,
  Key
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { livestreamAPI } from "@/lib/api/livestream";
import { courseAPI } from "@/lib/api/courses";
import { format, parseISO, differenceInMinutes, formatDistanceToNow } from "date-fns";

export default function StudentLivestreamsPage() {
  const [selectedStream, setSelectedStream] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [livestreams, setLivestreams] = useState({
    upcoming: [],
    live: [],
    past: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [meetingInfo, setMeetingInfo] = useState(null);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      fetchLivestreams();
    }
  }, [enrolledCourses, activeTab]);

  const fetchEnrolledCourses = async () => {
    try {
      const response = await courseAPI.getMyCourses({ type: 'enrolled' });
      setEnrolledCourses(response.data || []);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      toast.error('Failed to load enrolled courses');
    }
  };

  const fetchLivestreams = async () => {
    setIsLoading(true);
    try {
      const allStreams = [];
      for (const course of enrolledCourses) {
        try {
          const response = await livestreamAPI.getLivestreamsByCourse(course._id, {
            status: 'all'
          });
          if (response.data) {
            const streamsWithCourse = response.data.map(stream => ({
              ...stream,
              courseTitle: course.courseTitle,
              courseSlug: course.courseSlug,
              courseImage: course.image
            }));
            allStreams.push(...streamsWithCourse);
          }
        } catch (error) {
          console.error(`Error fetching livestreams for course ${course.courseTitle}:`, error);
        }
      }

      const now = new Date();
      const upcoming = [];
      const live = [];
      const past = [];

      allStreams.forEach(stream => {
        const scheduledDate = new Date(stream.scheduledStartTime);

        if (stream.status === 'live') {
          live.push(stream);
        } else if (stream.status === 'scheduled' && scheduledDate > now) {
          upcoming.push(stream);
        } else {
          past.push(stream);
        }
      });

      upcoming.sort((a, b) => new Date(a.scheduledStartTime) - new Date(b.scheduledStartTime));
      past.sort((a, b) => new Date(b.scheduledStartTime) - new Date(a.scheduledStartTime));

      setLivestreams({ upcoming, live, past });
    } catch (error) {
      console.error('Error fetching livestreams:', error);
      toast.error('Failed to load livestreams');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinStream = async (stream) => {
    try {
      setIsJoining(true);
      setSelectedStream(stream);
      
      const response = await livestreamAPI.joinLivestream(stream.streamSlug);
      const { meetingInfo } = response.data || {};
      
      if (meetingInfo) {
        setMeetingInfo(meetingInfo);
        setShowMeetingDialog(true);
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

  const handleCopyMeetingLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Meeting link copied to clipboard!");
    } catch (error) {
      console.error('Error copying meeting link:', error);
      toast.error("Failed to copy meeting link");
    }
  };

  const handleOpenMeeting = () => {
    if (meetingInfo?.url) {
      window.open(meetingInfo.url, '_blank');
      setShowMeetingDialog(false);
    }
  };

  const getStatusBadge = (stream) => {
    const now = new Date();
    const startTime = new Date(stream.scheduledStartTime);

    switch (stream.status) {
      case 'scheduled':
        if (startTime < now) {
          return (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              Starting Soon
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Calendar className="h-3 w-3 mr-1" />
            Scheduled
          </Badge>
        );
      case 'live':
        return (
          <Badge className="bg-green-500 animate-pulse">
            <PlayCircle className="h-3 w-3 mr-1" />
            Live Now
          </Badge>
        );
      case 'ended':
        return (
          <Badge variant="secondary">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ended
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getAccessBadge = (stream) => {
    if (stream.isPublic) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Globe className="h-3 w-3 mr-1" />
          Public
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        <Lock className="h-3 w-3 mr-1" />
        Enrolled Only
      </Badge>
    );
  };

  const getMeetingPlatformInfo = (stream) => {
    switch(stream.meetingType) {
      case 'zoom':
        return {
          name: 'Zoom',
          icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968865.png',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        };
      case 'google_meet':
        return {
          name: 'Google Meet',
          icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968534.png',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        };
      case 'microsoft_teams':
        return {
          name: 'Microsoft Teams',
          icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968885.png',
          color: 'text-blue-700',
          bgColor: 'bg-blue-50'
        };
      default:
        return {
          name: 'Custom Meeting',
          icon: 'https://cdn-icons-png.flaticon.com/512/1055/1055644.png',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
        };
    }
  };

  const getTimeStatus = (stream) => {
    const now = new Date();
    const startTime = new Date(stream.scheduledStartTime);
    
    if (stream.status === 'live') {
      return "Live Now";
    }
    
    if (stream.status === 'scheduled') {
      if (startTime < now) {
        return "Starting soon";
      }
      return formatDistanceToNow(startTime, { addSuffix: true });
    }
    
    return format(startTime, 'PPpp');
  };

  const formatDateTime = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM dd, yyyy • hh:mm a');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const tabs = [
    { id: "live", label: "Live Now", count: livestreams.live.length, icon: PlayCircle },
    { id: "upcoming", label: "Upcoming", count: livestreams.upcoming.length, icon: CalendarDays },
    { id: "past", label: "Past Streams", count: livestreams.past.length, icon: Clock },
  ];

  const filteredStreams = activeTab === "upcoming" ? livestreams.upcoming : 
                         activeTab === "live" ? livestreams.live : 
                         livestreams.past;

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-lg sm:text-xl font-bold mb-2">Live Classes</h1>
          <p className="text-muted-foreground">Join live classes from your enrolled courses</p>
        </div>

        {enrolledCourses.length === 0 ? (
          <Card className="mb-6">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Enrolled Courses</h3>
              <p className="text-muted-foreground mb-4">You need to enroll in courses to access their live classes</p>
              <Button onClick={() => window.location.href = '/student-dashboard/courses'}>
                Browse Courses
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Your Courses</h3>
                    <p className="text-sm text-muted-foreground">
                      {enrolledCourses.length} course{enrolledCourses.length !== 1 ? 's' : ''} • 
                      {livestreams.upcoming.length + livestreams.live.length + livestreams.past.length} total classes
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={fetchLivestreams}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <Button 
                  key={tab.id} 
                  variant={activeTab === tab.id ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setActiveTab(tab.id)}
                  className="shrink-0"
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                  <Badge variant={activeTab === tab.id ? "secondary" : "outline"} className="ml-2">
                    {tab.count}
                  </Badge>
                </Button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredStreams.length === 0 ? (
              <div className="text-center py-12">
                <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No classes found</h3>
                <p className="text-muted-foreground">
                  {activeTab === 'upcoming' && "No upcoming live classes in your enrolled courses"}
                  {activeTab === 'live' && "No live classes happening right now"}
                  {activeTab === 'past' && "No past live classes found"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredStreams.map((stream) => {
                  const platform = getMeetingPlatformInfo(stream);
                  return (
                    <Card key={stream._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className={`${platform.bgColor} ${platform.color} border-0`}>
                                  <img src={platform.icon} alt={platform.name} className="h-3 w-3 mr-1" />
                                  {platform.name}
                                </Badge>
                                {getAccessBadge(stream)}
                              </div>
                              <h3 className="font-semibold text-base mb-2">{stream.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {stream.courseTitle}
                              </p>
                              {stream.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {stream.description}
                                </p>
                              )}
                            </div>
                            <div className="shrink-0">{getStatusBadge(stream)}</div>
                          </div>

                          {/* Stream Details */}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <User className="h-4 w-4" />
                              <span className="truncate">
                                {stream.lecturers?.[0]?.user?.firstname || 'Instructor'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>{stream.participants?.filter(p => !p.leftAt).length || 0} online</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDateTime(stream.scheduledStartTime)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Timer className="h-4 w-4" />
                              <span>{getTimeStatus(stream)}</span>
                            </div>
                          </div>

                          {/* Statistics */}
                          {stream.status !== 'scheduled' && (
                            <div className="flex items-center gap-4 pt-2 border-t text-xs text-muted-foreground">
                              <span>👁️ {stream.totalViews || 0} views</span>
                              <span>👥 Peak: {stream.peakViewers || 0}</span>
                              {stream.recordingUrl && (
                                <span className="flex items-center gap-1">
                                  <Video className="h-3 w-3" />
                                  Recording available
                                </span>
                              )}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            {(stream.status === 'live' || stream.status === 'scheduled') && (
                              <>
                                <Button 
                                  size="sm" 
                                  className="flex-1" 
                                  onClick={() => handleJoinStream(stream)}
                                  disabled={isJoining}
                                >
                                  {isJoining ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                  )}
                                  {stream.status === 'live' ? 'Join Meeting' : 'Preview'}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleCopyMeetingLink(stream.meetingUrl)}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Link
                                </Button>
                              </>
                            )}
                            {stream.status === 'ended' && stream.recordingUrl && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => window.open(stream.recordingUrl, '_blank')}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Recording
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Meeting Info Dialog */}
        {meetingInfo && (
          <Dialog open={showMeetingDialog} onOpenChange={setShowMeetingDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Join Meeting
                </DialogTitle>
                <DialogDescription>
                  {selectedStream?.title}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <img src={meetingInfo.icon} alt={meetingInfo.platform} className="h-8 w-8" />
                  <div>
                    <div className="font-medium">{meetingInfo.platform}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedStream?.courseTitle}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Meeting Information</Label>
                  <div className="text-sm space-y-1">
                    {meetingInfo.id && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Meeting ID:</span>
                        <span className="font-mono">{meetingInfo.id}</span>
                      </div>
                    )}
                    
                    {meetingInfo.hasPassword && (
                      <div className="flex items-center gap-2">
                        <Key className="h-3 w-3" />
                        <span>Password protected</span>
                      </div>
                    )}
                    
                    {meetingInfo.instructions && (
                      <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                        {meetingInfo.instructions}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>You're joining as</Label>
                  <div className="text-sm">
                    {meetingInfo.user?.name} ({meetingInfo.user?.email})
                  </div>
                </div>
              </div>
              
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShowMeetingDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleOpenMeeting}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in {meetingInfo.platform}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}