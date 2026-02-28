"use client";

import { useState, useEffect, useRef } from "react";
import InstructorDashboardLayout from "@/components/instructor/InstructorDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Save,
  Globe,
  Loader2,
  MapPin,
  GraduationCap,
  Briefcase,
  BookOpen,
  Clock,
  CheckCircle,
  Mail,
  Phone,
  User,
  FileText,
  Upload,
  Download,
  IdCard,
} from "lucide-react";
import { toast } from "sonner";
import {
  useInstructorProfile,
  useUpdateInstructorProfile,
  useUpdateProfilePicture,
  useInstructorCourses,
  useUploadDocuments,
  useLecturerApplication,
} from "@/lib/hooks/useInstructor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// API base URL for images
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Helper to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // If already a full URL, return as is
  if (imagePath.startsWith("http")) return imagePath;
  // Otherwise, prepend API base URL
  return `${API_BASE_URL}/${imagePath}`;
};

export default function ProfilePage() {
  const fileInputRef = useRef(null);
  const cvInputRef = useRef(null);
  const certificatesInputRef = useRef(null);
  const governmentIdInputRef = useRef(null);

  // Fetch profile data
  const { data: profileData, isLoading: profileLoading } = useInstructorProfile();
  // API returns { status, success, msg, data: {...user} }
  const profile = profileData?.data || profileData;

  // Fetch courses for stats
  const { data: coursesData } = useInstructorCourses();
  const courses = coursesData?.data || [];

  // Fetch lecturer application data (includes documents)
  const { data: applicationData } = useLecturerApplication();
  const lecturerDocs = applicationData?.data?.lecturerApplication || applicationData?.lecturerApplication || {};

  // Mutations
  const updateProfile = useUpdateInstructorProfile();
  const updateProfilePicture = useUpdateProfilePicture();
  const uploadDocuments = useUploadDocuments();

  // Document upload state
  const [documentData, setDocumentData] = useState({
    governmentIdType: "",
  });
  const [documentErrors, setDocumentErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    expertise: "",
    experience: "",
    education: "",
    linkedin: "",
    twitter: "",
    website: "",
    // Additional instructor fields
    address: "",
    city: "",
    province: "",
    universityCollege: "",
    majorSpecialization: "",
    employmentStatus: "",
    preferredLevel: "",
    subjects: [],
    availability: "",
    teachingMotivation: "",
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstname || profile.firstName || "",
        lastName: profile.lastname || profile.lastName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        bio: profile.bio || profile.teachingMotivation || "",
        expertise: profile.expertise || profile.majorSpecialization || "",
        experience: profile.experience || profile.teachingExperience || "",
        education: profile.education || profile.highestEducation || "",
        linkedin: profile.linkedin || profile.socialLinks?.linkedin || "",
        twitter: profile.twitter || profile.socialLinks?.twitter || "",
        website: profile.website || profile.socialLinks?.website || "",
        // Additional instructor fields
        address: profile.address || "",
        city: profile.city || "",
        province: profile.province || "",
        universityCollege: profile.universityCollege || "",
        majorSpecialization: profile.majorSpecialization || "",
        employmentStatus: profile.employmentStatus || "",
        preferredLevel: profile.preferredLevel || "",
        subjects: profile.subjects || [],
        availability: profile.availability || "",
        teachingMotivation: profile.teachingMotivation || "",
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Max 600KB
      const maxSize = 600 * 1024;
      if (file.size > maxSize) {
        toast.error("Image size should be less than 600KB. Please select a smaller file.");
        // Clear the file input so user can try again
        if (e.target) {
          e.target.value = "";
        }
        return;
      }
      updateProfilePicture.mutate(file);
    }
  };

  // Document upload handler
  const handleDocumentUpload = async (type, file, e) => {
    if (!file) return;

    // Validate file sizes
    const maxSizes = {
      cv: 1 * 1024 * 1024, // 1MB
      certificates: 3 * 1024 * 1024, // 3MB
      governmentId: 600 * 1024, // 600KB
    };

    if (file.size > maxSizes[type]) {
      const sizeLabels = { cv: "1MB", certificates: "3MB", governmentId: "600KB" };
      setDocumentErrors((prev) => ({
        ...prev,
        [type]: `File must be under ${sizeLabels[type]}. Please select a smaller file.`,
      }));
      if (e?.target) e.target.value = "";
      return;
    }

    // Clear error
    setDocumentErrors((prev) => ({ ...prev, [type]: "" }));

    // Create FormData and upload
    const formData = new FormData();
    formData.append(type, file);
    if (type === "governmentId" && documentData.governmentIdType) {
      formData.append("governmentIdType", documentData.governmentIdType);
    }

    uploadDocuments.mutate(formData, {
      onSuccess: () => {
        if (e?.target) e.target.value = "";
      },
    });
  };

  // Get government ID type label
  const getGovernmentIdTypeLabel = (type) => {
    const labels = {
      citizenship: "Citizenship",
      nid: "National ID (NID)",
      passport: "Passport",
      driving_license: "Driving License",
    };
    return labels[type] || type || "Not specified";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = {
      // Map to backend field names (lowercase)
      firstname: formData.firstName,
      lastname: formData.lastName,
      phone: formData.phone,
      bio: formData.bio,
      // Location fields
      address: formData.address,
      city: formData.city,
      province: formData.province,
      // Professional fields
      expertise: formData.expertise,
      highestEducation: formData.education,
      universityCollege: formData.universityCollege,
      teachingExperience: formData.experience ? parseInt(formData.experience, 10) : undefined,
      majorSpecialization: formData.majorSpecialization || formData.expertise,
      // Social links
      socialLinks: {
        linkedin: formData.linkedin,
        twitter: formData.twitter,
        website: formData.website,
      },
    };

    // Remove undefined values
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === undefined || submitData[key] === "") {
        delete submitData[key];
      }
    });

    updateProfile.mutate(submitData);
  };

  // Calculate stats
  const totalStudents = courses.reduce((acc, course) => {
    return acc + (course.enrolledStudents?.length || course.enrollmentCount || 0);
  }, 0);
  const avgRating = courses.length > 0
    ? (courses.reduce((acc, course) => acc + (course.rating || 0), 0) / courses.length).toFixed(1)
    : "N/A";

  // Get initials for avatar
  const getInitials = () => {
    const firstName = profile?.firstname || profile?.firstName;
    const lastName = profile?.lastname || profile?.lastName;
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return "IN";
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get teaching level display
  const getTeachingLevelDisplay = (level) => {
    if (!level) return "N/A";
    const levels = {
      see: "SEE (Class 10)",
      plus2: "+2 (Grade 11-12)",
      "see,plus2": "SEE & +2",
    };
    return levels[level.toLowerCase()] || level;
  };

  // Get employment status display
  const getEmploymentStatusDisplay = (status) => {
    if (!status) return "N/A";
    const statuses = {
      "fulltime-teacher": "Full-time Teacher",
      "parttime-teacher": "Part-time Teacher",
      "private-tutor": "Private Tutor",
      student: "Student",
      other: "Other",
    };
    return statuses[status] || status;
  };

  // Get availability display
  const getAvailabilityDisplay = (availability) => {
    if (!availability) return "N/A";
    const availabilities = {
      fulltime: "Full-time",
      parttime: "Part-time",
      weekends: "Weekends Only",
      flexible: "Flexible",
    };
    return availabilities[availability] || availability;
  };

  // Format member since date
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "N/A";

  if (profileLoading) {
    return (
      <InstructorDashboardLayout>
        <div className="px-4 py-6 sm:py-8">
          <div className="mb-6">
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-5 w-60" />
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                  </div>
                  <Skeleton className="h-24" />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <Skeleton className="h-32 w-32 rounded-full mb-4" />
                  <Skeleton className="h-4 w-48" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </InstructorDashboardLayout>
    );
  }

  return (
    <InstructorDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-lg sm:text-xl font-bold mb-1">Profile</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your instructor profile
          </p>
        </div>

        {/* Instructor Overview Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center sm:items-start">
                <Avatar className="h-24 w-24 sm:h-28 sm:w-28">
                  <AvatarImage src={getImageUrl(profile?.userImage || profile?.profilePicture)} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Info Section */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h2 className="text-lg sm:text-xl font-bold">
                    {formData.firstName} {formData.lastName}
                  </h2>
                  {profile?.isVerified && (
                    <Badge variant="secondary" className="w-fit mx-auto sm:mx-0">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {profile?.lecturerStatus === "approved" && (
                    <Badge className="w-fit mx-auto sm:mx-0 bg-green-500">
                      Approved Instructor
                    </Badge>
                  )}
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center sm:justify-start">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{formData.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center sm:justify-start">
                    <Phone className="h-4 w-4" />
                    <span>{formData.phone || "Not set"}</span>
                  </div>
                  {(formData.address || formData.city || formData.province) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center sm:justify-start">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {[formData.city, formData.province].filter(Boolean).join(", ") || formData.address}
                      </span>
                    </div>
                  )}
                  {formData.education && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center sm:justify-start">
                      <GraduationCap className="h-4 w-4" />
                      <span>{formData.education}</span>
                    </div>
                  )}
                  {formData.experience && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center sm:justify-start">
                      <Briefcase className="h-4 w-4" />
                      <span>{formData.experience} years experience</span>
                    </div>
                  )}
                  {formData.availability && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center sm:justify-start">
                      <Clock className="h-4 w-4" />
                      <span>{getAvailabilityDisplay(formData.availability)}</span>
                    </div>
                  )}
                </div>

                {/* Subjects */}
                {formData.subjects && formData.subjects.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Subjects</span>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      {formData.subjects.map((subject, index) => (
                        <Badge key={index} variant="outline">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Teaching Level */}
                {formData.preferredLevel && (
                  <div className="mt-3">
                    <span className="text-sm text-muted-foreground">Teaching Level: </span>
                    <span className="text-sm font-medium">
                      {getTeachingLevelDisplay(formData.preferredLevel)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      placeholder="Tell students about yourself..."
                      value={formData.bio}
                      onChange={handleChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      This will be displayed on your instructor profile
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Location Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="Street address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="province">Province</Label>
                      <Input
                        id="province"
                        name="province"
                        placeholder="Province"
                        value={formData.province}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Professional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="education">Highest Education</Label>
                      <Input
                        id="education"
                        name="education"
                        placeholder="e.g., Masters, Bachelors"
                        value={formData.education}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="universityCollege">University/College</Label>
                      <Input
                        id="universityCollege"
                        name="universityCollege"
                        placeholder="Institution name"
                        value={formData.universityCollege}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expertise">Areas of Expertise / Specialization</Label>
                    <Input
                      id="expertise"
                      name="expertise"
                      placeholder="e.g., Mathematics, Physics, Computer Science"
                      value={formData.expertise}
                      onChange={handleChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate multiple areas with commas
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Teaching Experience</Label>
                      <Input
                        id="experience"
                        name="experience"
                        type="number"
                        min="0"
                        value={formData.experience}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Employment Status</Label>
                      <Input
                        value={getEmploymentStatusDisplay(formData.employmentStatus)}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Teaching Level</Label>
                      <Input
                        value={getTeachingLevelDisplay(formData.preferredLevel)}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Availability</Label>
                      <Input
                        value={getAvailabilityDisplay(formData.availability)}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  {formData.subjects && formData.subjects.length > 0 && (
                    <div className="space-y-2">
                      <Label>Subjects You Teach</Label>
                      <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/50">
                        {formData.subjects.map((subject, index) => (
                          <Badge key={index} variant="secondary">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Social Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      name="linkedin"
                      placeholder="https://linkedin.com/in/username"
                      value={formData.linkedin}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter / X</Label>
                    <Input
                      id="twitter"
                      name="twitter"
                      placeholder="https://twitter.com/username"
                      value={formData.twitter}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Personal Website
                    </Label>
                    <Input
                      id="website"
                      name="website"
                      placeholder="https://yourwebsite.com"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Picture */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                  <div className="relative mb-4">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={getImageUrl(profile?.userImage || profile?.profilePicture)} />
                      <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      type="button"
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full h-10 w-10"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={updateProfilePicture.isPending}
                    >
                      {updateProfilePicture.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Click the camera icon to upload a new photo
                  </p>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    Max 600KB, JPG or PNG
                  </p>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Hidden file inputs */}
                  <input
                    ref={cvInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleDocumentUpload("cv", e.target.files?.[0], e)}
                    className="hidden"
                  />
                  <input
                    ref={certificatesInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleDocumentUpload("certificates", e.target.files?.[0], e)}
                    className="hidden"
                  />
                  <input
                    ref={governmentIdInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleDocumentUpload("governmentId", e.target.files?.[0], e)}
                    className="hidden"
                  />

                  {/* CV/Resume */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">CV/Resume</Label>
                    <div className="flex items-center gap-2">
                      {lecturerDocs.cv ? (
                        <a
                          href={getImageUrl(lecturerDocs.cv)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button type="button" variant="outline" size="sm" className="w-full justify-start">
                            <Download className="h-4 w-4 mr-2" />
                            View CV
                          </Button>
                        </a>
                      ) : (
                        <span className="flex-1 text-sm text-muted-foreground">Not uploaded</span>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => cvInputRef.current?.click()}
                        disabled={uploadDocuments.isPending}
                      >
                        {uploadDocuments.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">PDF, DOC, DOCX (Max 1MB)</p>
                    {documentErrors.cv && (
                      <p className="text-xs text-red-500">{documentErrors.cv}</p>
                    )}
                  </div>

                  {/* Educational Certificates */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Educational Certificates</Label>
                    <div className="flex items-center gap-2">
                      {lecturerDocs.certificates?.length > 0 ? (
                        <a
                          href={getImageUrl(lecturerDocs.certificates[0])}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button type="button" variant="outline" size="sm" className="w-full justify-start">
                            <Download className="h-4 w-4 mr-2" />
                            View Certificate
                          </Button>
                        </a>
                      ) : (
                        <span className="flex-1 text-sm text-muted-foreground">Not uploaded</span>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => certificatesInputRef.current?.click()}
                        disabled={uploadDocuments.isPending}
                      >
                        {uploadDocuments.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">PDF only (Max 3MB)</p>
                    {documentErrors.certificates && (
                      <p className="text-xs text-red-500">{documentErrors.certificates}</p>
                    )}
                  </div>

                  {/* Government ID */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <IdCard className="h-4 w-4" />
                      Government ID
                    </Label>
                    <Select
                      value={documentData.governmentIdType || lecturerDocs.governmentIdType || ""}
                      onValueChange={(value) => setDocumentData((prev) => ({ ...prev, governmentIdType: value }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select ID type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="citizenship">Citizenship</SelectItem>
                        <SelectItem value="nid">National ID (NID)</SelectItem>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="driving_license">Driving License</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      {lecturerDocs.governmentId ? (
                        <a
                          href={getImageUrl(lecturerDocs.governmentId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button type="button" variant="outline" size="sm" className="w-full justify-start">
                            <Download className="h-4 w-4 mr-2" />
                            View ID ({getGovernmentIdTypeLabel(lecturerDocs.governmentIdType)})
                          </Button>
                        </a>
                      ) : (
                        <span className="flex-1 text-sm text-muted-foreground">Not uploaded</span>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => governmentIdInputRef.current?.click()}
                        disabled={uploadDocuments.isPending || !(documentData.governmentIdType || lecturerDocs.governmentIdType)}
                      >
                        {uploadDocuments.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Image or PDF (Max 600KB)</p>
                    {documentErrors.governmentId && (
                      <p className="text-xs text-red-500">{documentErrors.governmentId}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <Card>
                <CardContent className="pt-6">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={updateProfile.isPending}
                  >
                    {updateProfile.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Courses</span>
                    <span className="font-medium">{courses.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Students</span>
                    <span className="font-medium">{totalStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg. Rating</span>
                    <span className="font-medium">{avgRating}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member Since</span>
                    <span className="font-medium">{memberSince}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Account Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Email Verified</span>
                    {profile?.isVerified ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Instructor Status</span>
                    {profile?.lecturerStatus === "approved" ? (
                      <Badge className="bg-green-500">Approved</Badge>
                    ) : profile?.lecturerStatus === "pending" ? (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        Pending
                      </Badge>
                    ) : profile?.lecturerStatus === "rejected" ? (
                      <Badge variant="destructive">Rejected</Badge>
                    ) : (
                      <Badge variant="outline">N/A</Badge>
                    )}
                  </div>
                  {profile?.lastLoginAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Last Login</span>
                      <span className="text-sm">{formatDate(profile.lastLoginAt)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </InstructorDashboardLayout>
  );
}
