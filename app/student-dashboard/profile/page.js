"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  CreditCard,
  CheckCircle2,
  Eye,
  Clock,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useProfile, useUpdateProfile, useUpdateProfilePicture, usePaymentHistory, useStudentStats } from "@/lib/hooks/useStudent";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const fileInputRef = useRef(null);

  // Fetch profile data
  const { data: profileData, isLoading: profileLoading, error: profileError } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: updateProfilePicture, isPending: isUploadingPicture } = useUpdateProfilePicture();
  const { data: paymentData, isLoading: paymentLoading } = usePaymentHistory();
  const { data: statsData, isLoading: statsLoading } = useStudentStats();

  // Form state
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    dob: null,
    gender: "",
    address: "",
    city: "",
    province: "",
    currentLevel: "",
    stream: "",
    schoolCollege: "",
  });

  const [parentData, setParentData] = useState({
    fatherName: "",
    fatherPhone: "",
    motherName: "",
    motherPhone: "",
    guardianName: "",
    guardianPhone: "",
    guardianRelation: "",
  });

  // Populate form when profile data loads
  useEffect(() => {
    if (profileData) {
      setFormData({
        firstname: profileData.firstname || "",
        lastname: profileData.lastname || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        dob: profileData.dob ? new Date(profileData.dob) : null,
        gender: profileData.gender || "",
        address: profileData.address || "",
        city: profileData.city || "",
        province: profileData.province || "",
        currentLevel: profileData.currentLevel || "",
        stream: profileData.stream || "",
        schoolCollege: profileData.schoolCollege || "",
      });

      setParentData({
        fatherName: profileData.fatherName || "",
        fatherPhone: profileData.fatherPhone || "",
        motherName: profileData.motherName || "",
        motherPhone: profileData.motherPhone || "",
        guardianName: profileData.guardianName || "",
        guardianPhone: profileData.guardianPhone || "",
        guardianRelation: profileData.guardianRelation || "",
      });
    }
  }, [profileData]);

  const handleSave = () => {
    const dataToUpdate = {
      ...formData,
      ...parentData,
      dob: formData.dob ? formData.dob.toISOString() : null,
    };

    updateProfile(dataToUpdate, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  const handleCancel = () => {
    // Reset form to original data
    if (profileData) {
      setFormData({
        firstname: profileData.firstname || "",
        lastname: profileData.lastname || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        dob: profileData.dob ? new Date(profileData.dob) : null,
        gender: profileData.gender || "",
        address: profileData.address || "",
        city: profileData.city || "",
        province: profileData.province || "",
        currentLevel: profileData.currentLevel || "",
        stream: profileData.stream || "",
        schoolCollege: profileData.schoolCollege || "",
      });

      setParentData({
        fatherName: profileData.fatherName || "",
        fatherPhone: profileData.fatherPhone || "",
        motherName: profileData.motherName || "",
        motherPhone: profileData.motherPhone || "",
        guardianName: profileData.guardianName || "",
        guardianPhone: profileData.guardianPhone || "",
        guardianRelation: profileData.guardianRelation || "",
      });
    }
    setIsEditing(false);
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 600 * 1024) {
      toast.error("File too large. Maximum size is 600KB.");
      return;
    }

    updateProfilePicture(file);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  // Payment history from API
  const payments = paymentData?.payments || [];
  const totalSpent = paymentData?.totalSpent || 0;

  // Stats from API
  const stats = statsData || {
    enrolledCourses: 0,
    completedCourses: 0,
    lessonsCompleted: 0,
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format member since date
  const memberSince = profileData?.createdAt
    ? new Date(profileData.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : "N/A";

  if (profileError) {
    return (
      <DashboardLayout>
        <div className="px-4 py-6 sm:py-8">
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h2 className="text-xl font-semibold mb-2">Failed to load profile</h2>
              <p className="text-muted-foreground">
                {profileError.message || "An error occurred while loading your profile."}
              </p>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-lg sm:text-xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {profileLoading ? (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Skeleton className="w-24 h-24 rounded-full" />
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <Skeleton className="h-6 w-48 mx-auto sm:mx-0" />
                  <Skeleton className="h-4 w-32 mx-auto sm:mx-0" />
                  <Skeleton className="h-5 w-24 mx-auto sm:mx-0" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Avatar with upload */}
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {profileData?.userImage ? (
                      <img
                        src={profileData.userImage.startsWith("http") ? profileData.userImage : `${process.env.NEXT_PUBLIC_API_URL}/${profileData.userImage}`}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-primary" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPicture}
                    className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    {isUploadingPicture ? (
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : (
                      <Camera className="h-6 w-6 text-white" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-xl font-semibold mb-1">
                    {formData.firstname} {formData.lastname}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-3">
                    {formData.email}
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <Badge variant="secondary">
                      {formData.currentLevel || "Student"}
                    </Badge>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Member since {memberSince}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="parent">Parent/Guardian</TabsTrigger>
            <TabsTrigger value="payment">Payment Info</TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="mt-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg">
                    Personal Information
                  </CardTitle>
                  {!isEditing ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      disabled={profileLoading}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isUpdating}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSave} disabled={isUpdating}>
                        {isUpdating ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstname" className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          First Name
                        </Label>
                        <Input
                          id="firstname"
                          value={formData.firstname}
                          onChange={(e) =>
                            setFormData({ ...formData, firstname: e.target.value })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastname" className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          Last Name
                        </Label>
                        <Input
                          id="lastname"
                          value={formData.lastname}
                          onChange={(e) =>
                            setFormData({ ...formData, lastname: e.target.value })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
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
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          Date of Birth
                        </Label>
                        <DatePicker
                          date={formData.dob}
                          onSelect={(date) =>
                            setFormData({ ...formData, dob: date })
                          }
                          placeholder="Pick a date"
                          buttonDisabled={!isEditing}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender" className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          Gender
                        </Label>
                        <Select
                          value={formData.gender}
                          onValueChange={(value) =>
                            setFormData({ ...formData, gender: value })
                          }
                          disabled={!isEditing}
                        >
                          <SelectTrigger id="gender">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        Address
                      </Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="font-semibold text-sm mb-4">Academic Information</h3>

                      <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="currentLevel" className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                              Current Level <span className="text-destructive">*</span>
                            </Label>
                            <Select
                              value={formData.currentLevel}
                              onValueChange={(value) => {
                                setFormData({
                                  ...formData,
                                  currentLevel: value,
                                  stream: "" // Reset stream when level changes
                                });
                              }}
                              disabled={!isEditing}
                            >
                              <SelectTrigger id="currentLevel">
                                <SelectValue placeholder="Select your level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SEE">SEE</SelectItem>
                                <SelectItem value="+2">+2 (Higher Secondary)</SelectItem>
                                <SelectItem value="Bachelor">Bachelor</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {formData.currentLevel === "+2" && (
                            <div className="space-y-2">
                              <Label htmlFor="stream">Stream</Label>
                              <Select
                                value={formData.stream}
                                onValueChange={(value) =>
                                  setFormData({ ...formData, stream: value })
                                }
                                disabled={!isEditing}
                              >
                                <SelectTrigger id="stream">
                                  <SelectValue placeholder="Select stream" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Science">Science</SelectItem>
                                  <SelectItem value="Management">Management</SelectItem>
                                  <SelectItem value="Humanities">Humanities</SelectItem>
                                  <SelectItem value="Education">Education</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {formData.currentLevel === "Bachelor" && (
                            <div className="space-y-2">
                              <Label htmlFor="stream">Stream</Label>
                              <Select
                                value={formData.stream}
                                onValueChange={(value) =>
                                  setFormData({ ...formData, stream: value })
                                }
                                disabled={!isEditing}
                              >
                                <SelectTrigger id="stream">
                                  <SelectValue placeholder="Select stream" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="BBS">BBS (Business Studies)</SelectItem>
                                  <SelectItem value="BCA">BCA (Computer Application)</SelectItem>
                                  <SelectItem value="BSc">BSc (Science)</SelectItem>
                                  <SelectItem value="BA">BA (Arts)</SelectItem>
                                  <SelectItem value="BEd">BEd (Education)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="schoolCollege">
                            School/College Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="schoolCollege"
                            value={formData.schoolCollege}
                            onChange={(e) =>
                              setFormData({ ...formData, schoolCollege: e.target.value })
                            }
                            disabled={!isEditing}
                            placeholder="Enter your school or college name"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parent/Guardian Tab */}
          <TabsContent value="parent" className="mt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Parent/Guardian Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {profileLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <div className="grid sm:grid-cols-2 gap-4">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Father Info */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm">Father's Information</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fatherName">Full Name</Label>
                          <Input
                            id="fatherName"
                            value={parentData.fatherName}
                            onChange={(e) =>
                              setParentData({
                                ...parentData,
                                fatherName: e.target.value,
                              })
                            }
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fatherPhone">Phone Number</Label>
                          <Input
                            id="fatherPhone"
                            value={parentData.fatherPhone}
                            onChange={(e) =>
                              setParentData({
                                ...parentData,
                                fatherPhone: e.target.value,
                              })
                            }
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mother Info */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm">Mother's Information</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="motherName">Full Name</Label>
                          <Input
                            id="motherName"
                            value={parentData.motherName}
                            onChange={(e) =>
                              setParentData({
                                ...parentData,
                                motherName: e.target.value,
                              })
                            }
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="motherPhone">Phone Number</Label>
                          <Input
                            id="motherPhone"
                            value={parentData.motherPhone}
                            onChange={(e) =>
                              setParentData({
                                ...parentData,
                                motherPhone: e.target.value,
                              })
                            }
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Guardian Info (Optional) */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm">
                        Guardian Information <span className="text-muted-foreground font-normal">(Optional)</span>
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="guardianName">Full Name</Label>
                          <Input
                            id="guardianName"
                            value={parentData.guardianName}
                            onChange={(e) =>
                              setParentData({
                                ...parentData,
                                guardianName: e.target.value,
                              })
                            }
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="guardianPhone">Phone Number</Label>
                          <Input
                            id="guardianPhone"
                            value={parentData.guardianPhone}
                            onChange={(e) =>
                              setParentData({
                                ...parentData,
                                guardianPhone: e.target.value,
                              })
                            }
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="guardianRelation">Relation</Label>
                          <Input
                            id="guardianRelation"
                            placeholder="e.g., Uncle, Aunt, etc."
                            value={parentData.guardianRelation}
                            onChange={(e) =>
                              setParentData({
                                ...parentData,
                                guardianRelation: e.target.value,
                              })
                            }
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>

                    {!isEditing ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={isUpdating}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={isUpdating}>
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Info Tab */}
          <TabsContent value="payment" className="mt-6">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {statsLoading ? (
                [1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-8 w-12 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {stats.enrolledCourses}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Enrolled Courses
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-info mb-1">
                        {stats.lessonsCompleted}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Lessons Completed
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-success mb-1">
                        {stats.completedCourses}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Courses Completed
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-warning mb-1">
                        NPR {totalSpent.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total Spent
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Payment History */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {paymentLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <Skeleton className="h-5 w-48 mb-2" />
                        <Skeleton className="h-4 w-24 mb-3" />
                        <div className="flex justify-between">
                          <Skeleton className="h-3 w-32" />
                          <Skeleton className="h-8 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No payment history yet</p>
                    <p className="text-sm">Your payment records will appear here once you enroll in courses</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment, index) => (
                      <div
                        key={payment.courseId || index}
                        className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-base mb-1">
                              {payment.courseTitle}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {payment.category}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">
                              NPR {payment.amount.toLocaleString()}
                            </div>
                            {payment.status === "verified" || payment.status === "approved" ? (
                              <Badge
                                variant="outline"
                                className="text-xs mt-1 text-success border-success"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-xs mt-1 text-warning border-warning"
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <div>
                              <span className="font-medium">Payment Date:</span>{" "}
                              {formatDate(payment.paymentDate)}
                            </div>
                            <div>
                              <span className="font-medium">Method:</span>{" "}
                              {payment.paymentMethod}
                            </div>
                          </div>

                          {payment.receipt && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                toast.info("Receipt", {
                                  description: `Viewing receipt: ${payment.receipt}`,
                                })
                              }
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Receipt
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
