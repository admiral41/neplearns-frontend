"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Edit,
  Save,
  Check,
  X,
  Star,
  StarOff,
  Trash2,
  BookOpen,
  Users,
  Banknote,
  Calendar,
  Play,
  FileText,
  Clock,
  Eye,
  EyeOff,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAlertDialog } from "@/components/ui/alert-dialog-provider";

// Mock course data
const mockCourse = {
  id: 1,
  title: "Complete Web Development Bootcamp",
  description: "Learn web development from scratch. This comprehensive bootcamp covers HTML, CSS, JavaScript, React, Node.js, and more. Build real-world projects and become a full-stack developer.",
  thumbnail: "/api/placeholder/400/225",
  instructor: { id: 1, name: "Ramesh Kumar", email: "ramesh.kumar@email.com" },
  status: "published",
  isFeatured: true,
  price: 2999,
  discountPrice: 1999,
  category: "Web Development",
  level: "Beginner to Advanced",
  language: "Nepali",
  students: 156,
  revenue: 467844,
  rating: 4.7,
  reviewsCount: 89,
  createdAt: new Date("2024-01-15"),
  publishedAt: new Date("2024-01-18"),
  lastUpdated: new Date("2024-03-10"),
  duration: "45 hours",
  lessonsCount: 120,
  curriculum: [
    {
      id: 1,
      title: "Introduction to Web Development",
      lessons: [
        { id: 1, title: "What is Web Development?", duration: "15:00", type: "video" },
        { id: 2, title: "Setting Up Your Environment", duration: "20:00", type: "video" },
        { id: 3, title: "Quiz: Introduction", type: "quiz" },
      ],
    },
    {
      id: 2,
      title: "HTML Fundamentals",
      lessons: [
        { id: 4, title: "HTML Basics", duration: "25:00", type: "video" },
        { id: 5, title: "HTML Forms", duration: "30:00", type: "video" },
        { id: 6, title: "Semantic HTML", duration: "20:00", type: "video" },
        { id: 7, title: "Assignment: Build a Form", type: "assignment" },
      ],
    },
    {
      id: 3,
      title: "CSS Styling",
      lessons: [
        { id: 8, title: "CSS Selectors", duration: "20:00", type: "video" },
        { id: 9, title: "Flexbox Layout", duration: "35:00", type: "video" },
        { id: 10, title: "CSS Grid", duration: "30:00", type: "video" },
      ],
    },
  ],
  enrolledStudents: [
    { id: 1, name: "Aarav Sharma", email: "aarav@email.com", progress: 75, enrolledAt: new Date("2024-01-20") },
    { id: 2, name: "Priya Thapa", email: "priya@email.com", progress: 45, enrolledAt: new Date("2024-02-15") },
    { id: 3, name: "Bikash Gurung", email: "bikash@email.com", progress: 90, enrolledAt: new Date("2024-01-25") },
    { id: 4, name: "Sita Rai", email: "sita@email.com", progress: 30, enrolledAt: new Date("2024-03-01") },
  ],
  reviews: [
    { id: 1, user: "Aarav Sharma", rating: 5, comment: "Excellent course! Very comprehensive and well-structured.", date: new Date("2024-02-20"), isApproved: true },
    { id: 2, user: "Priya Thapa", rating: 4, comment: "Great content but some lessons could be more detailed.", date: new Date("2024-03-01"), isApproved: true },
    { id: 3, user: "Anonymous", rating: 2, comment: "Not worth the price.", date: new Date("2024-03-05"), isApproved: false },
  ],
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showAlert } = useAlertDialog();
  const [isEditing, setIsEditing] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [formData, setFormData] = useState({
    title: mockCourse.title,
    description: mockCourse.description,
    price: mockCourse.price,
    discountPrice: mockCourse.discountPrice,
    category: mockCourse.category,
    level: mockCourse.level,
    language: mockCourse.language,
  });

  const handleSave = () => {
    toast.success("Course updated successfully!");
    setIsEditing(false);
  };

  const handleApprove = () => {
    toast.success("Course approved and published!");
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    toast.success("Course rejected. Instructor notified.");
    setIsRejectDialogOpen(false);
    setRejectReason("");
  };

  const handleFeature = () => {
    toast.success("Course featured!");
  };

  const handleUnfeature = () => {
    toast.success("Course removed from featured.");
  };

  const handleUnpublish = () => {
    showAlert({
      title: "Unpublish Course",
      description: "Are you sure you want to unpublish this course? Students will retain access but new enrollments will be disabled.",
      confirmText: "Unpublish",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: () => {
        toast.success("Course unpublished.");
      },
    });
  };

  const handleDelete = () => {
    showAlert({
      title: "Delete Course",
      description: "Are you sure you want to delete this course? This will remove all content and unenroll all students. This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: () => {
        toast.success("Course deleted.");
        router.push("/admin-dashboard/courses");
      },
    });
  };

  const handleApproveReview = (reviewId) => {
    toast.success("Review approved.");
  };

  const handleDeleteReview = (reviewId) => {
    toast.success("Review deleted.");
  };

  const getStatusBadge = () => {
    if (mockCourse.isFeatured) {
      return (
        <Badge className="bg-yellow-500">
          <Star className="h-3 w-3 mr-1" />
          Featured
        </Badge>
      );
    }
    switch (mockCourse.status) {
      case "published":
        return <Badge className="bg-green-500">Published</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending Review</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin-dashboard/courses">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-bold">Course Details</h1>
            <p className="text-sm text-muted-foreground">
              View and manage course information
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Course Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Header Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="w-full sm:w-48 h-28 bg-muted rounded-lg overflow-hidden shrink-0">
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h2 className="text-xl font-bold">{mockCourse.title}</h2>
                      {getStatusBadge()}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      by{" "}
                      <Link
                        href={`/admin-dashboard/users/${mockCourse.instructor.id}`}
                        className="text-primary hover:underline"
                      >
                        {mockCourse.instructor.name}
                      </Link>
                    </p>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{mockCourse.category}</Badge>
                      <Badge variant="outline">{mockCourse.level}</Badge>
                      <Badge variant="outline">{mockCourse.language}</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <p className="text-lg font-bold">{mockCourse.students}</p>
                    <p className="text-xs text-muted-foreground">Students</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <Banknote className="h-5 w-5 mx-auto mb-1 text-green-600" />
                    <p className="text-lg font-bold">
                      {(mockCourse.revenue / 1000).toFixed(1)}K
                    </p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <Star className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                    <p className="text-lg font-bold">{mockCourse.rating}</p>
                    <p className="text-xs text-muted-foreground">
                      ({mockCourse.reviewsCount} reviews)
                    </p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <Clock className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                    <p className="text-lg font-bold">{mockCourse.duration}</p>
                    <p className="text-xs text-muted-foreground">
                      {mockCourse.lessonsCount} lessons
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="students">
                  Students ({mockCourse.enrolledStudents.length})
                </TabsTrigger>
                <TabsTrigger value="reviews">
                  Reviews ({mockCourse.reviews.length})
                </TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Course Information</CardTitle>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave}>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) =>
                              setFormData({ ...formData, title: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            rows={4}
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="price">Price (Rs.)</Label>
                            <Input
                              id="price"
                              type="number"
                              value={formData.price}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  price: parseInt(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="discountPrice">
                              Discount Price (Rs.)
                            </Label>
                            <Input
                              id="discountPrice"
                              type="number"
                              value={formData.discountPrice}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  discountPrice: parseInt(e.target.value),
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                              value={formData.category}
                              onValueChange={(value) =>
                                setFormData({ ...formData, category: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Web Development">
                                  Web Development
                                </SelectItem>
                                <SelectItem value="Data Science">
                                  Data Science
                                </SelectItem>
                                <SelectItem value="Mobile Development">
                                  Mobile Development
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Level</Label>
                            <Select
                              value={formData.level}
                              onValueChange={(value) =>
                                setFormData({ ...formData, level: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Beginner">Beginner</SelectItem>
                                <SelectItem value="Intermediate">
                                  Intermediate
                                </SelectItem>
                                <SelectItem value="Advanced">Advanced</SelectItem>
                                <SelectItem value="Beginner to Advanced">
                                  Beginner to Advanced
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Language</Label>
                            <Select
                              value={formData.language}
                              onValueChange={(value) =>
                                setFormData({ ...formData, language: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Nepali">Nepali</SelectItem>
                                <SelectItem value="English">English</SelectItem>
                                <SelectItem value="Hindi">Hindi</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <h4 className="font-semibold mb-2">Description</h4>
                          <p className="text-sm text-muted-foreground">
                            {mockCourse.description}
                          </p>
                        </div>
                        <Separator />
                        <div className="grid sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Original Price:
                            </span>
                            <p className="font-medium">
                              Rs. {mockCourse.price.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Discount Price:
                            </span>
                            <p className="font-medium">
                              Rs. {mockCourse.discountPrice.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Created:</span>
                            <p className="font-medium">
                              {format(mockCourse.createdAt, "MMM d, yyyy")}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Published:
                            </span>
                            <p className="font-medium">
                              {mockCourse.publishedAt
                                ? format(mockCourse.publishedAt, "MMM d, yyyy")
                                : "Not published"}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Last Updated:
                            </span>
                            <p className="font-medium">
                              {format(mockCourse.lastUpdated, "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Curriculum Tab */}
              <TabsContent value="curriculum">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Curriculum</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockCourse.curriculum.map((section, index) => (
                      <div key={section.id} className="border rounded-lg">
                        <div className="p-4 bg-muted/50 font-medium">
                          Section {index + 1}: {section.title}
                        </div>
                        <div className="divide-y">
                          {section.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="p-3 flex items-center gap-3"
                            >
                              {lesson.type === "video" && (
                                <Play className="h-4 w-4 text-primary" />
                              )}
                              {lesson.type === "quiz" && (
                                <FileText className="h-4 w-4 text-orange-500" />
                              )}
                              {lesson.type === "assignment" && (
                                <FileText className="h-4 w-4 text-blue-500" />
                              )}
                              <span className="flex-1 text-sm">{lesson.title}</span>
                              {lesson.duration && (
                                <span className="text-xs text-muted-foreground">
                                  {lesson.duration}
                                </span>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {lesson.type}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Students Tab */}
              <TabsContent value="students">
                <Card>
                  <CardHeader>
                    <CardTitle>Enrolled Students</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockCourse.enrolledStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {student.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link
                              href={`/admin-dashboard/users/${student.id}`}
                              className="font-medium hover:underline"
                            >
                              {student.name}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {student.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${student.progress}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {student.progress}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Enrolled {format(student.enrolledAt, "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Reviews</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockCourse.reviews.map((review) => (
                      <div
                        key={review.id}
                        className={`p-4 border rounded-lg ${
                          !review.isApproved ? "border-orange-300 bg-orange-50/50" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{review.user}</span>
                              {!review.isApproved && (
                                <Badge variant="secondary">Pending Approval</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "text-yellow-500 fill-yellow-500"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="text-sm text-muted-foreground ml-2">
                                {format(review.date, "MMM d, yyyy")}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {!review.isApproved && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-600"
                                onClick={() => handleApproveReview(review.id)}
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDeleteReview(review.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {mockCourse.status === "pending" && (
                  <>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={handleApprove}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve & Publish
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => setIsRejectDialogOpen(true)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject Course
                    </Button>
                    <Separator className="my-4" />
                  </>
                )}

                {mockCourse.status === "published" && (
                  <>
                    {mockCourse.isFeatured ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleUnfeature}
                      >
                        <StarOff className="h-4 w-4 mr-2" />
                        Remove from Featured
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full text-yellow-600"
                        onClick={handleFeature}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Feature Course
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full text-orange-600"
                      onClick={handleUnpublish}
                    >
                      <EyeOff className="h-4 w-4 mr-2" />
                      Unpublish
                    </Button>
                    <Separator className="my-4" />
                  </>
                )}

                <Button
                  variant="outline"
                  className="w-full text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Course
                </Button>
              </CardContent>
            </Card>

            {/* Instructor Info */}
            <Card>
              <CardHeader>
                <CardTitle>Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {mockCourse.instructor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{mockCourse.instructor.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {mockCourse.instructor.email}
                    </p>
                  </div>
                </div>
                <Link href={`/admin-dashboard/users/${mockCourse.instructor.id}`}>
                  <Button variant="outline" className="w-full" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Instructor Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Revenue Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Revenue</span>
                  <span className="font-medium">
                    Rs. {mockCourse.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee (30%)</span>
                  <span className="font-medium">
                    Rs. {(mockCourse.revenue * 0.3).toLocaleString()}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Instructor Earnings</span>
                  <span className="font-medium text-green-600">
                    Rs. {(mockCourse.revenue * 0.7).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Course</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Please provide a reason for rejection. The instructor will be
                notified via email.
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
                >
                  Reject Course
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  );
}
