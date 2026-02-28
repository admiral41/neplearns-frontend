"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  ArrowLeft,
  Upload,
  X,
  Loader2,
  AlertCircle,
  CalendarDays,
  Users,
  Clock,
  Image as ImageIcon,
  BookOpen,
  AlertTriangle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { courseAPI } from "@/lib/api/courses";
import { categoryAPI } from "@/lib/api/category";

export default function LecturerCreateCoursePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [submitOption, setSubmitOption] = useState("draft"); // "draft" or "submit"

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await categoryAPI.getActiveCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      toast.error("Image must be less than 1MB");
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);

    const input = document.getElementById("image-upload");
    if (input) input.value = "";
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

    if (formData.learn_type === 'PAID') {
      if (!formData.price || formData.price <= 0) {
        toast.error('Price is required and must be greater than 0 for PAID courses');
        return false;
      }
      if (formData.discount < 0 || formData.discount > 100) {
        toast.error('Discount must be between 0 and 100');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
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

      // Add image if selected
      if (imageFile) {
        submitFormData.append('image', imageFile);
      }

      // Use lecturer-specific API endpoint
      const response = await courseAPI.createCourseAsLecturer(submitFormData);

      if (submitOption === 'submit') {
        toast.success('Course submitted for approval! Admin will review it soon.');
      } else {
        toast.success('Course saved as draft! You can submit it for approval later.');
      }

      // Redirect to courses page
      router.push('/instructor-dashboard/courses');
      
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error(error.message || 'Failed to create course. Please check all required fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h1 className="text-lg sm:text-xl font-bold">Create New Course</h1>
            <p className="text-sm text-muted-foreground">
              Create a new course - it will need admin approval before publishing
            </p>
          </div>
        </div>

        {/* Approval Notice */}
        <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-medium text-yellow-800 dark:text-yellow-300">
                  Course Approval Required
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  As a lecturer, all your courses need to be approved by an admin before they can be published.
                  You can save as draft and submit for approval when ready.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                    <Label htmlFor="courseTitle">
                      Course Title <span className="text-red-500">*</span>
                    </Label>
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
                    <Label htmlFor="courseDesc">
                      Full Description <span className="text-red-500">*</span>
                    </Label>
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
                      <Label htmlFor="duration">
                        Duration (days) <span className="text-red-500">*</span>
                      </Label>
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
                      <Label htmlFor="weekly_study">
                        Weekly Study Hours <span className="text-red-500">*</span>
                      </Label>
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
                    <Label>
                      Category <span className="text-red-500">*</span>
                    </Label>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading categories...</span>
                      </div>
                    ) : (
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleSelectChange('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.length === 0 ? (
                            <SelectItem value="" disabled>
                              No categories available
                            </SelectItem>
                          ) : (
                            categories.map((category) => (
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
                                      {category.icon ? (
                                        <span className="text-white text-xs">{category.icon}</span>
                                      ) : (
                                        <BookOpen className="h-3 w-3 text-white" />
                                      )}
                                    </div>
                                  )}
                                  <span>{category.categoryName}</span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Course Type <span className="text-red-500">*</span>
                    </Label>
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
                        <Label htmlFor="price">
                          Price (NPR) <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">NPR</span>
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="999"
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
                    <Label htmlFor="tags">Tags</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        id="tags"
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
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center hover:border-primary transition-colors">

                      {/* hidden input */}
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageChange}
                      />

                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Course preview"
                            className="w-full h-48 object-cover rounded-lg mb-2"
                          />

                          <div className="flex gap-2">
                            <label
                              htmlFor="image-upload"
                              className="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
                            >
                              <Upload className="h-4 w-4" />
                              Change Image
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
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="p-3 rounded-full bg-primary/10 mb-3">
                            <ImageIcon className="h-8 w-8 text-primary" />
                          </div>

                          <p className="text-sm font-medium mb-2">
                            Upload Course Image
                          </p>

                          <p className="text-xs text-muted-foreground mb-4">
                            PNG, JPG up to 1MB
                          </p>

                          <label
                            htmlFor="image-upload"
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
                          >
                            <Upload className="h-4 w-4" />
                            Choose File
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        Recommended: 1280×720px (16:9 ratio)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Maximum file size: 1MB
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Stats Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <Badge variant={formData.learn_type === 'PAID' ? 'default' : 'secondary'}>
                      {formData.learn_type}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <div className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{formData.duration} days</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Weekly Study</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{formData.weekly_study} hrs/week</span>
                    </div>
                  </div>
                  {formData.learn_type === 'PAID' && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Price</span>
                        <div className="text-right">
                          {formData.discount > 0 ? (
                            <>
                              <div className="flex items-center gap-1 justify-end">
                                <span className="font-medium">
                                  NPR {Math.round(formData.price - (formData.price * formData.discount / 100)).toLocaleString()}
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
                  <CardTitle>Submission Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-500 mt-1" />
                      <p className="text-sm text-muted-foreground">
                        All courses created by lecturers require admin approval before publishing.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="save-draft"
                          name="submitOption"
                          value="draft"
                          checked={submitOption === "draft"}
                          onChange={(e) => setSubmitOption(e.target.value)}
                          className="h-4 w-4 text-primary"
                        />
                        <Label htmlFor="save-draft" className="cursor-pointer">
                          <div>
                            <p className="font-medium">Save as Draft</p>
                            <p className="text-xs text-muted-foreground">
                              Save course and submit for approval later
                            </p>
                          </div>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="submit-approval"
                          name="submitOption"
                          value="submit"
                          checked={submitOption === "submit"}
                          onChange={(e) => setSubmitOption(e.target.value)}
                          className="h-4 w-4 text-primary"
                        />
                        <Label htmlFor="submit-approval" className="cursor-pointer">
                          <div>
                            <p className="font-medium">Submit for Approval</p>
                            <p className="text-xs text-muted-foreground">
                              Submit course to admin for review and approval
                            </p>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">
                      {submitOption === 'draft' ? 'Draft Status:' : 'Approval Process:'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {submitOption === 'draft' 
                        ? 'Course will be saved privately. You can edit and submit it later.'
                        : 'Course will be sent to admin for review. You\'ll be notified when approved or if changes are needed.'}
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
                        submitOption === 'draft' ? 'Save as Draft' : 'Submit for Approval'
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
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </InstructorDashboardLayout>
  );
}