"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Loader2, 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Users,
  MessageSquare,
  ScreenShare,
  X,
  Maximize2,
  Minimize2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function ZoomEmbeddedClient({ 
  meetingNumber, 
  passcode, 
  userName, 
  userEmail,
  role = 0, // 0 = participant, 1 = host
  onLeave,
  onError 
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [meetingActive, setMeetingActive] = useState(false);
  const [zoomSDKError, setZoomSDKError] = useState(false);
  
  const meetingContainerRef = useRef(null);
  const zoomContainerRef = useRef(null);

  // Initialize Zoom SDK
  const initZoom = async () => {
    try {
      // Check if SDK is available
      if (typeof window !== 'undefined') {
        // Dynamically load Zoom SDK
        const script = document.createElement('script');
        script.src = 'https://source.zoom.us/2.18.0/lib/vendor/react.min.js';
        script.async = true;
        document.head.appendChild(script);
        
        const script2 = document.createElement('script');
        script2.src = 'https://source.zoom.us/2.18.0/lib/vendor/react-dom.min.js';
        script2.async = true;
        document.head.appendChild(script2);
        
        const script3 = document.createElement('script');
        script3.src = 'https://source.zoom.us/2.18.0/lib/vendor/redux.min.js';
        script3.async = true;
        document.head.appendChild(script3);
        
        const script4 = document.createElement('script');
        script4.src = 'https://source.zoom.us/2.18.0/lib/vendor/redux-thunk.min.js';
        script4.async = true;
        document.head.appendChild(script4);
        
        const script5 = document.createElement('script');
        script5.src = 'https://source.zoom.us/2.18.0/lib/vendor/lodash.min.js';
        script5.async = true;
        document.head.appendChild(script5);
        
        const script6 = document.createElement('script');
        script6.src = 'https://source.zoom.us/zoom-meeting-2.18.0.min.js';
        script6.async = true;
        script6.onload = () => {
          setIsInitialized(true);
        };
        script6.onerror = () => {
          setZoomSDKError(true);
          setIsLoading(false);
        };
        document.head.appendChild(script6);
      }
      
    } catch (error) {
      setZoomSDKError(true);
      setIsLoading(false);
      if (onError) onError(error);
    }
  };

  // Join Meeting
  const joinMeeting = async () => {
    if (!meetingNumber || !passcode || !window.ZoomMtg) {
      toast.error('Meeting information is missing or SDK not loaded');
      return;
    }

    try {
      setIsLoading(true);
      
      // Configure Zoom SDK
      window.ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.0/lib', '/av');
      window.ZoomMtg.preLoadWasm();
      window.ZoomMtg.prepareWebSDK();
      
      // Configuration
      const config = {
        leaveUrl: window.location.href,
        success: () => {
          setMeetingActive(true);
          setIsLoading(false);
        },
        error: (error) => {
          toast.error('Failed to join meeting');
          setIsLoading(false);
          setZoomSDKError(true);
          if (onError) onError(error);
        }
      };

      // For demo purposes - in production you need to generate signature server-side
      // You'll need to implement a backend endpoint to generate Zoom signatures
      const signature = ''; // Should be generated server-side
      const apiKey = process.env.NEXT_PUBLIC_ZOOM_CLIENT_ID || 'demo_key';
      
      // Meeting configuration
      const meetingConfig = {
        meetingNumber,
        userName: userName || 'Student',
        signature,
        apiKey,
        passcode,
        role: role || 0,
        userEmail: userEmail || '',
        lang: 'en-US',
        china: false
      };

      // Initialize and join
      window.ZoomMtg.init(config);
      
      // Check for meeting container
      if (!meetingContainerRef.current) {
        const container = document.createElement('div');
        container.id = 'zmmtg-root';
        container.style.cssText = 'width: 100%; height: 100%; background: #000;';
        meetingContainerRef.current = container;
        document.getElementById('zoom-meeting-container')?.appendChild(container);
      }
      
      window.ZoomMtg.join(meetingConfig);

    } catch (error) {
      toast.error('Failed to join meeting');
      setIsLoading(false);
      setZoomSDKError(true);
      if (onError) onError(error);
    }
  };

  // Leave Meeting
  const leaveMeeting = () => {
    if (window.ZoomMtg && meetingActive) {
      window.ZoomMtg.leaveMeeting();
      setMeetingActive(false);
    }
    // Clean up
    const root = document.getElementById('zmmtg-root');
    if (root) {
      root.innerHTML = '';
    }
    if (onLeave) onLeave();
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!zoomContainerRef.current) return;
    
    if (!isFullscreen) {
      if (zoomContainerRef.current.requestFullscreen) {
        zoomContainerRef.current.requestFullscreen();
      } else if (zoomContainerRef.current.webkitRequestFullscreen) {
        zoomContainerRef.current.webkitRequestFullscreen();
      } else if (zoomContainerRef.current.msRequestFullscreen) {
        zoomContainerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    
    setIsFullscreen(!isFullscreen);
  };

  // Initialize on mount
  useEffect(() => {
    initZoom();
    
    return () => {
      if (window.ZoomMtg && meetingActive) {
        window.ZoomMtg.leaveMeeting();
      }
    };
  }, []);

  // Join meeting when SDK is initialized
  useEffect(() => {
    if (isInitialized && meetingNumber && passcode) {
      joinMeeting();
    }
  }, [isInitialized, meetingNumber, passcode]);

  // Listen for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (zoomSDKError) {
    return (
      <Card className="h-full">
        <CardContent className="p-6 flex flex-col items-center justify-center h-full">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Zoom SDK Error</h3>
          <p className="text-center text-muted-foreground mb-4">
            Unable to load Zoom meeting. Please try joining with the Zoom app instead.
          </p>
          <Button 
            onClick={() => {
              if (onError) onError(new Error('Zoom SDK failed to load'));
            }}
          >
            Use Zoom App
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
      {/* Meeting Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Video className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold">Live Class</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{participantCount} participants</span>
              {meetingActive && (
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {meetingActive && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={leaveMeeting}
              >
                <X className="h-4 w-4 mr-1" />
                Leave
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Meeting Container */}
      <CardContent className="flex-1 p-0 overflow-hidden" ref={zoomContainerRef}>
        <div className="relative h-full bg-black">
          {/* Zoom Meeting Container */}
          <div 
            id="zoom-meeting-container"
            className="absolute inset-0 bg-black"
          >
            {/* Zoom SDK will render meeting here */}
          </div>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  {isInitialized ? 'Joining meeting...' : 'Initializing video...'}
                </p>
              </div>
            </div>
          )}

          {/* Controls Overlay */}
          {meetingActive && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center z-20">
              <div className="flex items-center gap-2 p-3 bg-background/90 backdrop-blur-sm rounded-full shadow-lg">
                <Button
                  variant={isMuted ? "destructive" : "outline"}
                  size="icon"
                  className="rounded-full"
                  onClick={() => {
                    if (window.ZoomMtg) {
                      if (isMuted) {
                        window.ZoomMgt?.unmuteAudio?.();
                      } else {
                        window.ZoomMgt?.muteAudio?.();
                      }
                      setIsMuted(!isMuted);
                    }
                  }}
                >
                  {isMuted ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  variant={isVideoOn ? "default" : "outline"}
                  size="icon"
                  className="rounded-full"
                  onClick={() => {
                    if (window.ZoomMtg) {
                      if (isVideoOn) {
                        window.ZoomMgt?.stopVideo?.();
                      } else {
                        window.ZoomMgt?.startVideo?.();
                      }
                      setIsVideoOn(!isVideoOn);
                    }
                  }}
                >
                  {isVideoOn ? (
                    <Video className="h-4 w-4" />
                  ) : (
                    <VideoOff className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  variant={isScreenSharing ? "default" : "outline"}
                  size="icon"
                  className="rounded-full"
                  onClick={() => {
                    if (window.ZoomMtg) {
                      if (isScreenSharing) {
                        window.ZoomMgt?.stopShareScreen?.();
                      } else {
                        window.ZoomMgt?.shareScreen?.();
                      }
                      setIsScreenSharing(!isScreenSharing);
                    }
                  }}
                >
                  <ScreenShare className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => {
                    // Open chat
                    if (window.ZoomMtg) {
                      window.ZoomMgt?.openChatWindow?.();
                    }
                  }}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Join Meeting Button (if not active) */}
          {!meetingActive && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="text-center p-8 bg-background rounded-lg shadow-lg max-w-md">
                <Video className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Ready to Join?</h3>
                <p className="text-muted-foreground mb-6">
                  Click the button below to join the live class meeting.
                </p>
                <Button 
                  size="lg" 
                  onClick={joinMeeting}
                  disabled={!isInitialized}
                >
                  {isInitialized ? 'Join Meeting' : 'Initializing...'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}