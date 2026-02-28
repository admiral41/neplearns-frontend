"use client";

import { useEffect } from 'react';

export default function JitsiScriptLoader() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => {
      // Jitsi Meet API loaded
    };
    script.onerror = () => {
      console.error('Failed to load Jitsi Meet API');
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}