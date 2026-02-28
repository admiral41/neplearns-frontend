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
import { format, parseISO, differenceInMinutes } from 'date-fns';
import {
  Clock,
  BookOpen,
  Link as LinkIcon,
  Copy,
  Check,
  Pencil,
  Loader2,
  Play,
  Square,
  ExternalLink,
  Users,
  Calendar,
  Video,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { livestreamAPI } from '@/lib/api/livestream';
import { useAlertDialog } from '@/components/ui/alert-dialog-provider';

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

export default function LiveClassDetailDialog({
  liveClass,
  open,
  onOpenChange,
  onEdit,
  onRefresh,
}) {
  const { showAlert } = useAlertDialog();
  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  if (!liveClass) return null;

  const scheduledAt = new Date(liveClass.scheduledStartTime);
  const endTime = liveClass.scheduledEndTime
    ? new Date(liveClass.scheduledEndTime)
    : new Date(scheduledAt.getTime() + 60 * 60000); // Default 1 hour

  const status = liveClass.status || 'scheduled';
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.scheduled;
  const StatusIcon = statusConfig.icon;

  const platform = PLATFORM_INFO[liveClass.meetingType] || PLATFORM_INFO.custom;
  const courseName = liveClass.course?.courseTitle || 'Unknown Course';

  const isScheduled = status === 'scheduled';
  const isLive = status === 'live';
  const isEnded = status === 'ended';
  const isCancelled = status === 'cancelled';

  const handleCopyLink = () => {
    if (liveClass.meetingUrl) {
      navigator.clipboard.writeText(liveClass.meetingUrl);
      setCopied(true);
      toast.success('Meeting link copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await livestreamAPI.startLivestream(liveClass.streamSlug);
      toast.success('Live class started!');
      onRefresh?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(error.message || 'Failed to start live class');
    } finally {
      setIsStarting(false);
    }
  };

  const handleEnd = async () => {
    showAlert({
      title: 'End Live Class',
      description: `Are you sure you want to end "${liveClass.title}"?`,
      confirmText: 'End Class',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        setIsEnding(true);
        try {
          await livestreamAPI.endLivestream(liveClass.streamSlug);
          toast.success('Live class ended!');
          onRefresh?.();
          onOpenChange(false);
        } catch (error) {
          toast.error(error.message || 'Failed to end live class');
        } finally {
          setIsEnding(false);
        }
      },
    });
  };

  const handleCancel = async () => {
    showAlert({
      title: 'Cancel Live Class',
      description: `Are you sure you want to cancel "${liveClass.title}"? Students will be notified.`,
      confirmText: 'Cancel Class',
      cancelText: 'Go Back',
      variant: 'destructive',
      onConfirm: async () => {
        setIsCancelling(true);
        try {
          await livestreamAPI.deleteLivestream(liveClass.streamSlug);
          toast.success('Live class cancelled!');
          onRefresh?.();
          onOpenChange(false);
        } catch (error) {
          toast.error(error.message || 'Failed to cancel live class');
        } finally {
          setIsCancelling(false);
        }
      },
    });
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

          {/* Attendees (for live/ended) */}
          {(isLive || isEnded) && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>
                {liveClass.participants?.filter((p) => !p.leftAt).length || 0}{' '}
                attendees
              </span>
            </div>
          )}

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
                Join Meeting
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

          {/* Actions based on status */}
          {isScheduled && (
            <div className="pt-2 border-t space-y-2">
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                size="sm"
                onClick={handleStart}
                disabled={isStarting}
              >
                {isStarting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Play className="h-4 w-4 mr-1" />
                )}
                Start Class
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Start early so students can join now
              </p>
            </div>
          )}

          {isLive && (
            <div className="pt-2 border-t space-y-2">
              <div className="flex gap-2">
                <Button className="flex-1" size="sm" onClick={handleJoin}>
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Join Meeting
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={handleEnd}
                  disabled={isEnding}
                >
                  {isEnding ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Square className="h-3 w-3 mr-1 fill-current" />
                  )}
                  End Class
                </Button>
              </div>
            </div>
          )}

          {/* Edit / Cancel for scheduled */}
          {isScheduled && (
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  onEdit?.(liveClass);
                  onOpenChange(false);
                }}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-1" />
                )}
                Cancel
              </Button>
            </div>
          )}

          {/* View recording for ended */}
          {isEnded && liveClass.recordingUrl && (
            <div className="pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  window.open(liveClass.recordingUrl, '_blank')
                }
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
