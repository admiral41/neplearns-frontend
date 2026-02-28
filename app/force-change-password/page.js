"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertTriangle, CheckCircle, Loader2, ShieldAlert } from "lucide-react";
import { useForceChangePassword, getDashboardPath } from "@/lib/hooks/useAuth";
import { useAuth } from "@/lib/providers/AuthProvider";
import { useSettings } from "@/lib/providers/SettingsProvider";
import { toast } from "sonner";

export default function ForceChangePasswordPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated, updateUser } = useAuth();
  const { getLogoUrl, getPlatformName } = useSettings();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const forceChangePasswordMutation = useForceChangePassword();

  // Redirect away if user doesn't need to change password
  useEffect(() => {
    if (!authLoading && isAuthenticated && user && !user.forcePasswordReset) {
      // User doesn't need to change password, redirect to dashboard
      router.push(getDashboardPath(user.roles, user.lecturerStatus));
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const validateForm = () => {
    const newErrors = {};

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!passwordRegex.test(password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    forceChangePasswordMutation.mutate(
      { newPassword: password, confirmPassword },
      {
        onSuccess: () => {
          // Update local user state to clear forcePasswordReset flag
          if (user) {
            updateUser({ ...user, forcePasswordReset: false });
          }
          setSuccess(true);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to change password. Please try again.");
        },
      }
    );
  };

  const handleContinue = () => {
    // Redirect to appropriate dashboard
    const dashboardPath = getDashboardPath(user?.roles, user?.lecturerStatus);
    router.push(dashboardPath);
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e3a5f] via-[#2d5a87] to-secondary">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  // Show success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#2d5a87] to-secondary relative overflow-hidden flex items-center justify-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="force-success-pattern"
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
            <rect width="100%" height="100%" fill="url(#force-success-pattern)" />
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

        {/* Success Card */}
        <div className="relative z-10 w-full max-w-md px-4">
          <Card className="shadow-2xl border-0">
            <CardContent className="flex flex-col items-center gap-6 py-12">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-semibold">Password Changed!</h2>
                <p className="text-muted-foreground mt-3">
                  Your password has been updated successfully. You can now access your account normally.
                </p>
              </div>
              <Button className="w-full" size="lg" onClick={handleContinue}>
                Continue to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#2d5a87] to-secondary relative overflow-hidden flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="force-change-pattern"
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
          <rect width="100%" height="100%" fill="url(#force-change-pattern)" />
        </svg>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-60 h-60 bg-primary/10 rounded-full blur-3xl" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 z-50">
        <div className="container mx-auto flex items-center">
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

      {/* Form Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-2xl">Password Change Required</CardTitle>
            <CardDescription className="text-base">
              Your password was reset by an administrator. Please create a new password to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Warning Alert */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium">Security Notice</p>
                  <p className="mt-1 text-amber-700 dark:text-amber-300">
                    You must change your password before accessing any other pages. Choose a strong password that you haven't used before.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters with uppercase, lowercase, and a number
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword)
                        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    }}
                    className={`pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={forceChangePasswordMutation.isPending}
              >
                {forceChangePasswordMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-white/70 mt-6">
          If you didn't request this change, please contact support immediately.
        </p>
      </div>
    </div>
  );
}
