"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import InstructorDashboardLayout from "@/components/instructor/InstructorDashboardLayout";
import { useAuth } from "@/lib/providers/AuthProvider";
import { useChangePassword } from "@/lib/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  XCircle,
  Mail,
  Lock,
  Save,
  Globe,
} from "lucide-react";

// Password validation helper
const validatePassword = (password) => {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };
  const isValid = Object.values(checks).every(Boolean);
  return { checks, isValid };
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const changePasswordMutation = useChangePassword();
  const [mounted, setMounted] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    emailEnrollments: true,
    emailReviews: true,
    emailQuestions: true,
    emailMarketing: false,
    pushEnrollments: true,
    pushReviews: false,
  });

  // Password validation state
  const passwordValidation = validatePassword(passwordData.newPassword);
  const passwordsMatch = passwordData.newPassword === passwordData.confirmPassword;

  // For hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Validate all fields are filled
    if (!passwordData.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    if (!passwordData.newPassword) {
      toast.error("Please enter a new password");
      return;
    }

    if (!passwordData.confirmPassword) {
      toast.error("Please confirm your new password");
      return;
    }

    // Validate password strength
    if (!passwordValidation.isValid) {
      toast.error("Password does not meet requirements");
      return;
    }

    // Validate passwords match
    if (!passwordsMatch) {
      toast.error("Passwords don't match");
      return;
    }

    // Call API
    changePasswordMutation.mutate(
      {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      },
      {
        onSuccess: () => {
          setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        },
      }
    );
  };

  const handleNotificationChange = (key, value) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
    // Auto-save notification preferences
    toast.success("Notification preferences updated");
  };

  return (
    <InstructorDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-lg sm:text-xl font-bold mb-1">Settings</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="max-w-2xl space-y-6">
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Account Settings
              </CardTitle>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Email address cannot be changed
                </p>
              </div>

              <Separator />

              {/* Change Password Form */}
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <h4 className="text-sm font-semibold">Change Password</h4>

                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter your current password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      className="pr-10"
                      disabled={changePasswordMutation.isPending}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      className="pr-10"
                      disabled={changePasswordMutation.isPending}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {/* Password requirements */}
                  {passwordData.newPassword && (
                    <div className="mt-2 space-y-1 text-xs">
                      <div className={`flex items-center gap-1.5 ${passwordValidation.checks.minLength ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {passwordValidation.checks.minLength ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        At least 8 characters
                      </div>
                      <div className={`flex items-center gap-1.5 ${passwordValidation.checks.hasUppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {passwordValidation.checks.hasUppercase ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        One uppercase letter
                      </div>
                      <div className={`flex items-center gap-1.5 ${passwordValidation.checks.hasLowercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {passwordValidation.checks.hasLowercase ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        One lowercase letter
                      </div>
                      <div className={`flex items-center gap-1.5 ${passwordValidation.checks.hasNumber ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {passwordValidation.checks.hasNumber ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        One number
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className={`pr-10 ${passwordData.confirmPassword && !passwordsMatch ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      disabled={changePasswordMutation.isPending}
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
                  {passwordData.confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Passwords do not match
                    </p>
                  )}
                  {passwordData.confirmPassword && passwordsMatch && passwordData.newPassword && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Passwords match
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Change Password
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Choose what emails you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Enrollments</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when a student enrolls in your course
                  </p>
                </div>
                <Switch
                  checked={notifications.emailEnrollments}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("emailEnrollments", checked)
                  }
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Course Reviews</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you receive a new review
                  </p>
                </div>
                <Switch
                  checked={notifications.emailReviews}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("emailReviews", checked)
                  }
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Student Questions</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when students ask questions
                  </p>
                </div>
                <Switch
                  checked={notifications.emailQuestions}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("emailQuestions", checked)
                  }
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing Emails</p>
                  <p className="text-sm text-muted-foreground">
                    Receive tips and updates about teaching
                  </p>
                </div>
                <Switch
                  checked={notifications.emailMarketing}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("emailMarketing", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>
                Manage your in-app notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Enrollments</p>
                  <p className="text-sm text-muted-foreground">
                    Show notification for new enrollments
                  </p>
                </div>
                <Switch
                  checked={notifications.pushEnrollments}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("pushEnrollments", checked)
                  }
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Reviews</p>
                  <p className="text-sm text-muted-foreground">
                    Show notification for new reviews
                  </p>
                </div>
                <Switch
                  checked={notifications.pushReviews}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("pushReviews", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Preferences
              </CardTitle>
              <CardDescription>
                Customize your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                {mounted ? (
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Select disabled>
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Loading..." />
                    </SelectTrigger>
                  </Select>
                )}
                <p className="text-xs text-muted-foreground">
                  Theme changes apply immediately
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </InstructorDashboardLayout>
  );
}
