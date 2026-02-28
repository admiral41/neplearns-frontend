"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  ScreenShare, 
  Users, 
  MessageSquare,
  Settings,
  PhoneOff,
  Maximize,
  Minimize,
  Monitor
} from 'lucide-react';
import { toast } from 'sonner';

// Jitsi Meet API types
const JitsiMeetExternalAPI = typeof window !== 'undefined' ? window.JitsiMeetExternalAPI : null;

export default function JitsiMeet({ 
  config, 
  onLeave, 
  isModerator = false,
  showControls = true 
}) {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  
  const apiRef = useRef(null);
  const jitsiContainerRef = useRef(null);

  useEffect(() => {
    if (!JitsiMeetExternalAPI || !config?.roomName || !jitsiContainerRef.current) {
      return;
    }

    const options = {
      roomName: config.roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: config.displayName || 'Participant',
        email: config.email || '',
      },
      configOverwrite: {
        disableModeratorIndicator: false,
        startScreenSharing: false,
        enableEmailInStats: false,
        defaultLanguage: 'en',
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        enableClosePage: false,
        disableInviteFunctions: true,
        disableProfile: true,
        requireDisplayName: true,
        enableWelcomePage: false,
        enableNoAudioDetection: true,
        enableNoisyMicDetection: true,
        enableLayerSuspension: true,
        startAudioMuted: 0,
        startVideoMuted: 0,
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableFeaturesBasedOnToken: false,
        enableUserRolesBasedOnToken: false,
        disableRemoteMute: !isModerator,
        remoteVideoMenu: {
          disableKick: !isModerator,
          disableGrantModerator: !isModerator,
        },
        toolbarButtons: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 
          'fullscreen', 'fodeviceselection', 'hangup', 
          'profile', 'chat', 'recording', 'livestreaming', 
          'etherpad', 'sharedvideo', 'settings', 'raisehand',
          'videoquality', 'filmstrip', 'feedback', 'stats', 
          'shortcuts', 'tileview', 'videobackgroundblur', 
          'download', 'help', 'mute-everyone', 'security'
        ],
        hiddenPremeetingButtons: ['microphone', 'camera', 'select-background', 'invite'],
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_BACKGROUND: '#000000',
        DEFAULT_LOCAL_DISPLAY_NAME: 'Me',
        DEFAULT_REMOTE_DISPLAY_NAME: 'Participant',
        SHOW_BRAND_WATERMARK: false,
        SHOW_POWERED_BY: false,
        SHOW_PROMOTIONAL_CLOSE_PAGE: false,
        GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
        APP_NAME: 'EduLive',
        NATIVE_APP_NAME: 'EduLive',
        PROVIDER_NAME: 'EduLive Platform',
        LANG_DETECTION: false,
        INVITATION_POWERED_BY: false,
        DISABLE_FOCUS_INDICATOR: false,
        DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
        MOBILE_APP_PROMO: false,
        MAXIMUM_ZOOMING_COEFFICIENT: 1.0,
        TILE_VIEW_MAX_COLUMNS: 5,
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'profile', 'info', 'chat', 'recording',
          'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
          'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
          'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
        ],
        SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
        VIDEO_QUALITY_LABEL_DISABLED: false,
        SHOW_CHROME_EXTENSION_BANNER: false,
      },
      jwt: config.jwt || null,
    };

    try {
      apiRef.current = new JitsiMeetExternalAPI('meet.jit.si', options);

      // Event listeners
      apiRef.current.on('videoConferenceJoined', () => {
        toast.success('Joined livestream successfully!');
        
        // Set initial mute states
        apiRef.current.executeCommand('toggleAudio', isAudioMuted);
        apiRef.current.executeCommand('toggleVideo', isVideoMuted);
      });

      apiRef.current.on('videoConferenceLeft', () => {
        if (onLeave) {
          onLeave();
        }
      });

      apiRef.current.on('participantJoined', (participant) => {
        setParticipants(prev => [...prev, participant]);
      });

      apiRef.current.on('participantLeft', (participant) => {
        setParticipants(prev => prev.filter(p => p.id !== participant.id));
      });

      apiRef.current.on('screenSharingStatusChanged', (status) => {
        setIsScreenSharing(status);
      });

      apiRef.current.on('audioMuteStatusChanged', ({ muted }) => {
        setIsAudioMuted(muted);
      });

      apiRef.current.on('videoMuteStatusChanged', ({ muted }) => {
        setIsVideoMuted(muted);
      });

      apiRef.current.on('dominantSpeakerChanged', (participantId) => {
        setActiveSpeaker(participantId);
      });

      apiRef.current.on('readyToClose', () => {
        if (onLeave) {
          onLeave();
        }
      });

      apiRef.current.on('error', (error) => {
        console.error('Jitsi error:', error);
        toast.error('Error in livestream connection');
      });

    } catch (error) {
      console.error('Failed to initialize Jitsi Meet:', error);
      toast.error('Failed to load livestream. Please try again.');
    }

    // Cleanup
    return () => {
      if (apiRef.current) {
        try {
          apiRef.current.dispose();
        } catch (error) {
          console.error('Error disposing Jitsi API:', error);
        }
      }
    };
  }, [config.roomName]);

  const toggleAudio = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleAudio');
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleVideo');
      setIsVideoMuted(!isVideoMuted);
    }
  };

  const toggleScreenShare = () => {
    if (apiRef.current) {
      if (isScreenSharing) {
        apiRef.current.executeCommand('toggleShareScreen');
      } else {
        apiRef.current.executeCommand('toggleShareScreen');
      }
    }
  };

  const toggleFullscreen = () => {
    const container = document.getElementById('jitsi-container');
    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const leaveMeeting = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('hangup');
      if (onLeave) {
        onLeave();
      }
    }
  };

  const toggleTileView = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleTileView');
    }
  };

  const muteAll = () => {
    if (apiRef.current && isModerator) {
      apiRef.current.executeCommand('muteEveryone');
      toast.info('All participants muted');
    }
  };

  return (
    <div className="relative w-full h-full" id="jitsi-container">
      {/* Jitsi Container */}
      <div 
        ref={jitsiContainerRef} 
        className="w-full h-full"
        style={{ minHeight: '600px' }}
      />
      
      {/* Custom Controls Overlay */}
      {showControls && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg">
            <CardContent className="p-2">
              <div className="flex items-center gap-2">
                {/* Audio Control */}
                <Button
                  size="icon"
                  variant={isAudioMuted ? "destructive" : "secondary"}
                  onClick={toggleAudio}
                  className="rounded-full"
                >
                  {isAudioMuted ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
                
                {/* Video Control */}
                <Button
                  size="icon"
                  variant={isVideoMuted ? "destructive" : "secondary"}
                  onClick={toggleVideo}
                  className="rounded-full"
                >
                  {isVideoMuted ? (
                    <VideoOff className="h-4 w-4" />
                  ) : (
                    <Video className="h-4 w-4" />
                  )}
                </Button>
                
                {/* Screen Share */}
                <Button
                  size="icon"
                  variant={isScreenSharing ? "default" : "secondary"}
                  onClick={toggleScreenShare}
                  className="rounded-full"
                >
                  {isScreenSharing ? (
                    <Monitor className="h-4 w-4" />
                  ) : (
                    <ScreenShare className="h-4 w-4" />
                  )}
                </Button>
                
                {/* Participants */}
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full"
                  onClick={() => apiRef.current?.executeCommand('toggleFilmStrip')}
                >
                  <Users className="h-4 w-4" />
                  <span className="ml-1 text-xs">{participants.length}</span>
                </Button>
                
                {/* Chat */}
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full"
                  onClick={() => apiRef.current?.executeCommand('toggleChat')}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
                
                {/* Settings */}
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full"
                  onClick={() => apiRef.current?.executeCommand('openSettings')}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                
                {/* Fullscreen */}
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? (
                    <Minimize className="h-4 w-4" />
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                </Button>
                
                {/* Moderator Controls */}
                {isModerator && (
                  <>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full"
                      onClick={muteAll}
                    >
                      <MicOff className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full"
                      onClick={toggleTileView}
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                {/* Leave Button */}
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={leaveMeeting}
                  className="rounded-full"
                >
                  <PhoneOff className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Active Speaker Indicator */}
      {activeSpeaker && (
        <div className="absolute top-4 left-4 z-50">
          <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardContent className="p-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm">Speaking</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Connection Status */}
      <div className="absolute top-4 right-4 z-50">
        <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm">Connected</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}