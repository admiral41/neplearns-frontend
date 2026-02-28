"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Upload,
  X,
  Loader2,
  CalendarDays,
  Users,
  Clock,
  Save,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { courseAPI } from "@/lib/api/courses";
import { categoryAPI } from "@/lib/api/category";

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);

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
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);

  // Admin action states
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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

      // Set original data for comparison
      setOriginalData(course);

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
        image: null, // New image file
      });

      //  tags
      if (course.tags && Array.isArray(course.tags)) {
        setTags(course.tags);
      }

      //  current image
      if (course.image) {
        setCurrentImage(course.image);
        setImagePreview(`${process.env.NEXT_PUBLIC_API_URL}/${course.image}`);

      }

      // Fetch categories
      const categoryResponse = await categoryAPI.getActiveCategories();
      setCategories(categoryResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error.message || 'Failed to load course data');
      router.push('/admin-dashboard/courses');
    } finally {
      setIsLoading(false);
    }
  };

  // Admin action handlers
  const handleApprove = async (publishDirectly = true) => {
    try {
      setIsProcessing(true);
      await courseAPI.processCourseRequest(originalData._id, {
        action: 'approve',
        publishDirectly,
        reason: 'Course meets our quality standards.'
      });

      toast.success(`Course ${publishDirectly ? 'approved and published' : 'approved'} successfully!`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error approving course:', error);
      toast.error(error.message || 'Failed to approve course');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim() || rejectReason.trim().length < 10) {
      toast.error("Please provide a reason for rejection (minimum 10 characters).");
      return;
    }

    try {
      setIsProcessing(true);
      await courseAPI.processCourseRequest(originalData._id, {
        action: 'reject',
        reason: rejectReason
      });

      toast.success("Course rejected. Instructor will be notified.");
      setIsRejectDialogOpen(false);
      setRejectReason("");
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error rejecting course:', error);
      toast.error(error.message || 'Failed to reject course');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePublishToggle = async (publish) => {
    try {
      setIsProcessing(true);
      await courseAPI.togglePublish(params.slug, publish);
      toast.success(`Course ${publish ? 'published' : 'unpublished'} successfully!`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error(error.message || 'Failed to update course status');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = () => {
    if (!originalData) return null;

    switch (originalData.status) {
      case 'approved':
        return originalData.published ?
          <Badge className="bg-green-500">Published</Badge> :
          <Badge className="bg-blue-500">Approved</Badge>;
      case 'pending_approval':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-700">Pending Review</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return null;
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
    setImagePreview(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.courseTitle.trim()) {
      toast.error('Course title is required');
      return;
    }

    if (!formData.courseDesc.trim()) {
      toast.error('Course description is required');
      return;
    }

    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    if (formData.learn_type === 'PAID' && (!formData.price || formData.price <= 0)) {
      toast.error('Price is required for paid courses');
      return;
    }

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

      // Update course
      const response = await courseAPI.updateCourse(params.slug, submitFormData);

      toast.success(response.msg || 'Course updated successfully!');

      // Redirect to course detail page
      router.push(`/admin-dashboard/courses/${response.data.courseSlug || params.slug}`);
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error(error.message || 'Failed to update course');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/admin-dashboard/courses`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-bold">Edit Course</h1>
            <p className="text-sm text-muted-foreground">
              Update course information
            </p>
          </div>
        </div>

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
                            {category.categoryName}
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
              {/* Admin Actions Card */}
              {originalData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Course Status</span>
                      {getStatusBadge()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Pending Approval Actions */}
                    {originalData.status === 'pending_approval' && (
                      <>
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(true)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 mr-2" />
                          )}
                          Approve & Publish
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                          onClick={() => handleApprove(false)}
                          disabled={isProcessing}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve Only
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                          onClick={() => setIsRejectDialogOpen(true)}
                          disabled={isProcessing}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}

                    {/* Approved Course Actions */}
                    {originalData.status === 'approved' && (
                      <>
                        {originalData.published ? (
                          <Button
                            variant="outline"
                            className="w-full text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white"
                            onClick={() => handlePublishToggle(false)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <X className="h-4 w-4 mr-2" />
                            )}
                            Unpublish
                          </Button>
                        ) : (
                          <Button
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={() => handlePublishToggle(true)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4 mr-2" />
                            )}
                            Publish
                          </Button>
                        )}
                      </>
                    )}

                    {/* Rejected Course Info */}
                    {originalData.status === 'rejected' && originalData.rejectionReason && (
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm font-medium text-red-700 mb-1">Rejection Reason:</p>
                        <p className="text-sm text-red-600">{originalData.rejectionReason}</p>
                      </div>
                    )}

                    {/* Course Meta Info */}
                    {originalData.createdBy && (
                      <div className="pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Instructor</p>
                        <p className="text-sm font-medium">
                          {originalData.createdBy.firstname} {originalData.createdBy.lastname}
                        </p>
                        {originalData.createdBy.email && (
                          <p className="text-xs text-muted-foreground">{originalData.createdBy.email}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

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
                </CardContent>
              </Card>

              {/* Course Stats Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
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
                                  NPR {formData.price - (formData.price * formData.discount / 100)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 justify-end">
                                <span className="text-xs text-muted-foreground line-through">
                                  NPR {formData.price}
                                </span>
                                <Badge variant="outline" className="ml-1 text-xs">
                                  -{formData.discount}%
                                </Badge>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center gap-1 justify-end">
                              <span className="font-medium">NPR {formData.price}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
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
                          Updating Course...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Update Course
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/admin-dashboard/courses/${params.slug}`)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Course</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejection. The instructor will be notified via email.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {originalData && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">Course:</p>
                  <p className="text-sm">{originalData.courseTitle}</p>
                  {originalData.createdBy && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Instructor: {originalData.createdBy.firstname} {originalData.createdBy.lastname}
                    </p>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="reason">Rejection Reason *</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter detailed reason for rejection (minimum 10 characters)..."
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 10 characters required
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsRejectDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={rejectReason.trim().length < 10 || isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Reject Course
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  );
}