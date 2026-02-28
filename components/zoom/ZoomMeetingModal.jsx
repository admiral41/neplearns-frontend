"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Video, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ZoomMeetingModal({
  open,
  onOpenChange,
  meetingData,
  userData
}) {
  const [isJoining, setIsJoining] = useState(false);

  if (!meetingData || !userData) return null;

  // Extract meeting number from Zoom join URL
  const extractMeetingNumber = (url) => {
    try {
      if (!url) return null;
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const meetingId = pathParts[pathParts.length - 1];
      return meetingId;
    } catch (error) {
      console.error('Failed to parse Zoom URL:', error);
      return null;
    }
  };

  // Extract passcode from Zoom join URL
  const extractPasscode = (url) => {
    try {
      if (!url) return '';
      const urlObj = new URL(url);
      const searchParams = new URLSearchParams(urlObj.search);
      return searchParams.get('pwd') || '';
    } catch (error) {
      console.error('Failed to extract passcode:', error);
      return '';
    }
  };

  const meetingNumber = extractMeetingNumber(meetingData.joinUrl) || meetingData.meetingNumber;
  const passcode = extractPasscode(meetingData.joinUrl) || meetingData.passcode;

  const handleJoinInBrowser = () => {
    if (!meetingNumber || !passcode) {
      toast.error('Invalid meeting information');
      return;
    }
    setIsJoining(true);
    // This would trigger the embedded Zoom client
    // For now, we'll open in external window
    if (meetingData.joinUrl) {
      window.open(meetingData.joinUrl, '_blank');
      onOpenChange(false);
    }
  };

  const handleJoinInApp = () => {
    if (meetingData.joinUrl) {
      window.open(meetingData.joinUrl, '_blank');
      onOpenChange(false);
    } else {
      toast.error('No meeting link available');
    }
  };

  const handleCopyLink = () => {
    if (meetingData.joinUrl) {
      navigator.clipboard.writeText(meetingData.joinUrl);
      toast.success('Meeting link copied to clipboard!');
    }
  };

  const getStatusBadge = () => {
    const now = new Date();
    const scheduledDate = new Date(meetingData.scheduledDateTime);
    
    switch (meetingData.status) {
      case 'live':
        return (
          <Badge className="bg-green-500 animate-pulse">
            <Video className="h-3 w-3 mr-1" />
            Live Now
          </Badge>
        );
      case 'scheduled':
        if (scheduledDate > now) {
          return (
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              <Calendar className="h-3 w-3 mr-1" />
              Scheduled
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700">
            <AlertCircle className="h-3 w-3 mr-1" />
            Ready to Start
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="secondary">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
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
        return null;
    }
  };

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            {meetingData.title}
          </DialogTitle>
          <DialogDescription>
            {meetingData.courseTitle} • {meetingData.lecturerName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Meeting Status Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                {getStatusBadge()}
                <div className="text-sm text-muted-foreground">
                  {meetingData.duration} minutes
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Schedule</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDateTime(meetingData.scheduledDateTime)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Attendance</div>
                    <div className="text-sm text-muted-foreground">
                      {meetingData.attendees || 0} students attending
                    </div>
                  </div>
                </div>
                
                {meetingData.description && (
                  <div className="pt-4 border-t">
                    <div className="font-medium mb-2">Description</div>
                    <p className="text-sm text-muted-foreground">
                      {meetingData.description}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Join Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Join Options</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Browser Option */}
              <Card className="hover:border-primary transition-colors">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl">🌐</span>
                    </div>
                    <h4 className="font-semibold mb-2">Join in Browser</h4>
                    <p className="text-sm text-muted-foreground">
                      Join directly in your web browser. No download required.
                    </p>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={handleJoinInBrowser}
                    disabled={meetingData.status === 'cancelled' || meetingData.status === 'completed'}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Join in Browser
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Works best with Chrome, Firefox, or Edge
                  </p>
                </CardContent>
              </Card>

              {/* Zoom App Option */}
              <Card className="hover:border-blue-500 transition-colors">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="bg-blue-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl">📱</span>
                    </div>
                    <h4 className="font-semibold mb-2">Use Zoom App</h4>
                    <p className="text-sm text-muted-foreground">
                      Open in Zoom desktop or mobile app for full features.
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={handleJoinInApp}
                    disabled={meetingData.status === 'cancelled'}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Open in Zoom App
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Recommended for best experience
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Actions */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="flex-1 min-w-[150px]"
            >
              Copy Meeting Link
            </Button>
            
            {meetingData.status === 'completed' && meetingData.recordingAvailable && (
              <Button
                variant="outline"
                onClick={() => {
                  toast.info('Recording access would be implemented here');
                }}
                className="flex-1 min-w-[150px]"
              >
                View Recording
              </Button>
            )}
            
            {meetingData.status === 'scheduled' && (
              <Button
                variant="outline"
                onClick={() => {
                  // Add to calendar functionality
                  toast.info('Add to calendar feature would be implemented here');
                }}
                className="flex-1 min-w-[150px]"
              >
                Add to Calendar
              </Button>
            )}
          </div>

          {/* Browser Requirements */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <h4 className="font-medium text-blue-900 mb-1">Browser Requirements</h4>
                  <ul className="text-blue-800 space-y-1">
                    <li>• Use Chrome, Firefox, Edge, or Safari (latest versions)</li>
                    <li>• Enable microphone and camera permissions</li>
                    <li>• Stable internet connection required</li>
                    <li>• Allow pop-ups for this website</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}