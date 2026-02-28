"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRegisterLearner } from "@/lib/hooks/useAuth";
import { useSettings } from "@/lib/providers/SettingsProvider";

export default function StudentRegistration() {
  const registerMutation = useRegisterLearner();
  const { getLogoUrl, getPlatformName } = useSettings();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: null,
    gender: "",
    level: "",
    stream: "",
    school: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user makes changes
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Mark field as touched and validate on blur
  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name);
  };

  // Validate a single field
  const validateField = (name) => {
    let error = "";

    switch (name) {
      case "fullName":
        if (!formData.fullName.trim()) {
          error = "Full name is required";
        } else if (formData.fullName.trim().length < 2) {
          error = "Name must be at least 2 characters";
        }
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
          error = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
          error = "Please enter a valid email address";
        }
        break;
      case "phone":
        const phoneRegex = /^[0-9]{10}$/;
        if (!formData.phone.trim()) {
          error = "Phone number is required";
        } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
          error = "Phone number must be 10 digits";
        }
        break;
      case "dateOfBirth":
        if (!formData.dateOfBirth) {
          error = "Date of birth is required";
        }
        break;
      case "gender":
        if (!formData.gender) {
          error = "Please select your gender";
        }
        break;
      case "level":
        if (!formData.level) {
          error = "Please select your current level";
        }
        break;
      case "stream":
        if (formData.level === "plus2" && !formData.stream) {
          error = "Please select your stream";
        }
        break;
      case "school":
        if (!formData.school.trim()) {
          error = "School/College name is required";
        }
        break;
      case "password":
        if (!formData.password) {
          error = "Password is required";
        } else if (formData.password.length < 6) {
          error = "Password must be at least 6 characters";
        }
        break;
      case "confirmPassword":
        if (!formData.confirmPassword) {
          error = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
          error = "Passwords do not match";
        }
        break;
      case "agreeTerms":
        if (!formData.agreeTerms) {
          error = "You must agree to the terms and conditions";
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const validateForm = () => {
    const newErrors = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    // Date of birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = "Please select your gender";
    }

    // Level validation
    if (!formData.level) {
      newErrors.level = "Please select your current level";
    }

    // Stream validation (only for +2)
    if (formData.level === "plus2" && !formData.stream) {
      newErrors.stream = "Please select your stream";
    }

    // School validation
    if (!formData.school.trim()) {
      newErrors.school = "School/College name is required";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Terms agreement
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched to show all errors
    const allTouched = {
      fullName: true,
      email: true,
      phone: true,
      dateOfBirth: true,
      gender: true,
      level: true,
      stream: true,
      school: true,
      password: true,
      confirmPassword: true,
      agreeTerms: true,
    };
    setTouched(allTouched);

    if (!validateForm()) {
      toast.error("Please fix the errors", {
        description: "Some required fields are missing or invalid",
      });
      return;
    }

    // Split full name into first and last name
    const nameParts = formData.fullName.trim().split(" ");
    const firstname = nameParts[0];
    const lastname = nameParts.slice(1).join(" ") || "";

    // Map gender to backend expected format (capitalize first letter)
    const genderMap = {
      male: "Male",
      female: "Female",
      other: "Other",
    };

    // Prepare data for backend
    const registrationData = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      firstname,
      lastname,
      phone: formData.phone.replace(/\s/g, ""),
      dob: formData.dateOfBirth ? formData.dateOfBirth.toISOString() : null,
      gender: genderMap[formData.gender] || formData.gender,
      address: formData.address.trim(),
      currentLevel: formData.level === "see" ? "SEE" : "+2",
      stream: formData.stream || "",
      schoolCollege: formData.school.trim(),
      termsAccepted: formData.agreeTerms,
      privacyPolicyAccepted: formData.agreeTerms,
    };

    registerMutation.mutate(registrationData, {
      onError: (error) => {
        // Handle server validation errors
        if (error.data?.err && Array.isArray(error.data.err)) {
          const serverErrors = {};
          error.data.err.forEach((err) => {
            // Map backend field names to frontend field names
            const fieldMap = {
              firstname: "fullName",
              lastname: "fullName",
              currentLevel: "level",
              schoolCollege: "school",
              dob: "dateOfBirth",
            };
            const field = fieldMap[err.path] || err.path;
            serverErrors[field] = err.msg;
          });
          setErrors(serverErrors);
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#2d5a87] to-secondary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="reg-pattern"
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
          <rect width="100%" height="100%" fill="url(#reg-pattern)" />
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
          <Link href="/">
            <Button variant="ghost" className="gap-2 text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Form Section */}
      <div className="container mx-auto px-4 py-24 relative z-10">
        <Card className="max-w-4xl mx-auto shadow-2xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Student Registration</CardTitle>
            <CardDescription className="text-base">
              Register now to start your learning journey with {getPlatformName()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold border-b pb-2">Personal Information</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      onBlur={() => handleBlur("fullName")}
                      className={touched.fullName && errors.fullName ? "border-red-500" : ""}
                    />
                    {touched.fullName && errors.fullName && (
                      <p className="text-sm text-red-500">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      className={touched.email && errors.email ? "border-red-500" : ""}
                    />
                    {touched.email && errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="98XXXXXXXX"
                      value={formData.phone}
                      onChange={(e) =>
                        handleChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      onBlur={() => handleBlur("phone")}
                      className={touched.phone && errors.phone ? "border-red-500" : ""}
                    />
                    {touched.phone && errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <DatePicker
                      date={formData.dateOfBirth}
                      onSelect={(date) => {
                        handleChange("dateOfBirth", date);
                        setTouched((prev) => ({ ...prev, dateOfBirth: true }));
                      }}
                      placeholder="Pick a date"
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      className={touched.dateOfBirth && errors.dateOfBirth ? "border-red-500" : ""}
                      captionLayout="dropdown"
                      fromYear={1990}
                      toYear={new Date().getFullYear()}
                    />
                    {touched.dateOfBirth && errors.dateOfBirth && (
                      <p className="text-sm text-red-500">{errors.dateOfBirth}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => {
                        handleChange("gender", value);
                        setTouched((prev) => ({ ...prev, gender: true }));
                      }}
                      onOpenChange={(open) => {
                        if (!open) handleBlur("gender");
                      }}
                    >
                      <SelectTrigger id="gender" className={touched.gender && errors.gender ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {touched.gender && errors.gender && (
                      <p className="text-sm text-red-500">{errors.gender}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="City, District"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold border-b pb-2">Academic Information</h3>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="level">Current Level *</Label>
                    <Select
                      value={formData.level}
                      onValueChange={(value) => {
                        handleChange("level", value);
                        setTouched((prev) => ({ ...prev, level: true }));
                        // Clear stream if level is not plus2
                        if (value !== "plus2") {
                          handleChange("stream", "");
                        }
                      }}
                      onOpenChange={(open) => {
                        if (!open) handleBlur("level");
                      }}
                    >
                      <SelectTrigger id="level" className={touched.level && errors.level ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select your level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="see">SEE (Class 10)</SelectItem>
                        <SelectItem value="plus2">+2 (Grade 11-12)</SelectItem>
                      </SelectContent>
                    </Select>
                    {touched.level && errors.level && (
                      <p className="text-sm text-red-500">{errors.level}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stream">
                      Stream {formData.level === "plus2" && "*"}
                    </Label>
                    <Select
                      value={formData.stream}
                      onValueChange={(value) => {
                        handleChange("stream", value);
                        setTouched((prev) => ({ ...prev, stream: true }));
                      }}
                      onOpenChange={(open) => {
                        if (!open && formData.level === "plus2") handleBlur("stream");
                      }}
                      disabled={formData.level !== "plus2"}
                    >
                      <SelectTrigger
                        id="stream"
                        className={touched.stream && errors.stream ? "border-red-500" : ""}
                      >
                        <SelectValue
                          placeholder={
                            formData.level === "plus2" ? "Select stream" : "Select level first"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="management">Management</SelectItem>
                        <SelectItem value="humanities">Humanities</SelectItem>
                      </SelectContent>
                    </Select>
                    {touched.stream && errors.stream && (
                      <p className="text-sm text-red-500">{errors.stream}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="school">School/College Name *</Label>
                    <Input
                      id="school"
                      placeholder="Enter your school/college name"
                      value={formData.school}
                      onChange={(e) => handleChange("school", e.target.value)}
                      onBlur={() => handleBlur("school")}
                      className={touched.school && errors.school ? "border-red-500" : ""}
                    />
                    {touched.school && errors.school && (
                      <p className="text-sm text-red-500">{errors.school}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold border-b pb-2">Create Password</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password (min 6 characters)"
                        value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        onBlur={() => handleBlur("password")}
                        className={`pr-10 ${touched.password && errors.password ? "border-red-500" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {touched.password && errors.password && (
                      <p className="text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                        onBlur={() => handleBlur("confirmPassword")}
                        className={`pr-10 ${touched.confirmPassword && errors.confirmPassword ? "border-red-500" : ""}`}
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
                    {touched.confirmPassword && errors.confirmPassword && (
                      <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-2 pt-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) => {
                      handleChange("agreeTerms", checked);
                      setTouched((prev) => ({ ...prev, agreeTerms: true }));
                    }}
                    className="shrink-0"
                  />
                  <Label htmlFor="terms" className="text-sm cursor-pointer leading-normal">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:underline font-medium">
                      Terms and Conditions
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline font-medium">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                {touched.agreeTerms && errors.agreeTerms && (
                  <p className="text-sm text-red-500 ml-7">{errors.agreeTerms}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Complete Registration"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
