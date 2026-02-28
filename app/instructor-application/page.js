"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { ArrowLeft, Eye, EyeOff, Loader2, RefreshCw, AlertCircle, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useRegisterLecturer, useReapplyLecturer, useLecturerApplication } from "@/lib/hooks/useAuth";
import { useAuth } from "@/lib/providers/AuthProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function InstructorApplication() {
  const { user, isAuthenticated, isLoading: authLoading, updateUser } = useAuth();
  const registerMutation = useRegisterLecturer();
  const reapplyMutation = useReapplyLecturer();

  // Check if user is a rejected lecturer who can reapply
  const isRejectedLecturer = isAuthenticated &&
    user?.roles?.includes('LECTURER') &&
    user?.lecturerStatus === 'rejected';

  // Fetch existing application data for rejected users only
  const {
    data: applicationData,
    isLoading: applicationLoading
  } = useLecturerApplication({ enabled: isRejectedLecturer });

  // Determine if we're in reapplication mode
  const isReapplyMode = isRejectedLecturer;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: null,
    gender: "",
    education: "",
    university: "",
    major: [],
    yearsOfExperience: "",
    currentEmployment: "",
    subjectsToTeach: [],
    teachingLevel: [],
    availability: "",
    whyTeach: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Pre-fill form data for rejected users who are reapplying
  useEffect(() => {
    if (isReapplyMode && applicationData?.user) {
      const userData = applicationData.user;

      // Map experience back to select option
      const experienceReverseMap = {
        0: "0-1",
        1: "0-1",
        2: "1-3",
        3: "1-3",
        4: "3-5",
        5: "3-5",
        6: "5-10",
        7: "5-10",
        8: "5-10",
        9: "5-10",
        10: "5-10",
      };
      const getExperienceValue = (exp) => {
        if (exp >= 10) return "10+";
        return experienceReverseMap[exp] || "0-1";
      };

      // Map gender back to select option
      const genderReverseMap = {
        "Male": "male",
        "Female": "female",
        "Other": "other",
      };

      // Get lecturer application data if available
      const lecturerApp = applicationData.lecturerApplication;

      setFormData({
        fullName: `${userData.firstname || ""} ${userData.lastname || ""}`.trim(),
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || "",
        dateOfBirth: userData.dob ? new Date(userData.dob) : null,
        gender: genderReverseMap[userData.gender] || userData.gender?.toLowerCase() || "",
        education: userData.highestEducation || "",
        university: userData.universityCollege || "",
        major: userData.majorSpecialization
          ? (typeof userData.majorSpecialization === 'string'
              ? userData.majorSpecialization.split(',').map(m => m.trim()).filter(Boolean)
              : userData.majorSpecialization)
          : [],
        yearsOfExperience: getExperienceValue(userData.teachingExperience),
        currentEmployment: userData.employmentStatus || "",
        subjectsToTeach: userData.subjects || [],
        teachingLevel: userData.preferredLevel
          ? (typeof userData.preferredLevel === 'string'
              ? userData.preferredLevel.split(',').map(l => l.trim()).filter(Boolean)
              : userData.preferredLevel)
          : [],
        availability: userData.availability || "",
        whyTeach: userData.teachingMotivation || "",
        password: "",
        confirmPassword: "",
        agreeTerms: true,
      });
    }
  }, [isReapplyMode, applicationData]);

  const subjects = [
    "Mathematics",
    "English",
    "Nepali",
    "Science",
    "Social Studies",
    "Optional Math",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "Accountancy",
    "Economics",
    "Business Studies",
  ];

  const majors = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "English Literature",
    "Nepali Literature",
    "Economics",
    "Business Administration",
    "Accountancy",
    "Education",
    "Social Science",
    "Statistics",
    "Environmental Science",
    "Other",
  ];

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name);
  };

  const validateField = (name) => {
    let error = "";

    switch (name) {
      case "fullName":
        if (!isReapplyMode && !formData.fullName.trim()) {
          error = "Full name is required";
        }
        break;
      case "email":
        if (!isReapplyMode) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!formData.email.trim()) {
            error = "Email is required";
          } else if (!emailRegex.test(formData.email)) {
            error = "Please enter a valid email address";
          }
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
      case "gender":
        if (!formData.gender) {
          error = "Please select your gender";
        }
        break;
      case "education":
        if (!formData.education) {
          error = "Please select your highest education";
        }
        break;
      case "university":
        if (!formData.university.trim()) {
          error = "University/College is required";
        }
        break;
      case "teachingLevel":
        if (formData.teachingLevel.length === 0) {
          error = "Please select at least one teaching level";
        }
        break;
      case "subjectsToTeach":
        if (formData.subjectsToTeach.length === 0) {
          error = "Please select at least one subject";
        }
        break;
      case "whyTeach":
        if (!formData.whyTeach.trim()) {
          error = "Please tell us why you want to teach at NepLearns";
        } else if (formData.whyTeach.trim().length < 50) {
          error = "Please provide at least 50 characters";
        }
        break;
      case "password":
        if (!isReapplyMode) {
          if (!formData.password) {
            error = "Password is required";
          } else if (!isPasswordValid(formData.password)) {
            error = "Password does not meet all requirements";
          }
        }
        break;
      case "confirmPassword":
        if (!isReapplyMode) {
          if (!formData.confirmPassword) {
            error = "Please confirm your password";
          } else if (formData.password !== formData.confirmPassword) {
            error = "Passwords do not match";
          }
        }
        break;
      case "agreeTerms":
        if (!isReapplyMode && !formData.agreeTerms) {
          error = "You must agree to the terms and conditions";
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const handleSubjectToggle = (subject) => {
    setFormData((prev) => ({
      ...prev,
      subjectsToTeach: prev.subjectsToTeach.includes(subject)
        ? prev.subjectsToTeach.filter((s) => s !== subject)
        : [...prev.subjectsToTeach, subject],
    }));
    if (errors.subjectsToTeach) {
      setErrors((prev) => ({ ...prev, subjectsToTeach: "" }));
    }
  };

  const handleMajorToggle = (major) => {
    setFormData((prev) => ({
      ...prev,
      major: prev.major.includes(major)
        ? prev.major.filter((m) => m !== major)
        : [...prev.major, major],
    }));
  };

  const handleTeachingLevelToggle = (level) => {
    setFormData((prev) => ({
      ...prev,
      teachingLevel: prev.teachingLevel.includes(level)
        ? prev.teachingLevel.filter((l) => l !== level)
        : [...prev.teachingLevel, level],
    }));
    if (errors.teachingLevel) {
      setErrors((prev) => ({ ...prev, teachingLevel: "" }));
    }
  };

  const getPasswordRequirements = (password) => {
    return [
      { label: "At least 8 characters", met: password.length >= 8 },
      { label: "One uppercase letter", met: /[A-Z]/.test(password) },
      { label: "One lowercase letter", met: /[a-z]/.test(password) },
      { label: "One number", met: /[0-9]/.test(password) },
      { label: "One special character (!@#$%^&*)", met: /[!@#$%^&*]/.test(password) },
    ];
  };

  const isPasswordValid = (password) => {
    return getPasswordRequirements(password).every((req) => req.met);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isReapplyMode) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required";
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!formData.gender) {
      newErrors.gender = "Please select your gender";
    }

    if (!formData.education) {
      newErrors.education = "Please select your highest education";
    }

    if (!formData.university.trim()) {
      newErrors.university = "University/College is required";
    }

    if (formData.teachingLevel.length === 0) {
      newErrors.teachingLevel = "Please select at least one teaching level";
    }

    if (formData.subjectsToTeach.length === 0) {
      newErrors.subjectsToTeach = "Please select at least one subject";
    }

    if (!formData.whyTeach.trim()) {
      newErrors.whyTeach = "Please tell us why you want to teach at NepLearns";
    } else if (formData.whyTeach.trim().length < 50) {
      newErrors.whyTeach = "Please provide at least 50 characters";
    }

    if (!isReapplyMode) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (!isPasswordValid(formData.password)) {
        newErrors.password = "Password does not meet all requirements";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (!isReapplyMode && !formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allTouched = {
      fullName: true,
      email: true,
      phone: true,
      gender: true,
      education: true,
      university: true,
      teachingLevel: true,
      subjectsToTeach: true,
      whyTeach: true,
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

    const genderMap = {
      male: "Male",
      female: "Female",
      other: "Other",
    };

    const experienceMap = {
      "0-1": 0,
      "1-3": 2,
      "3-5": 4,
      "5-10": 7,
      "10+": 12,
    };

    const formDataToSend = new FormData();

    if (isReapplyMode) {
      formDataToSend.append("phone", formData.phone.replace(/\s/g, ""));
      if (formData.dateOfBirth) {
        formDataToSend.append("dob", formData.dateOfBirth.toISOString());
      }
      formDataToSend.append("gender", genderMap[formData.gender] || formData.gender);
      formDataToSend.append("address", formData.address.trim());

      formDataToSend.append("highestEducation", formData.education);
      formDataToSend.append("universityCollege", formData.university.trim());
      formDataToSend.append("majorSpecialization", formData.major.join(", "));

      formDataToSend.append(
        "teachingExperience",
        experienceMap[formData.yearsOfExperience] || 0
      );
      formDataToSend.append("employmentStatus", formData.currentEmployment);
      formDataToSend.append("preferredLevel", formData.teachingLevel.join(", "));
      formDataToSend.append("subjects", formData.subjectsToTeach.join(","));
      formDataToSend.append("availability", formData.availability);
      formDataToSend.append("teachingMotivation", formData.whyTeach.trim());

      reapplyMutation.mutate(formDataToSend, {
        onSuccess: (data) => {
          if (user) {
            updateUser({ ...user, lecturerStatus: 'pending' });
          }
        },
        onError: (error) => {
          if (error.data?.err && Array.isArray(error.data.err)) {
            const serverErrors = {};
            error.data.err.forEach((err) => {
              const fieldMap = {
                highestEducation: "education",
                universityCollege: "university",
                majorSpecialization: "major",
                teachingExperience: "yearsOfExperience",
                employmentStatus: "currentEmployment",
                preferredLevel: "teachingLevel",
                teachingMotivation: "whyTeach",
                dob: "dateOfBirth",
              };
              const field = fieldMap[err.path] || err.path;
              serverErrors[field] = err.msg;
            });
            setErrors(serverErrors);
          }
        },
      });
    } else {
      const nameParts = formData.fullName.trim().split(" ");
      const firstname = nameParts[0];
      const lastname = nameParts.slice(1).join(" ") || "";

      formDataToSend.append("email", formData.email.trim().toLowerCase());
      formDataToSend.append("password", formData.password);
      formDataToSend.append("firstname", firstname);
      formDataToSend.append("lastname", lastname);
      formDataToSend.append("phone", formData.phone.replace(/\s/g, ""));
      if (formData.dateOfBirth) {
        formDataToSend.append("dob", formData.dateOfBirth.toISOString());
      }
      formDataToSend.append("gender", genderMap[formData.gender] || formData.gender);
      formDataToSend.append("address", formData.address.trim());

      formDataToSend.append("highestEducation", formData.education);
      formDataToSend.append("universityCollege", formData.university.trim());
      formDataToSend.append("majorSpecialization", formData.major.join(", "));

      formDataToSend.append(
        "teachingExperience",
        experienceMap[formData.yearsOfExperience] || 0
      );
      formDataToSend.append("employmentStatus", formData.currentEmployment);
      formDataToSend.append("preferredLevel", formData.teachingLevel.join(", "));
      formDataToSend.append("subjects", formData.subjectsToTeach.join(","));
      formDataToSend.append("availability", formData.availability);
      formDataToSend.append("teachingMotivation", formData.whyTeach.trim());

      formDataToSend.append("termsAccepted", formData.agreeTerms);
      formDataToSend.append("privacyPolicyAccepted", formData.agreeTerms);

      registerMutation.mutate(formDataToSend, {
        onError: (error) => {
          if (error.data?.err && Array.isArray(error.data.err)) {
            const serverErrors = {};
            error.data.err.forEach((err) => {
              const fieldMap = {
                firstname: "fullName",
                lastname: "fullName",
                highestEducation: "education",
                universityCollege: "university",
                majorSpecialization: "major",
                teachingExperience: "yearsOfExperience",
                employmentStatus: "currentEmployment",
                preferredLevel: "teachingLevel",
                teachingMotivation: "whyTeach",
                dob: "dateOfBirth",
              };
              const field = fieldMap[err.path] || err.path;
              serverErrors[field] = err.msg;
            });
            setErrors(serverErrors);
          }
        },
      });
    }
  };

  if (authLoading || (isRejectedLecturer && applicationLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  const isSubmitting = isReapplyMode ? reapplyMutation.isPending : registerMutation.isPending;

  return (
    <div className="min-h-screen bg-slate-900 relative">
      {/* Subtle Background */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />

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

      {/* Form Section */}
      <div className="container mx-auto px-4 py-24">
        <Card className="max-w-4xl mx-auto border-0 shadow-xl">
          <CardHeader className="text-center">
            {isReapplyMode ? (
              <>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <RefreshCw className="h-5 w-5 text-slate-600" />
                  <CardTitle className="text-2xl text-slate-800">Resubmit Application</CardTitle>
                </div>
                <CardDescription className="text-slate-500">
                  Update your information and apply again
                </CardDescription>
                <Alert className="mt-4 text-left bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700 text-sm">
                    Your previous application was not approved. Update your details below and resubmit.
                  </AlertDescription>
                </Alert>
              </>
            ) : (
              <>
                <CardTitle className="text-2xl text-slate-800">Become an Instructor</CardTitle>
                <CardDescription className="text-slate-500">
                  Join our team of expert educators at NepLearns
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800 border-b border-slate-200 pb-2">
                  Personal Information
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-sm text-slate-600">
                      Full Name {!isReapplyMode && <span className="text-slate-400">*</span>}
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      onBlur={() => handleBlur("fullName")}
                      className={`border-slate-200 focus:border-slate-300 ${touched.fullName && errors.fullName ? "border-red-300" : ""}`}
                      disabled={isReapplyMode}
                    />
                    {touched.fullName && errors.fullName && (
                      <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm text-slate-600">
                      Email {!isReapplyMode && <span className="text-slate-400">*</span>}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      className={`border-slate-200 focus:border-slate-300 ${touched.email && errors.email ? "border-red-300" : ""}`}
                      disabled={isReapplyMode}
                    />
                    {touched.email && errors.email && (
                      <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm text-slate-600">
                      Phone <span className="text-slate-400">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="98XXXXXXXX"
                      value={formData.phone}
                      onChange={(e) =>
                        handleChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      onBlur={() => handleBlur("phone")}
                      className={`border-slate-200 focus:border-slate-300 ${touched.phone && errors.phone ? "border-red-300" : ""}`}
                    />
                    {touched.phone && errors.phone && (
                      <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="dateOfBirth" className="text-sm text-slate-600">Date of Birth</Label>
                    <DatePicker
                      date={formData.dateOfBirth}
                      onSelect={(date) => handleChange("dateOfBirth", date)}
                      placeholder="Pick a date"
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="gender" className="text-sm text-slate-600">
                      Gender <span className="text-slate-400">*</span>
                    </Label>
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
                      <SelectTrigger
                        id="gender"
                        className={`border-slate-200 focus:border-slate-300 ${touched.gender && errors.gender ? "border-red-300" : ""}`}
                      >
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {touched.gender && errors.gender && (
                      <p className="text-xs text-red-500 mt-1">{errors.gender}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-sm text-slate-600">Address</Label>
                    <Input
                      id="address"
                      placeholder="City, District"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      className="border-slate-200 focus:border-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Educational Background */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800 border-b border-slate-200 pb-2">
                  Educational Background
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="education" className="text-sm text-slate-600">
                      Highest Education <span className="text-slate-400">*</span>
                    </Label>
                    <Select
                      value={formData.education}
                      onValueChange={(value) => {
                        handleChange("education", value);
                        setTouched((prev) => ({ ...prev, education: true }));
                      }}
                      onOpenChange={(open) => {
                        if (!open) handleBlur("education");
                      }}
                    >
                      <SelectTrigger
                        id="education"
                        className={`border-slate-200 focus:border-slate-300 ${touched.education && errors.education ? "border-red-300" : ""}`}
                      >
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                        <SelectItem value="masters">Master's Degree</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {touched.education && errors.education && (
                      <p className="text-xs text-red-500 mt-1">{errors.education}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="university" className="text-sm text-slate-600">
                      University/College <span className="text-slate-400">*</span>
                    </Label>
                    <Input
                      id="university"
                      placeholder="University name"
                      value={formData.university}
                      onChange={(e) => handleChange("university", e.target.value)}
                      onBlur={() => handleBlur("university")}
                      className={`border-slate-200 focus:border-slate-300 ${touched.university && errors.university ? "border-red-300" : ""}`}
                    />
                    {touched.university && errors.university && (
                      <p className="text-xs text-red-500 mt-1">{errors.university}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm text-slate-600">Major/Specialization</Label>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 border border-slate-200 rounded-lg">
                    {majors.map((major) => (
                      <div key={major} className="flex items-center gap-2">
                        <Checkbox
                          id={`major-${major}`}
                          checked={formData.major.includes(major)}
                          onCheckedChange={() => handleMajorToggle(major)}
                          className="border-slate-300"
                        />
                        <Label htmlFor={`major-${major}`} className="text-sm text-slate-600 cursor-pointer">
                          {major}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Teaching Experience */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800 border-b border-slate-200 pb-2">
                  Teaching Experience
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="yearsOfExperience" className="text-sm text-slate-600">Years of Experience</Label>
                    <Select
                      value={formData.yearsOfExperience}
                      onValueChange={(value) => handleChange("yearsOfExperience", value)}
                    >
                      <SelectTrigger id="yearsOfExperience" className="border-slate-200 focus:border-slate-300">
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">Less than 1 year</SelectItem>
                        <SelectItem value="1-3">1-3 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="5-10">5-10 years</SelectItem>
                        <SelectItem value="10+">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="currentEmployment" className="text-sm text-slate-600">Current Employment</Label>
                    <Select
                      value={formData.currentEmployment}
                      onValueChange={(value) => handleChange("currentEmployment", value)}
                    >
                      <SelectTrigger id="currentEmployment" className="border-slate-200 focus:border-slate-300">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fulltime-teacher">Full-time Teacher</SelectItem>
                        <SelectItem value="parttime-teacher">Part-time Teacher</SelectItem>
                        <SelectItem value="freelance">Freelance Educator</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm text-slate-600">
                    Teaching Level <span className="text-slate-400">*</span>
                  </Label>
                  <div
                    className={`flex gap-4 p-4 border rounded-lg ${
                      touched.teachingLevel && errors.teachingLevel ? "border-red-300" : "border-slate-200"
                    }`}
                    onBlur={() => handleBlur("teachingLevel")}
                    tabIndex={-1}
                  >
                    {[
                      { value: "see", label: "SEE (Class 10)" },
                      { value: "plus2", label: "+2 (Grade 11-12)" },
                    ].map((level) => (
                      <div key={level.value} className="flex items-center gap-2">
                        <Checkbox
                          id={`level-${level.value}`}
                          checked={formData.teachingLevel.includes(level.value)}
                          onCheckedChange={() => {
                            handleTeachingLevelToggle(level.value);
                            setTouched((prev) => ({ ...prev, teachingLevel: true }));
                          }}
                          className="border-slate-300"
                        />
                        <Label htmlFor={`level-${level.value}`} className="text-sm text-slate-600 cursor-pointer">
                          {level.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {touched.teachingLevel && errors.teachingLevel && (
                    <p className="text-xs text-red-500 mt-1">{errors.teachingLevel}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm text-slate-600">
                    Subjects <span className="text-slate-400">*</span>
                  </Label>
                  <div
                    className={`grid sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-lg ${
                      touched.subjectsToTeach && errors.subjectsToTeach ? "border-red-300" : "border-slate-200"
                    }`}
                    onBlur={() => handleBlur("subjectsToTeach")}
                    tabIndex={-1}
                  >
                    {subjects.map((subject) => (
                      <div key={subject} className="flex items-center gap-2">
                        <Checkbox
                          id={subject}
                          checked={formData.subjectsToTeach.includes(subject)}
                          onCheckedChange={() => {
                            handleSubjectToggle(subject);
                            setTouched((prev) => ({ ...prev, subjectsToTeach: true }));
                          }}
                          className="border-slate-300"
                        />
                        <Label htmlFor={subject} className="text-sm text-slate-600 cursor-pointer">
                          {subject}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {touched.subjectsToTeach && errors.subjectsToTeach && (
                    <p className="text-xs text-red-500 mt-1">{errors.subjectsToTeach}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="availability" className="text-sm text-slate-600">Availability</Label>
                  <Select
                    value={formData.availability}
                    onValueChange={(value) => handleChange("availability", value)}
                  >
                    <SelectTrigger id="availability" className="border-slate-200 focus:border-slate-300">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fulltime">Full-time (40+ hrs/week)</SelectItem>
                      <SelectItem value="parttime">Part-time (20-40 hrs/week)</SelectItem>
                      <SelectItem value="flexible">Flexible (less than 20 hrs/week)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800 border-b border-slate-200 pb-2">
                  Additional Information
                </h3>

                <div className="space-y-1.5">
                  <Label htmlFor="whyTeach" className="text-sm text-slate-600">
                    Why teach at NepLearns? <span className="text-slate-400">*</span>
                  </Label>
                  <Textarea
                    id="whyTeach"
                    placeholder="Tell us about your teaching philosophy... (minimum 50 characters)"
                    rows={4}
                    value={formData.whyTeach}
                    onChange={(e) => handleChange("whyTeach", e.target.value)}
                    onBlur={() => handleBlur("whyTeach")}
                    className={`border-slate-200 focus:border-slate-300 resize-none ${
                      touched.whyTeach && errors.whyTeach ? "border-red-300" : ""
                    }`}
                  />
                  <div className="flex justify-end">
                    <p className={`text-xs ${formData.whyTeach.length >= 50 ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {formData.whyTeach.length}/50 characters
                    </p>
                  </div>
                  {touched.whyTeach && errors.whyTeach && (
                    <p className="text-xs text-red-500 mt-1">{errors.whyTeach}</p>
                  )}
                </div>
              </div>

              {/* Create Account Password - Only for new applications */}
              {!isReapplyMode && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-800 border-b border-slate-200 pb-2">
                    Create Account
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-sm text-slate-600">
                        Password <span className="text-slate-400">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter a strong password"
                          value={formData.password}
                          onChange={(e) => handleChange("password", e.target.value)}
                          onBlur={() => handleBlur("password")}
                          className={`border-slate-200 focus:border-slate-300 pr-10 ${
                            touched.password && errors.password ? "border-red-300" : ""
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {formData.password && (
                        <div className="space-y-1 mt-2">
                          {getPasswordRequirements(formData.password).map((req, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs">
                              {req.met ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <X className="h-3 w-3 text-slate-400" />
                              )}
                              <span className={req.met ? "text-emerald-600" : "text-slate-500"}>
                                {req.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-sm text-slate-600">
                        Confirm Password <span className="text-slate-400">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Re-enter password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleChange("confirmPassword", e.target.value)}
                          onBlur={() => handleBlur("confirmPassword")}
                          className={`border-slate-200 focus:border-slate-300 pr-10 ${
                            touched.confirmPassword && errors.confirmPassword ? "border-red-300" : ""
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {formData.confirmPassword && (
                        <div className="flex items-center gap-2 text-xs mt-2">
                          {formData.password === formData.confirmPassword ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-500" />
                              <span className="text-emerald-600">Passwords match</span>
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3 text-slate-400" />
                              <span className="text-slate-500">Passwords do not match</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Terms and Conditions - Only for new applications */}
              {!isReapplyMode && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) => {
                        handleChange("agreeTerms", checked);
                        setTouched((prev) => ({ ...prev, agreeTerms: true }));
                      }}
                      className="border-slate-300 mt-0.5"
                    />
                    <Label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed">
                      I agree to the{" "}
                      <Link href="/terms" className="text-slate-800 hover:underline">
                        Terms and Conditions
                      </Link>{" "}
                      and confirm that all information provided is accurate
                    </Label>
                  </div>
                  {touched.agreeTerms && errors.agreeTerms && (
                    <p className="text-xs text-red-500 ml-8">{errors.agreeTerms}</p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-700 text-white"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isReapplyMode ? "Resubmitting..." : "Submitting..."}
                  </>
                ) : (
                  isReapplyMode ? "Resubmit Application" : "Submit Application"
                )}
              </Button>

              <p className="text-center text-sm text-slate-500">
                {isReapplyMode ? (
                  <>
                    Your application will be reviewed by our team.
                    <br />
                    <Link href="/instructor-dashboard/rejected" className="text-slate-800 hover:underline">
                      Back to status
                    </Link>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <Link href="/login" className="text-slate-800 hover:underline">
                      Sign in
                    </Link>
                  </>
                )}
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}