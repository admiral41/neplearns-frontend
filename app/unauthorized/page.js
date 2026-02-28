"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldX, ArrowLeft, Home, LogIn } from "lucide-react";
import { useAuth } from "@/lib/providers/AuthProvider";
import { useSettings } from "@/lib/providers/SettingsProvider";

export default function UnauthorizedPage() {
  const { isAuthenticated, getDashboardPath, logout } = useAuth();
  const { getLogoUrl, getPlatformName } = useSettings();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#2d5a87] to-secondary relative overflow-hidden flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="unauthorized-pattern"
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
          <rect width="100%" height="100%" fill="url(#unauthorized-pattern)" />
        </svg>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-60 h-60 bg-primary/10 rounded-full blur-3xl" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-10 w-10 md:h-12 md:w-12 hover:scale-110 transition-transform">
              <img
                src={getLogoUrl()}
                alt={`${getPlatformName()} Logo`}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-white">{getPlatformName()}</span>
          </Link>
        </div>
      </div>

      {/* Unauthorized Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="shadow-2xl border-0">
          <CardContent className="flex flex-col items-center gap-6 py-12">
            <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <ShieldX className="h-14 w-14 text-red-600 dark:text-red-400" />
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Access Denied</h1>
              <p className="text-muted-foreground text-lg">
                You don't have permission to access this page.
              </p>
            </div>

            <div className="w-full space-y-3 pt-4">
              {isAuthenticated ? (
                <>
                  <Link href={getDashboardPath()} className="block w-full">
                    <Button className="w-full" size="lg">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Go to My Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={handleLogout}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Login with Different Account
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block w-full">
                    <Button className="w-full" size="lg">
                      <LogIn className="mr-2 h-4 w-4" />
                      Login to Continue
                    </Button>
                  </Link>
                </>
              )}

              <Link href="/" className="block w-full">
                <Button variant="ghost" className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              If you believe this is an error, please contact{" "}
              <a href="mailto:support@neplearns.com" className="text-primary hover:underline">
                support@neplearns.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
