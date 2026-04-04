"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, Home, LogOut, Mail, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/providers/AuthProvider";
import { useSettings } from "@/lib/providers/SettingsProvider";

export default function InstructorRejectedPage() {
  const { user, logout } = useAuth();
  const { getLogoUrl, getPlatformName } = useSettings();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#2d5a87] to-secondary relative overflow-hidden flex items-center justify-center px-4 py-16 sm:py-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="rejected-pattern"
              x="0"
              y="0"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"
                fill="white"
                fillOpacity="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#rejected-pattern)" />
        </svg>
      </div>

      {/* Decorative Elements - Hidden on mobile */}
      <div className="hidden sm:block absolute top-20 right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
      <div className="hidden sm:block absolute bottom-20 left-10 w-60 h-60 bg-primary/10 rounded-full blur-3xl" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {/* <div className="relative h-8 w-8 sm:h-10 sm:w-10 hover:scale-110 transition-transform">
              <img
                src={getLogoUrl()}
                alt={`${getPlatformName()} Logo`}
                className="w-full h-full object-contain"
              />
            </div> */}
            <span className="text-lg sm:text-xl font-bold text-white">{getPlatformName()}</span>
          </Link>
        </div>
      </div>

      {/* Rejected Card */}
      <div className="relative z-10 w-full max-w-md">
        <Card className="shadow-2xl border-0">
          <CardContent className="flex flex-col items-center gap-4 sm:gap-5 p-5 sm:p-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XCircle className="h-8 w-8 sm:h-10 sm:w-10 text-red-600 dark:text-red-400" />
            </div>

            <div className="text-center space-y-1.5">
              <h1 className="text-lg sm:text-xl font-bold">Application Not Approved</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Hi {user?.firstname || "there"}, unfortunately your application was not approved.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 sm:p-4 w-full">
              <h3 className="font-semibold text-sm sm:text-base mb-2">Common reasons:</h3>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                <li>- Incomplete or unclear CV/credentials</li>
                <li>- Qualifications didn't match our needs</li>
                <li>- Missing required teaching experience</li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 w-full">
              <h3 className="font-semibold text-sm sm:text-base mb-1 text-blue-700 dark:text-blue-300">Don't give up!</h3>
              <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                You can update your application and resubmit anytime. Contact us for feedback before reapplying.
              </p>
            </div>

            <div className="w-full space-y-2 sm:space-y-3 pt-2">
              <a href="mailto:support@neplearns.com?subject=Instructor Application Feedback" className="block w-full">
                <Button className="w-full" size="default">
                  <Mail className="mr-2 h-4 w-4" />
                  Request Feedback
                </Button>
              </a>

              <Link href="/instructor-application" className="block w-full">
                <Button variant="outline" className="w-full" size="default">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Update & Resubmit Application
                </Button>
              </Link>

              <Link href="/" className="block w-full">
                <Button variant="ghost" className="w-full" size="default">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>

              <Button
                variant="ghost"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                size="default"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
