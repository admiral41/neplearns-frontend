'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, differenceInMinutes } from 'date-fns';
import {
  Clock,
  BookOpen,
  Link as LinkIcon,
  Copy,
  Check,
  ExternalLink,
  Users,
  Calendar,
  Video,
  XCircle,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  scheduled: {
    label: 'Scheduled',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Calendar,
  },
  live: {
    label: 'Live Now',
    className: 'bg-green-500 text-white',
    icon: Video,
  },
  ended: {
    label: 'Ended',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: Check,
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircle,
  },
};

const PLATFORM_INFO = {
  zoom: {
    name: 'Zoom',
    icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968865.png',
  },
  google_meet: {
    name: 'Google Meet',
    icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968534.png',
  },
  microsoft_teams: {
    name: 'Microsoft Teams',
    icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968885.png',
  },
  custom: {
    name: 'Custom Meeting',
    icon: 'https://cdn-icons-png.flaticon.com/512/1055/1055644.png',
  },
};

export default function AdminLiveClassDetailDialog({
  liveClass,
  open,
  onOpenChange,
}) {
  const [copied, setCopied] = useState(false);

  if (!liveClass) return null;

  const scheduledAt = new Date(liveClass.scheduledStartTime);
  const endTime = liveClass.scheduledEndTime
    ? new Date(liveClass.scheduledEndTime)
    : new Date(scheduledAt.getTime() + 60 * 60000);

  const status = liveClass.status || 'scheduled';
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.scheduled;
  const StatusIcon = statusConfig.icon;

  const platform = PLATFORM_INFO[liveClass.meetingType] || PLATFORM_INFO.custom;
  const courseName = liveClass.course?.courseTitle || 'Unknown Course';

  // Get instructor info
  const instructor = liveClass.createdBy || liveClass.instructor;
  const instructorName = instructor
    ? `${instructor.firstname || ''} ${instructor.lastname || ''}`.trim()
    : 'Unknown Instructor';
  const instructorInitials = instructor
    ? `${instructor.firstname?.[0] || ''}${instructor.lastname?.[0] || ''}`.toUpperCase()
    : 'UI';

  const isLive = status === 'live';
  const isEnded = status === 'ended';

  const handleCopyLink = () => {
    if (liveClass.meetingUrl) {
      navigator.clipboard.writeText(liveClass.meetingUrl);
      setCopied(true);
      toast.success('Meeting link copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJoin = () => {
    if (liveClass.meetingUrl) {
      window.open(liveClass.meetingUrl, '_blank');
    }
  };

  const getDuration = () => {
    const minutes = differenceInMinutes(endTime, scheduledAt);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap pr-6">
            <span className="truncate">{liveClass.title}</span>
            <Badge variant="outline" className={statusConfig.className}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </DialogTitle>
          <DialogDescription>{courseName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Instructor Info */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={instructor?.profile_picture} />
              <AvatarFallback>{instructorInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium">{instructorName}</div>
              <div className="text-xs text-muted-foreground">Instructor</div>
            </div>
          </div>

          {/* Platform Info */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <img
              src={platform.icon}
              alt={platform.name}
              className="h-8 w-8"
            />
            <div>
              <div className="font-medium">{platform.name}</div>
              <div className="text-xs text-muted-foreground">
                Meeting Platform
              </div>
            </div>
          </div>

          {/* Schedule Info */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>
              {format(scheduledAt, "EEE, MMM d 'at' h:mm a")} -{' '}
              {format(endTime, 'h:mm a')}
            </span>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{getDuration()}</span>
          </div>

          {/* Attendees */}
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>
              {liveClass.participants?.filter((p) => !p.leftAt).length || 0}{' '}
              attendees
              {liveClass.totalViews > 0 && (
                <span className="text-muted-foreground ml-1">
                  ({liveClass.totalViews} total views)
                </span>
              )}
            </span>
          </div>

          {/* Meeting Link */}
          {liveClass.meetingUrl && (
            <div className="flex items-center gap-2 text-sm">
              <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <a
                href={liveClass.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate max-w-[200px]"
              >
                Meeting Link
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          )}

          {/* Description */}
          {liveClass.description && (
            <p className="text-sm text-muted-foreground italic border-l-2 pl-3">
              {liveClass.description}
            </p>
          )}

          {/* Live indicator */}
          {isLive && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-center gap-2 p-2 bg-green-50 dark:bg-green-950/30 rounded-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  Session is Live
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          {liveClass.meetingUrl && (isLive || status === 'scheduled') && (
            <div className="pt-2 border-t">
              <Button className="w-full" size="sm" onClick={handleJoin}>
                <ExternalLink className="h-4 w-4 mr-1" />
                Open Meeting
              </Button>
            </div>
          )}

          {/* Recording link for ended sessions */}
          {isEnded && liveClass.recordingUrl && (
            <div className="pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => window.open(liveClass.recordingUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View Recording
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
