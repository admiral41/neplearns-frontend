"use client";

import { useState } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  UserPlus,
  Search,
  Eye,
  Check,
  X,
  GraduationCap,
  Briefcase,
  Phone,
  Download,
  MapPin,
  Calendar,
  Loader2,
  AlertCircle,
  IdCard,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  useApplications,
  useApproveApplication,
  useRejectApplication,
} from "@/lib/hooks/useAdmin";
import { useSettings } from "@/lib/providers/SettingsProvider";

// Helper to map experience years
const getExperienceLabel = (years) => {
  if (years === 0 || years === 1) return "Less than 1 year";
  if (years <= 3) return "1-3 years";
  if (years <= 5) return "3-5 years";
  if (years <= 10) return "5-10 years";
  return "10+ years";
};

// Helper to map teaching level
const getTeachingLevelLabel = (level) => {
  const levels = {
    see: "SEE (Class 10)",
    plus2: "+2 (Grade 11-12)",
    both: "Both SEE and +2",
  };
  return levels[level] || level;
};

// Helper to map education level
const getEducationLabel = (education) => {
  const labels = {
    bachelors: "Bachelor's Degree",
    masters: "Master's Degree",
    phd: "PhD",
    other: "Other",
  };
  return labels[education] || education;
};

// Helper to map government ID type
const getGovernmentIdTypeLabel = (idType) => {
  const labels = {
    citizenship: "Citizenship",
    nid: "National ID (NID)",
    passport: "Passport",
    driving_license: "Driving License",
  };
  return labels[idType] || idType || "-";
};

export default function ApplicationsPage() {
  const { getPlatformName } = useSettings();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [applicationToReject, setApplicationToReject] = useState(null);

  // Fetch applications
  const { data: applicationsData, isLoading, error } = useApplications();
  const approveMutation = useApproveApplication();
  const rejectMutation = useRejectApplication();

  // Backend URL for file downloads
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Helper to construct full file URL
  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    // If already a full URL, return as-is
    if (filePath.startsWith('http')) return filePath;
    // Prepend backend URL
    return `${backendUrl}/${filePath}`;
  };

  // Transform backend data to frontend format
  const applications = (applicationsData?.data || []).map((app) => ({
    id: app._id,
    name: app.user ? `${app.user.firstname || ""} ${app.user.lastname || ""}`.trim() : "Unknown",
    email: app.user?.email || "",
    phone: app.user?.phone || "",
    gender: app.user?.gender || "",
    address: app.user?.address || "",
    dob: app.user?.dob,
    education: getEducationLabel(app.user?.highestEducation),
    university: app.user?.universityCollege || "",
    major: app.user?.majorSpecialization || "",
    experience: getExperienceLabel(app.user?.teachingExperience || 0),
    currentJob: app.user?.employmentStatus || "",
    teachingLevel: getTeachingLevelLabel(app.user?.preferredLevel),
    subjects: app.user?.subjects || [],
    availability: app.user?.availability || "",
    whyTeach: app.user?.teachingMotivation || "",
    cvUrl: getFileUrl(app.cv),
    certificatesUrl: getFileUrl(app.certificates?.[0]),
    allCertificates: app.certificates?.map(getFileUrl) || [],
    governmentIdType: app.governmentIdType,
    governmentIdUrl: getFileUrl(app.governmentId),
    appliedAt: app.createdAt ? new Date(app.createdAt) : new Date(),
    status: app.requestStatus,
  }));

  // Filter applications based on search
  const filteredApplications = applications.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (Array.isArray(app.subjects) && app.subjects.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const handleApprove = (applicationId) => {
    approveMutation.mutate(applicationId, {
      onSuccess: () => {
        setSelectedApplication(null);
      },
    });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      return;
    }
    rejectMutation.mutate(
      { applicationId: applicationToReject.id, reason: rejectReason },
      {
        onSuccess: () => {
          setIsRejectDialogOpen(false);
          setRejectReason("");
          setApplicationToReject(null);
          setSelectedApplication(null);
        },
      }
    );
  };

  const openRejectDialog = (application) => {
    setApplicationToReject(application);
    setIsRejectDialogOpen(true);
  };

  const pendingCount = applications.filter((a) => a.status === "pending").length;

  // Loading skeleton
  if (isLoading) {
    return (
      <AdminDashboardLayout>
        <div className="px-4 py-6 sm:py-8">
          <div className="mb-6">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          <Skeleton className="h-12 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminDashboardLayout>
        <div className="px-4 py-6 sm:py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load applications</h3>
              <p className="text-muted-foreground">{error.message}</p>
            </CardContent>
          </Card>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-lg sm:text-xl font-bold mb-1">
            Instructor Applications
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Review and process instructor applications
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-500">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-500">-</p>
              <p className="text-sm text-muted-foreground">Approved Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-500">-</p>
              <p className="text-sm text-muted-foreground">Rejected Today</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or subject..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <UserPlus className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No applications found</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search"
                    : "No pending applications at the moment"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((application) => (
              <Card key={application.id}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <Avatar className="h-16 w-16 shrink-0">
                      <AvatarFallback className="text-lg bg-primary/10 text-primary">
                        {application.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <div>
                          <h3 className="text-lg font-semibold">{application.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {application.email}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          Applied {formatDistanceToNow(application.appliedAt, { addSuffix: true })}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {Array.isArray(application.subjects) && application.subjects.map((subject) => (
                          <Badge key={subject} variant="outline">
                            {subject}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid sm:grid-cols-3 gap-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          <span>{application.education}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          <span>{application.experience} experience</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{application.phone}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedApplication(application)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(application.id)}
                          disabled={approveMutation.isPending}
                        >
                          {approveMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 mr-1" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openRejectDialog(application)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Application Details Dialog */}
        <Dialog
          open={!!selectedApplication}
          onOpenChange={() => setSelectedApplication(null)}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
            </DialogHeader>
            {selectedApplication && (
              <div className="space-y-6 mt-4">
                {/* Personal Info */}
                <div>
                  <h4 className="font-semibold mb-3">Personal Information</h4>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Full Name:</span>
                      <p className="font-medium">{selectedApplication.name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p className="font-medium">{selectedApplication.email}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <p className="font-medium">{selectedApplication.phone}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gender:</span>
                      <p className="font-medium">{selectedApplication.gender || "-"}</p>
                    </div>
                    {selectedApplication.dob && (
                      <div>
                        <span className="text-muted-foreground">Date of Birth:</span>
                        <p className="font-medium">
                          {format(new Date(selectedApplication.dob), "MMM d, yyyy")}
                        </p>
                      </div>
                    )}
                    {selectedApplication.address && (
                      <div>
                        <span className="text-muted-foreground">Address:</span>
                        <p className="font-medium">{selectedApplication.address}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Applied:</span>
                      <p className="font-medium">
                        {format(selectedApplication.appliedAt, "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h4 className="font-semibold mb-3">Education</h4>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Highest Education:</span>
                      <p className="font-medium">{selectedApplication.education}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">University/College:</span>
                      <p className="font-medium">{selectedApplication.university || "-"}</p>
                    </div>
                    {selectedApplication.major && (
                      <div>
                        <span className="text-muted-foreground">Major/Specialization:</span>
                        <p className="font-medium">{selectedApplication.major}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <h4 className="font-semibold mb-3">Teaching Experience</h4>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Years of Experience:</span>
                      <p className="font-medium">{selectedApplication.experience}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Employment Status:</span>
                      <p className="font-medium">{selectedApplication.currentJob || "-"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Preferred Teaching Level:</span>
                      <p className="font-medium">{selectedApplication.teachingLevel}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Availability:</span>
                      <p className="font-medium">{selectedApplication.availability || "-"}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-muted-foreground">Subjects:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Array.isArray(selectedApplication.subjects) && selectedApplication.subjects.map((subject) => (
                          <Badge key={subject} variant="outline">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Why Teach */}
                <div>
                  <h4 className="font-semibold mb-3">Why do you want to teach at {getPlatformName()}?</h4>
                  <p className="text-sm">{selectedApplication.whyTeach || "-"}</p>
                </div>

                {/* Documents */}
                <div>
                  <h4 className="font-semibold mb-3">Documents</h4>

                  {/* Government ID */}
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <IdCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Government ID</span>
                      <Badge variant="outline" className="ml-auto">
                        {getGovernmentIdTypeLabel(selectedApplication.governmentIdType)}
                      </Badge>
                    </div>
                    {selectedApplication.governmentIdUrl ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedApplication.governmentIdUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-1" />
                          View Document
                        </a>
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not uploaded</span>
                    )}
                  </div>

                  {/* Other Documents */}
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.cvUrl ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedApplication.cvUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-1" />
                          Download CV
                        </a>
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">No CV uploaded</span>
                    )}
                    {selectedApplication.allCertificates?.length > 0 ? (
                      selectedApplication.allCertificates.map((certUrl, index) => (
                        <Button key={index} variant="outline" size="sm" asChild>
                          <a href={certUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-1" />
                            Certificate {selectedApplication.allCertificates.length > 1 ? index + 1 : ''}
                          </a>
                        </Button>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No certificates uploaded</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(selectedApplication.id)}
                    disabled={approveMutation.isPending}
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Approve Application
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => openRejectDialog(selectedApplication)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject Application
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Application</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Please provide a reason for rejecting this application. The
                applicant will be notified via email.
              </p>
              <div className="space-y-2">
                <Label htmlFor="reason">Rejection Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter the reason for rejection..."
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsRejectDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleReject}
                  disabled={rejectMutation.isPending || !rejectReason.trim()}
                >
                  {rejectMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Reject Application
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  );
}
