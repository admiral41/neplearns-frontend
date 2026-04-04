"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { useVerifyEmail } from "@/lib/hooks/useAuth";
import { useSettings } from "@/lib/providers/SettingsProvider";

export default function VerifyEmailPage() {
  const params = useParams();
  const { id, code } = params;
  const [status, setStatus] = useState("verifying"); // 'verifying' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");
  const { getLogoUrl, getPlatformName } = useSettings();

  const verifyEmailMutation = useVerifyEmail();

  useEffect(() => {
    if (id && code) {
      verifyEmailMutation.mutate(
        { id, code },
        {
          onSuccess: () => {
            setStatus("success");
          },
          onError: (error) => {
            setStatus("error");
            setErrorMessage(error.message || "Verification failed. The link may be invalid or expired.");
          },
        }
      );
    } else {
      setStatus("error");
      setErrorMessage("Invalid verification link.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, code]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#2d5a87] to-secondary relative overflow-hidden flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="verify-pattern"
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
          <rect width="100%" height="100%" fill="url(#verify-pattern)" />
        </svg>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-60 h-60 bg-primary/10 rounded-full blur-3xl" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {/* <div className="relative h-10 w-10 md:h-12 md:w-12 hover:scale-110 transition-transform">
              <img
                src={getLogoUrl()}
                alt={`${getPlatformName()} Logo`}
                className="w-full h-full object-contain"
              />
            </div> */}
            <span className="text-2xl font-bold text-white">{getPlatformName()}</span>
          </Link>
        </div>
      </div>

      {/* Verification Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Email Verification</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 py-8">
            {status === "verifying" && (
              <>
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <div className="text-center">
                  <p className="text-lg font-medium">Verifying your email...</p>
                  <p className="text-muted-foreground mt-2">Please wait a moment.</p>
                </div>
              </>
            )}

            {status === "success" && (
              <>
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                    Email Verified!
                  </p>
                  <p className="text-muted-foreground mt-2">
                    Your email has been verified successfully. You can now login to your account.
                  </p>
                </div>
                <Link href="/login" className="w-full">
                  <Button className="w-full" size="lg">
                    Go to Login
                  </Button>
                </Link>
              </>
            )}

            {status === "error" && (
              <>
                <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-red-600 dark:text-red-400">
                    Verification Failed
                  </p>
                  <p className="text-muted-foreground mt-2">{errorMessage}</p>
                </div>
                <div className="flex flex-col gap-3 w-full">
                  <Link href="/login" className="w-full">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Go to Login
                    </Button>
                  </Link>
                  <Link href="/student-registration" className="w-full">
                    <Button variant="ghost" className="w-full">
                      Register Again
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
