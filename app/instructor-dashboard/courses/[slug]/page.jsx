"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import InstructorDashboardLayout from "@/components/instructor/InstructorDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Upload,
  X,
  Loader2,
  AlertCircle,
  CalendarDays,
  Users,
  Clock,
  Save,
  AlertTriangle,
  Info,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { courseAPI } from "@/lib/api/courses";
import { categoryAPI } from "@/lib/api/category";

export default function LecturerEditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showReapprovalDialog, setShowReapprovalDialog] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    courseTitle: "",
    courseDesc: "",
    courseShortDesc: "",
    duration: 30,
    weekly_study: 5,
    learn_type: "FREE",
    category: "",
    price: 0,
    discount: 0,
    tags: "",
    embeddedUrl: "",
    requirements: "",
    image: null,
  });

  const [originalData, setOriginalData] = useState(null);
  const [courseStatus, setCourseStatus] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [submitOption, setSubmitOption] = useState("draft"); // "draft" or "submit"

  // Fetch course data and categories on mount
  useEffect(() => {
    if (params.slug) {
      fetchData();
    }
  }, [params.slug]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch course data
      const courseResponse = await courseAPI.getCourseBySlug(params.slug);
      const course = courseResponse.data;

      // Check if lecturer owns this course
      const myCoursesResponse = await courseAPI.getMyCourses('created');
      const myCourse = myCoursesResponse.data?.find(c => c._id === course._id);
      
      if (!myCourse) {
        toast.error("You don't have permission to edit this course");
        router.push('/instructor-dashboard/courses');
        return;
      }

      // Set original data and status
      setOriginalData(course);
      setCourseStatus(course.status);
      setRejectionReason(course.rejectionReason || "");

      // Populate form
      setFormData({
        courseTitle: course.courseTitle || "",
        courseDesc: course.courseDesc || "",
        courseShortDesc: course.courseShortDesc || "",
        duration: course.duration || 30,
        weekly_study: course.weekly_study || 5,
        learn_type: course.learn_type || "FREE",
        category: course.category?._id || "",
        price: course.price || 0,
        discount: course.discount || 0,
        tags: course.tags?.join(", ") || "",
        embeddedUrl: course.embeddedUrl || "",
        requirements: course.requirements || "",
        image: null,
      });

      // Set tags
      if (course.tags && Array.isArray(course.tags)) {
        setTags(course.tags);
      }

      // Set current image
      if (course.image) {
        setCurrentImage(course.image);
        setImagePreview(`${process.env.NEXT_PUBLIC_API_URL}/${course.image}`);
      }

      // Set initial submit option based on status
      if (course.status === 'pending_approval') {
        setSubmitOption('submit');
      } else {
        setSubmitOption('draft');
      }

      // Fetch categories
      const categoryResponse = await categoryAPI.getActiveCategories();
      setCategories(categoryResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error.message || 'Failed to load course data');
      router.push('/instructor-dashboard/courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Select an image file");
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      toast.error("Image must be under 1MB");
      return;
    }

    setFormData((p) => ({ ...p, image: file }));

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData((p) => ({ ...p, image: null }));
    setImagePreview(currentImage ? `${process.env.NEXT_PUBLIC_API_URL}/${currentImage}` : null);
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = () => {
    if (!formData.courseTitle.trim()) {
      toast.error('Course title is required');
      return false;
    }

    if (!formData.courseDesc.trim()) {
      toast.error('Course description is required');
      return false;
    }

    if (!formData.category) {
      toast.error('Please select a category');
      return false;
    }

    if (formData.duration <= 0) {
      toast.error('Duration must be greater than 0');
      return false;
    }

    if (formData.weekly_study <= 0) {
      toast.error('Weekly study hours must be greater than 0');
      return false;
    }

    if (formData.learn_type === 'PAID' && (!formData.price || formData.price <= 0)) {
      toast.error('Price is required and must be greater than 0 for paid courses');
      return false;
    }

    if (formData.learn_type === 'PAID' && (formData.discount < 0 || formData.discount > 100)) {
      toast.error('Discount must be between 0 and 100');
      return false;
    }

    return true;
  };

  const checkIfReapprovalNeeded = () => {
    // Re-approval needed if:
    // 1. Course is approved/published and lecturer wants to submit changes
    // 2. Course is approved/published and lecturer makes substantial changes
    if (courseStatus === 'approved' || courseStatus === 'published') {
      if (submitOption === 'submit') {
        return true;
      }
      
      // Check for substantial changes
      if (originalData) {
        const substantialChanges = [
          'courseTitle', 'courseDesc', 'learn_type', 'category', 'price'
        ];
        
        for (const field of substantialChanges) {
          if (formData[field] !== originalData[field]) {
            return true;
          }
        }
      }
    }
    
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Check if re-approval is needed for approved/published courses
    if (checkIfReapprovalNeeded() && submitOption === 'submit') {
      setShowReapprovalDialog(true);
      return;
    }

    await submitCourse();
  };

  const submitCourse = async () => {
    try {
      setIsSubmitting(true);

      // Prepare form data for file upload
      const submitFormData = new FormData();

      // Add text fields
      submitFormData.append('courseTitle', formData.courseTitle);
      submitFormData.append('courseDesc', formData.courseDesc);
      submitFormData.append('courseShortDesc', formData.courseShortDesc || formData.courseDesc.substring(0, 150) + '...');
      submitFormData.append('duration', formData.duration.toString());
      submitFormData.append('weekly_study', formData.weekly_study.toString());
      submitFormData.append('learn_type', formData.learn_type);
      submitFormData.append('category', formData.category);

      if (formData.learn_type === 'PAID') {
        submitFormData.append('price', formData.price.toString());
        submitFormData.append('discount', formData.discount.toString());
      }

      if (tags.length > 0) {
        submitFormData.append('tags', tags.join(','));
      }

      if (formData.embeddedUrl) {
        submitFormData.append('embeddedUrl', formData.embeddedUrl);
      }

      if (formData.requirements) {
        submitFormData.append('requirements', formData.requirements);
      }

      // Add image if new one selected
      if (formData.image) {
        submitFormData.append('image', formData.image);
      }

      // Determine final status
      let finalStatus = formData.status;
      if (submitOption === 'submit') {
        // If course is approved/published and being resubmitted, set to pending_approval
        if (courseStatus === 'approved' || courseStatus === 'published') {
          submitFormData.append('status', 'pending_approval');
        }
      }

      // Update course
      const response = await courseAPI.updateCourse(params.slug, submitFormData);

      if (submitOption === 'submit') {
        if (courseStatus === 'approved' || courseStatus === 'published') {
          toast.success('Course updated and submitted for re-approval!');
        } else {
          toast.success('Course submitted for approval!');
        }
      } else {
        toast.success('Course saved as draft!');
      }

      // Redirect to courses page
      router.push('/instructor-dashboard/courses');
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error(error.message || 'Failed to update course');
    } finally {
      setIsSubmitting(false);
      setShowReapprovalDialog(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-blue-500 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Approved
        </Badge>;
      case 'published':
        return <Badge className="bg-green-500 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Published
        </Badge>;
      case 'pending_approval':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending Review
        </Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>;
      case 'draft':
        return <Badge variant="outline" className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          Draft
        </Badge>;
      case 'archived':
        return <Badge variant="outline" className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          Archived
        </Badge>;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (courseStatus) {
      case 'rejected':
        return {
          title: "Course Rejected",
          message: "Your course was rejected. Please review the feedback below and make necessary changes before resubmitting.",
          type: "error"
        };
      case 'pending_approval':
        return {
          title: "Pending Approval",
          message: "Your course is currently under review by our admin team.",
          type: "warning"
        };
      case 'approved':
      case 'published':
        return {
          title: "Course Approved",
          message: "Your course is approved. Editing will require re-approval.",
          type: "info"
        };
      case 'draft':
        return {
          title: "Draft Course",
          message: "This course is saved as a draft. Submit for approval when ready.",
          type: "info"
        };
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <InstructorDashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </InstructorDashboardLayout>
    );
  }

  const statusMessage = getStatusMessage();

  return (
    <InstructorDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/instructor-dashboard/courses">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-bold">Edit Course</h1>
            <p className="text-sm text-muted-foreground">
              Update your course - changes may require re-approval
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(courseStatus)}
            <Link href={`/courses/${params.slug}`} target="_blank">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Alert */}
        {statusMessage && (
          <Card className={`mb-6 ${
            statusMessage.type === 'error' ? 'border-red-200 bg-red-50 dark:bg-red-900/20' :
            statusMessage.type === 'warning' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20' :
            'border-blue-200 bg-blue-50 dark:bg-blue-900/20'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {statusMessage.type === 'error' ? (
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-500 mt-0.5" />
                ) : statusMessage.type === 'warning' ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                ) : (
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-500 mt-0.5" />
                )}
                <div className="space-y-1">
                  <h3 className="font-medium">
                    {statusMessage.title}
                  </h3>
                  <p className="text-sm">
                    {statusMessage.message}
                  </p>
                  {rejectionReason && (
                    <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded border">
                      <p className="text-sm font-medium mb-1">Rejection Reason:</p>
                      <p className="text-sm text-muted-foreground">{rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Course Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="courseTitle">Course Title *</Label>
                    <Input
                      id="courseTitle"
                      name="courseTitle"
                      placeholder="e.g., Complete Web Development Bootcamp"
                      value={formData.courseTitle}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="courseShortDesc">Short Description</Label>
                    <Input
                      id="courseShortDesc"
                      name="courseShortDesc"
                      placeholder="Brief description (max 150 characters)"
                      value={formData.courseShortDesc}
                      onChange={handleInputChange}
                      maxLength={150}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.courseShortDesc.length}/150 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="courseDesc">Full Description *</Label>
                    <Textarea
                      id="courseDesc"
                      name="courseDesc"
                      placeholder="Detailed course description..."
                      rows={6}
                      value={formData.courseDesc}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (days) *</Label>
                      <Input
                        id="duration"
                        name="duration"
                        type="number"
                        min="1"
                        placeholder="30"
                        value={formData.duration}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weekly_study">Weekly Study Hours *</Label>
                      <Input
                        id="weekly_study"
                        name="weekly_study"
                        type="number"
                        min="1"
                        placeholder="5"
                        value={formData.weekly_study}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category & Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Category & Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleSelectChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            <div className="flex items-center gap-2">
                              {category.image ? (
                                <img
                                  src={category.image}
                                  alt={category.categoryName}
                                  className="w-6 h-6 rounded object-cover"
                                />
                              ) : (
                                <div
                                  className="w-6 h-6 rounded flex items-center justify-center"
                                  style={{ backgroundColor: category.color || '#4F46E5' }}
                                >
                                  <span className="text-white text-xs">📚</span>
                                </div>
                              )}
                              <span>{category.categoryName}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Course Type *</Label>
                    <Tabs
                      value={formData.learn_type}
                      onValueChange={(value) => handleSelectChange('learn_type', value)}
                      className="w-full"
                    >
                      <TabsList className="grid grid-cols-2">
                        <TabsTrigger value="FREE">Free</TabsTrigger>
                        <TabsTrigger value="PAID">Paid</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {formData.learn_type === 'PAID' && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (NPR) *</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">NPR</span>
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            min="0"
                            placeholder="0"
                            className="pl-12"
                            value={formData.price}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discount">Discount (%)</Label>
                        <Input
                          id="discount"
                          name="discount"
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0"
                          value={formData.discount}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements</Label>
                    <Textarea
                      id="requirements"
                      name="requirements"
                      placeholder="What will students need to know or have before starting this course?"
                      rows={3}
                      value={formData.requirements}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="embeddedUrl">Preview Video URL (Optional)</Label>
                    <Input
                      id="embeddedUrl"
                      name="embeddedUrl"
                      placeholder="https://www.youtube.com/embed/..."
                      value={formData.embeddedUrl}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      YouTube embed URL (e.g., https://www.youtube.com/embed/video_id)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag and press Enter"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                      />
                      <Button type="button" variant="outline" onClick={handleAddTag}>
                        Add
                      </Button>
                    </div>

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Image & Actions */}
            <div className="space-y-6">
              {/* Course Image */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    {imagePreview ? (
                      <div>
                        <img
                          src={imagePreview}
                          className="w-full h-48 object-cover rounded-lg mb-3"
                          alt="preview"
                        />
                        <div className="flex gap-2">
                          <label
                            htmlFor="image-upload"
                            className="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
                          >
                            <Upload className="h-4 w-4" />
                            Change
                          </label>
                          <Button
                            type="button"
                            variant="destructive"
                            className="flex-1"
                            onClick={removeImage}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 mx-auto mb-2" />
                        <label
                          htmlFor="image-upload"
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
                        >
                          Choose File
                        </label>
                      </>
                    )}
                    <input
                      id="image-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Recommended: 1280×720px (16:9 ratio), Max 1MB
                  </p>
                </CardContent>
              </Card>

              {/* Course Stats Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current Status</span>
                    {getStatusBadge(courseStatus)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <Badge variant={formData.learn_type === 'PAID' ? 'default' : 'secondary'}>
                      {formData.learn_type}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <div className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{formData.duration} days</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Weekly Study</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{formData.weekly_study} hrs/week</span>
                    </div>
                  </div>
                  {formData.learn_type === 'PAID' && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Price</span>
                        <div className="text-right">
                          {formData.discount > 0 ? (
                            <>
                              <div className="flex items-center gap-1 justify-end">
                                <span className="font-medium">
                                  NPR {(formData.price - (formData.price * formData.discount / 100)).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 justify-end">
                                <span className="text-xs text-muted-foreground line-through">
                                  NPR {formData.price.toLocaleString()}
                                </span>
                                <Badge variant="outline" className="ml-1 text-xs">
                                  -{formData.discount}%
                                </Badge>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center gap-1 justify-end">
                              <span className="font-medium">NPR {formData.price.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Submission Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Update Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <input
                        type="radio"
                        id="save-draft"
                        name="submitOption"
                        value="draft"
                        checked={submitOption === "draft"}
                        onChange={(e) => setSubmitOption(e.target.value)}
                        className="h-4 w-4 text-primary mt-1"
                      />
                      <Label htmlFor="save-draft" className="cursor-pointer">
                        <div>
                          <p className="font-medium">Save as Draft</p>
                          <p className="text-xs text-muted-foreground">
                            Save changes without submitting for approval
                          </p>
                        </div>
                      </Label>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <input
                        type="radio"
                        id="submit-approval"
                        name="submitOption"
                        value="submit"
                        checked={submitOption === "submit"}
                        onChange={(e) => setSubmitOption(e.target.value)}
                        className="h-4 w-4 text-primary mt-1"
                      />
                      <Label htmlFor="submit-approval" className="cursor-pointer">
                        <div>
                          <p className="font-medium">Submit for Approval</p>
                          <p className="text-xs text-muted-foreground">
                            {courseStatus === 'approved' || courseStatus === 'published' 
                              ? 'Submit changes for admin re-approval'
                              : 'Submit course for admin approval'}
                          </p>
                        </div>
                      </Label>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">Important:</p>
                    <p className="text-xs text-muted-foreground">
                      {courseStatus === 'approved' || courseStatus === 'published' 
                        ? 'Editing an approved course will unpublish it until admin re-approves your changes.'
                        : 'Your course needs admin approval before it can be published.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {submitOption === 'draft' ? 'Saving...' : 'Submitting...'}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {submitOption === 'draft' ? 'Save as Draft' : 'Submit for Approval'}
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push('/instructor-dashboard/courses')}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>

                    {courseStatus === 'pending_approval' && (
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full"
                        onClick={() => {
                          setSubmitOption('draft');
                          toast.info('You can now save as draft. The course will remain pending approval.');
                        }}
                      >
                        Keep as Pending
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>

        {/* Re-approval Dialog */}
        <AlertDialog open={showReapprovalDialog} onOpenChange={setShowReapprovalDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Re-approval Required
              </AlertDialogTitle>
              <AlertDialogDescription>
                <div className="space-y-3">
                  <p>
                    You are editing an approved/published course. Submitting these changes will:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Unpublish the course temporarily</li>
                    <li>Send it for admin re-approval</li>
                    <li>Notify enrolled students about the update</li>
                  </ul>
                  <p className="text-sm font-medium mt-3">
                    Are you sure you want to proceed?
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={submitCourse} className="bg-orange-600 hover:bg-orange-700">
                Yes, Submit for Re-approval
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </InstructorDashboardLayout>
  );
}