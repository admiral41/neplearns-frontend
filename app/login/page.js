"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLogin, getDashboardPath, isValidRedirectForRole } from "@/lib/hooks/useAuth";
import { useAuth } from "@/lib/providers/AuthProvider";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirectTo = searchParams.get("redirect");

  const [redirectTo, setRedirectTo] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLoggingOut = sessionStorage.getItem("logging_out");
      if (isLoggingOut) {
        sessionStorage.removeItem("logging_out");
        setRedirectTo(null);
        if (rawRedirectTo) {
          router.replace("/login");
        }
      } else {
        setRedirectTo(rawRedirectTo);
      }

      const forceLogoutReason = sessionStorage.getItem("force_logout_reason");
      if (forceLogoutReason) {
        sessionStorage.removeItem("force_logout_reason");
        toast.warning("Session Ended", {
          description: forceLogoutReason,
          duration: 8000,
        });
      }
    }
  }, [rawRedirectTo, router]);

  const { isAuthenticated, isLoading: authLoading, getDashboardPath: getAuthDashboardPath, login: authLogin } = useAuth();
  const loginMutation = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasInitialAuthCheck, setHasInitialAuthCheck] = useState(false);

  useEffect(() => {
    if (!authLoading && !hasInitialAuthCheck) {
      setHasInitialAuthCheck(true);
      if (isAuthenticated) {
        router.push(redirectTo || getAuthDashboardPath());
      }
    }
  }, [authLoading, isAuthenticated, router, redirectTo, getAuthDashboardPath, hasInitialAuthCheck]);

  const validateForm = () => {
    const newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    loginMutation.mutate(
      { email: email.trim().toLowerCase(), password, rememberMe },
      {
        onSuccess: (data) => {
          authLogin(data.data, data.token);

          if (data.data?.forcePasswordReset) {
            router.push('/force-change-password');
            return;
          }

          const defaultDashboard = getDashboardPath(data.data?.roles, data.data?.lecturerStatus);
          const isRedirectValid = redirectTo && isValidRedirectForRole(redirectTo, data.data?.roles);
          const dashboardPath = isRedirectValid ? redirectTo : defaultDashboard;

          router.push(dashboardPath);
        },
        onError: (error) => {
          if (error.message?.toLowerCase().includes("verify")) {
            toast.error("Email Not Verified", {
              description: "Please check your email and verify your account before logging in.",
            });
          } else if (error.message?.toLowerCase().includes("suspended")) {
            toast.error("Account Suspended", {
              description: "Your account has been suspended. Please contact support.",
            });
          } else {
            toast.error(error.message || "Login failed. Please try again.");
          }
        },
      }
    );
  };

  const handleInputChange = (field, value) => {
    if (field === "email") {
      setEmail(value);
    } else if (field === "password") {
      setPassword(value);
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 relative flex items-center justify-center">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-medium text-white">
            NepLearns
          </Link>
          <Link href="/">
            <Button variant="ghost" className="gap-2 text-white/80 hover:text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md px-4">
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-slate-800">Welcome Back</CardTitle>
            <CardDescription className="text-slate-500">
              Login to continue your learning journey
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm text-slate-600">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  autoFocus
                  className={`border-slate-200 focus:border-slate-300 ${errors.email ? "border-red-300" : ""}`}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm text-slate-600">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                    className={`border-slate-200 focus:border-slate-300 pr-10 ${errors.password ? "border-red-300" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                    className="border-slate-300"
                  />
                  <Label htmlFor="remember" className="text-sm text-slate-500 cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm text-slate-600 hover:text-slate-800"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-700 text-white"
                size="lg"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>

              {/* Sign Up Links */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-slate-400">
                    New to NepLearns?
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link href="/student-registration">
                  <Button type="button" variant="outline" className="w-full border-slate-200 text-slate-600 hover:bg-slate-50">
                    Student
                  </Button>
                </Link>
                <Link href="/instructor-application">
                  <Button type="button" variant="outline" className="w-full border-slate-200 text-slate-600 hover:bg-slate-50">
                    Instructor
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Terms */}
        <p className="text-center text-xs text-white/60 mt-6">
          By continuing, you agree to NepLearns'{" "}
          <Link href="/terms" className="underline hover:text-white">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-white">
            Privacy
          </Link>
        </p>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <Loader2 className="h-8 w-8 animate-spin text-white" />
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}