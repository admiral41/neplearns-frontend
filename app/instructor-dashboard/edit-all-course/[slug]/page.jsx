"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

// Components
import InstructorDashboardLayout from "@/components/instructor/InstructorDashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Icons
import {
  ArrowLeft,
  Upload,
  X,
  Loader2,
  BookOpen,
  Users,
  Clock,
  CalendarDays,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  PlayCircle,
  ChevronRight,
  CheckCircle,
  XCircle,
  FileText,
  Eye,
  Save,
  AlertCircle,
  DollarSign,
  Layers,
  Video,
  Image as ImageIcon,
  Tag,
  Globe,
  BarChart3,
  ExternalLink,
  Link2,
  FileIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

// APIs & Editor
import { courseAPI } from "@/lib/api/courses";
import { weekAPI } from "@/lib/api/weeks";
import { lessonAPI } from "@/lib/api/lessons";
import { categoryAPI } from "@/lib/api/category";
import { resourceAPI } from "@/lib/api/resources";
import ContentEditor from "@/components/editor/ContentEditor";

export default function InstructorEditAllCoursePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug;

  // State
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReapprovalDialog, setShowReapprovalDialog] = useState(false);

  const [course, setCourse] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [lessons, setLessons] = useState({});
  const [resources, setResources] = useState({});
  const [categories, setCategories] = useState([]);
  const [originalData, setOriginalData] = useState(null);
  const [courseStatus, setCourseStatus] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

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
    isActive: true,
  });

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [submitOption, setSubmitOption] = useState("draft");

  // Weeks & Lessons state
  const [selectedWeek, setSelectedWeek] = useState("");
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [expandedLesson, setExpandedLesson] = useState(null);

  // Dialog states
  const [isWeekDialogOpen, setIsWeekDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [isEditingWeek, setIsEditingWeek] = useState(false);
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [isEditingResource, setIsEditingResource] = useState(false);
  const [editingWeek, setEditingWeek] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [editingResource, setEditingResource] = useState(null);
  const [activeLessonId, setActiveLessonId] = useState(null);

  // Form data for dialogs
  const [weekFormData, setWeekFormData] = useState({
    title: "",
    weekNumber: "",
    description: "",
    isActive: true,
  });

  const [lessonFormData, setLessonFormData] = useState({
    lessonTitle: "",
    lessonContent: "",
    shortDescription: "",
    order: "",
    duration: "",
    videoUrl: "",
    isActive: true,
  });

  const [resourceFormData, setResourceFormData] = useState({
    title: "",
    url: "",
    type: "LINK",
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;

      try {
        setIsLoading(true);

        const courseResponse = await courseAPI.getCourseBySlug(slug);
        const courseData = courseResponse.data;

        if (!courseData) {
          toast.error("Course not found");
          router.push("/instructor-dashboard/courses");
          return;
        }

        setCourse(courseData);
        setOriginalData(courseData);
        setCourseStatus(courseData.status);
        setRejectionReason(courseData.rejectionReason || "");

        // Populate form
        setFormData({
          courseTitle: courseData.courseTitle || "",
          courseDesc: courseData.courseDesc || "",
          courseShortDesc: courseData.courseShortDesc || "",
          duration: courseData.duration || 30,
          weekly_study: courseData.weekly_study || 5,
          learn_type: courseData.learn_type || "FREE",
          category: courseData.category?._id || courseData.category || "",
          price: courseData.price || 0,
          discount: courseData.discount || 0,
          tags: courseData.tags?.join(",") || "",
          embeddedUrl: courseData.embeddedUrl || "",
          requirements: courseData.requirements || "",
          isActive: courseData.isActive !== false,
        });

        // Handle tags
        if (courseData.tags) {
          setTags(Array.isArray(courseData.tags)
            ? courseData.tags.filter(Boolean)
            : String(courseData.tags).split(",").filter(Boolean)
          );
        }

        if (courseData.image) {
          setCurrentImage(courseData.image);
          setImagePreview(courseData.image);
        }

        // Fetch related data
        const [weeksRes, categoriesRes] = await Promise.all([
          weekAPI.getWeeksByCourse(courseData._id),
          categoryAPI.getActiveCategories()
        ]);

        setWeeks(weeksRes.data || []);
        setCategories(categoriesRes.data || []);

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load course data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug, router]);

  // Fetch lessons for a week
  const fetchLessonsForWeek = async (weekId) => {
    try {
      const response = await lessonAPI.getLessonsByWeek(weekId);
      setLessons(prev => ({ ...prev, [weekId]: response.data || [] }));
    } catch (error) {
      console.error("Error fetching lessons:", error);
    }
  };

  // Fetch resources for a lesson
  const fetchResourcesForLesson = async (lessonId) => {
    try {
      const response = await resourceAPI.getResourcesByLesson(lessonId);
      setResources(prev => ({
        ...prev,
        [lessonId]: response.data || response || []
      }));
    } catch (error) {
      setResources(prev => ({ ...prev, [lessonId]: [] }));
    }
  };

  useEffect(() => {
    if (expandedWeek && !lessons[expandedWeek]) {
      fetchLessonsForWeek(expandedWeek);
    }
  }, [expandedWeek, lessons]);

  useEffect(() => {
    if (expandedLesson && !resources[expandedLesson]) {
      fetchResourcesForLesson(expandedLesson);
    }
  }, [expandedLesson, resources]);

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Image handlers
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
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(currentImage || null);
  };

  // Tag handlers
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Week handlers
  const openCreateWeekDialog = () => {
    const nextNumber = weeks.length > 0
      ? Math.max(...weeks.map(w => w.weekNumber || 0)) + 1
      : 1;

    setWeekFormData({
      title: "",
      weekNumber: nextNumber.toString(),
      description: "",
      isActive: true,
    });
    setIsEditingWeek(false);
    setEditingWeek(null);
    setIsWeekDialogOpen(true);
  };

  const openEditWeekDialog = (week) => {
    setWeekFormData({
      title: week.title,
      weekNumber: week.weekNumber?.toString() || "",
      description: week.description || "",
      isActive: week.isActive,
    });
    setEditingWeek(week);
    setIsEditingWeek(true);
    setIsWeekDialogOpen(true);
  };

  const handleWeekSubmit = async () => {
    if (!weekFormData.title.trim()) {
      toast.error("Week title is required");
      return;
    }

    try {
      const weekData = {
        course: course._id,
        title: weekFormData.title.trim(),
        weekNumber: parseInt(weekFormData.weekNumber),
        description: weekFormData.description.trim(),
        isActive: weekFormData.isActive,
      };

      if (isEditingWeek && editingWeek) {
        const response = await weekAPI.updateWeek(editingWeek._id, weekData);
        if (response.success) {
          toast.success("Week updated!");
          setWeeks(prev => prev.map(w =>
            w._id === editingWeek._id ? { ...w, ...weekData } : w
          ));
        }
      } else {
        const response = await weekAPI.createWeek(weekData);
        if (response.success) {
          toast.success("Week created!");
          setWeeks(prev => [...prev, response.data]);
        }
      }
      setIsWeekDialogOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to save week");
    }
  };

  const handleDeleteWeek = async (weekId) => {
    if (!confirm("Delete this week and all its lessons?")) return;

    try {
      const response = await weekAPI.deleteWeek(weekId);
      if (response.success) {
        toast.success("Week deleted");
        setWeeks(prev => prev.filter(w => w._id !== weekId));
        setLessons(prev => {
          const newLessons = { ...prev };
          delete newLessons[weekId];
          return newLessons;
        });
      }
    } catch (error) {
      toast.error("Failed to delete week");
    }
  };

  // Lesson handlers
  const openCreateLessonDialog = (weekId) => {
    const weekLessons = lessons[weekId] || [];
    const nextOrder = weekLessons.length > 0
      ? Math.max(...weekLessons.map(l => l.order || 0)) + 1
      : 1;

    setLessonFormData({
      lessonTitle: "",
      lessonContent: "",
      shortDescription: "",
      order: nextOrder.toString(),
      duration: "",
      videoUrl: "",
      isActive: true,
    });
    setSelectedWeek(weekId);
    setIsEditingLesson(false);
    setEditingLesson(null);
    setIsLessonDialogOpen(true);
  };

  const openEditLessonDialog = (lesson, weekId) => {
    setLessonFormData({
      lessonTitle: lesson.lessonTitle || lesson.title || "",
      lessonContent: lesson.lessonContent || lesson.content || "",
      shortDescription: lesson.shortDescription || "",
      order: lesson.order?.toString() || "",
      duration: lesson.duration?.toString() || "",
      videoUrl: lesson.videoUrl || "",
      isActive: lesson.isActive !== false,
    });
    setSelectedWeek(weekId);
    setEditingLesson(lesson);
    setIsEditingLesson(true);
    setIsLessonDialogOpen(true);
  };

  const handleLessonSubmit = async () => {
    if (!lessonFormData.lessonTitle.trim()) {
      toast.error("Lesson title is required");
      return;
    }

    if (!lessonFormData.lessonContent.trim()) {
      toast.error("Lesson content is required");
      return;
    }

    try {
      const lessonData = {
        week: selectedWeek,
        lessonTitle: lessonFormData.lessonTitle.trim(),
        lessonContent: lessonFormData.lessonContent.trim(),
        shortDescription: lessonFormData.shortDescription.trim(),
        order: parseInt(lessonFormData.order),
        duration: lessonFormData.duration ? parseInt(lessonFormData.duration) : 0,
        videoUrl: lessonFormData.videoUrl.trim(),
        isActive: lessonFormData.isActive,
      };

      if (isEditingLesson && editingLesson) {
        const response = await lessonAPI.updateLesson(editingLesson._id, lessonData);
        if (response.success) {
          toast.success("Lesson updated!");
          setLessons(prev => ({
            ...prev,
            [selectedWeek]: (prev[selectedWeek] || []).map(l =>
              l._id === editingLesson._id ? { ...l, ...lessonData } : l
            )
          }));
        }
      } else {
        const response = await lessonAPI.createLesson(lessonData);
        if (response.success) {
          toast.success("Lesson created!");
          setLessons(prev => ({
            ...prev,
            [selectedWeek]: [...(prev[selectedWeek] || []), response.data]
          }));
        }
      }
      setIsLessonDialogOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to save lesson");
    }
  };

  const handleDeleteLesson = async (lessonId, weekId) => {
    if (!confirm("Delete this lesson?")) return;

    try {
      const response = await lessonAPI.deleteLesson(lessonId);
      if (response.success) {
        toast.success("Lesson deleted");
        setLessons(prev => ({
          ...prev,
          [weekId]: (prev[weekId] || []).filter(l => l._id !== lessonId)
        }));
        setResources(prev => {
          const newResources = { ...prev };
          delete newResources[lessonId];
          return newResources;
        });
      }
    } catch (error) {
      toast.error("Failed to delete lesson");
    }
  };

  // Resource handlers
  const openCreateResourceDialog = (lessonId) => {
    setResourceFormData({
      title: "",
      url: "",
      type: "LINK",
    });
    setActiveLessonId(lessonId);
    setIsEditingResource(false);
    setEditingResource(null);
    setIsResourceDialogOpen(true);
  };

  const openEditResourceDialog = (resource, lessonId) => {
    setResourceFormData({
      title: resource.title,
      url: resource.url,
      type: resource.type,
    });
    setActiveLessonId(lessonId);
    setEditingResource(resource);
    setIsEditingResource(true);
    setIsResourceDialogOpen(true);
  };

  const handleResourceSubmit = async () => {
    if (!resourceFormData.title.trim()) {
      toast.error("Resource title is required");
      return;
    }

    if (!resourceFormData.url.trim()) {
      toast.error("Resource URL is required");
      return;
    }

    try {
      const resourceData = {
        lesson: activeLessonId,
        title: resourceFormData.title.trim(),
        url: resourceFormData.url.trim(),
        type: resourceFormData.type,
      };

      if (isEditingResource && editingResource) {
        const response = await resourceAPI.updateResource(editingResource._id, resourceData);
        if (response.success) {
          toast.success("Resource updated!");
          setResources(prev => ({
            ...prev,
            [activeLessonId]: (prev[activeLessonId] || []).map(r =>
              r._id === editingResource._id ? { ...r, ...resourceData } : r
            )
          }));
        }
      } else {
        const response = await resourceAPI.createResource(resourceData);
        if (response.success) {
          toast.success("Resource added!");
          const newResource = response.data || response;
          setResources(prev => ({
            ...prev,
            [activeLessonId]: [...(prev[activeLessonId] || []), newResource]
          }));
        }
      }
      setIsResourceDialogOpen(false);
      setResourceFormData({ title: "", url: "", type: "LINK" });
    } catch (error) {
      toast.error(error.message || "Failed to save resource");
    }
  };

  const handleDeleteResource = async (resourceId, lessonId) => {
    if (!confirm("Delete this resource?")) return;

    try {
      const response = await resourceAPI.deleteResource(resourceId);
      if (response.success) {
        toast.success("Resource deleted");
        setResources(prev => ({
          ...prev,
          [lessonId]: (prev[lessonId] || []).filter(r => r._id !== resourceId)
        }));
      }
    } catch (error) {
      toast.error("Failed to delete resource");
    }
  };

  const toggleLessonExpansion = (lessonId) => {
    setExpandedLesson(expandedLesson === lessonId ? null : lessonId);
  };

  // Course submission
  const validateCourse = () => {
    if (!formData.courseTitle.trim()) {
      toast.error("Course title is required");
      return false;
    }
    if (!formData.courseDesc.trim()) {
      toast.error("Course description is required");
      return false;
    }
    if (!formData.category) {
      toast.error("Please select a category");
      return false;
    }
    if (formData.learn_type === "PAID" && (!formData.price || formData.price <= 0)) {
      toast.error("Price is required for paid courses");
      return false;
    }
    return true;
  };

  const needsReapproval = () => {
    if (!["approved", "published"].includes(courseStatus)) return false;
    if (submitOption === "draft") return false;

    const substantialFields = ["courseTitle", "courseDesc", "learn_type", "category", "price"];
    return substantialFields.some(field =>
      formData[field] !== originalData?.[field]
    );
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();

    if (!validateCourse()) return;

    if (needsReapproval()) {
      setShowReapprovalDialog(true);
      return;
    }

    await submitCourse();
  };

  const submitCourse = async () => {
    try {
      setIsSubmitting(true);

      const formPayload = new FormData();

      // Add basic fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "tags" && value !== undefined && value !== null) {
          formPayload.append(key, String(value));
        }
      });

      // Add tags
      if (tags.length > 0) {
        formPayload.append("tags", tags.join(","));
      }

      // Add image
      if (imageFile) {
        formPayload.append("image", imageFile);
      }

      // Set status
      if (submitOption === "submit" && ["approved", "published"].includes(courseStatus)) {
        formPayload.append("status", "pending_approval");
      }

      const response = await courseAPI.updateCourse(slug, formPayload);

      if (response.success) {
        toast.success(submitOption === "submit"
          ? "Course submitted for approval!"
          : "Course saved as draft!"
        );

        const updatedCourse = await courseAPI.getCourseBySlug(slug);
        setCourse(updatedCourse.data);
        setCourseStatus(updatedCourse.data.status);
      }
    } catch (error) {
      toast.error(error.message || "Failed to update course");
    } finally {
      setIsSubmitting(false);
      setShowReapprovalDialog(false);
    }
  };

  // Status helpers
  const getStatusBadge = (status) => {
    const badges = {
      published: { color: "bg-green-500", icon: CheckCircle, text: "Published" },
      approved: { color: "bg-blue-500", icon: CheckCircle, text: "Approved" },
      pending_approval: { color: "bg-yellow-500", icon: Clock, text: "Pending" },
      draft: { color: "bg-gray-500", icon: FileText, text: "Draft" },
      rejected: { color: "bg-red-500", icon: XCircle, text: "Rejected" },
    };

    const badge = badges[status];
    if (!badge) return null;

    const Icon = badge.icon;
    return (
      <Badge className={`${badge.color} gap-1`}>
        <Icon className="h-3 w-3" />
        {badge.text}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <InstructorDashboardLayout>
        <div className="px-4 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-[600px] w-full" />
        </div>
      </InstructorDashboardLayout>
    );
  }

  if (!course) {
    return (
      <InstructorDashboardLayout>
        <div className="px-4 py-6 max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Course Not Found</h3>
            <p className="text-muted-foreground mb-4">The course doesn't exist.</p>
            <Link href="/instructor-dashboard/courses">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
            </Link>
          </div>
        </div>
      </InstructorDashboardLayout>
    );
  }

  const statusBadge = getStatusBadge(course.status);
  const totalLessons = Object.values(lessons).reduce((sum, l) => sum + (l?.length || 0), 0);
  const totalResources = Object.values(resources).reduce((sum, r) => sum + (r?.length || 0), 0);

  return (
    <InstructorDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link href="/instructor-dashboard/courses">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold line-clamp-1">
                {course.courseTitle}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {statusBadge}
                <span className="text-sm text-muted-foreground">
                  ID: {course._id?.slice(-6)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={`/courses/${slug}`} target="_blank">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={handleCourseSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Layers className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{weeks.length}</p>
                  <p className="text-xs text-muted-foreground">Weeks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <PlayCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalLessons}</p>
                  <p className="text-xs text-muted-foreground">Lessons</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Link2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalResources}</p>
                  <p className="text-xs text-muted-foreground">Resources</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{course.enrolledCount || 0}</p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {course.learn_type === "FREE" ? "Free" : `NPR ${course.price || 0}`}
                  </p>
                  <p className="text-xs text-muted-foreground">Price</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rejection Reason */}
        {course.status === "rejected" && rejectionReason && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-300">
                    Rejection Reason
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {rejectionReason}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b mb-6 overflow-x-auto">
            <TabsList className="h-auto p-0 bg-transparent">
              <TabsTrigger
                value="basic"
                className="px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                <FileText className="h-4 w-4 mr-2" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger
                value="content"
                className="px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                <Layers className="h-4 w-4 mr-2" />
                Content
              </TabsTrigger>
              <TabsTrigger
                value="media"
                className="px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                <Video className="h-4 w-4 mr-2" />
                Media
              </TabsTrigger>
              <TabsTrigger
                value="pricing"
                className="px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Pricing
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state[active]:border-primary"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Advanced
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Basic Info Tab */}
          <TabsContent value="basic">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Details</CardTitle>
                    <CardDescription>
                      Basic information about your course
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="courseTitle">Course Title *</Label>
                      <Input
                        id="courseTitle"
                        name="courseTitle"
                        value={formData.courseTitle}
                        onChange={handleInputChange}
                        placeholder="e.g., Complete Web Development Bootcamp"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="courseShortDesc">Short Description</Label>
                      <Input
                        id="courseShortDesc"
                        name="courseShortDesc"
                        value={formData.courseShortDesc}
                        onChange={handleInputChange}
                        placeholder="Brief description (max 150 chars)"
                        maxLength={150}
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {formData.courseShortDesc.length}/150
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="courseDesc">Full Description *</Label>
                      <Textarea
                        id="courseDesc"
                        name="courseDesc"
                        value={formData.courseDesc}
                        onChange={handleInputChange}
                        rows={8}
                        placeholder="What will students learn? Why should they take this course?"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (days)</Label>
                        <Input
                          id="duration"
                          name="duration"
                          type="number"
                          min="1"
                          value={formData.duration}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weekly_study">Weekly Study (hours)</Label>
                        <Input
                          id="weekly_study"
                          name="weekly_study"
                          type="number"
                          min="1"
                          value={formData.weekly_study}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleSelectChange("category", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat._id} value={cat._id}>
                              {cat.categoryName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="requirements">Requirements</Label>
                      <Textarea
                        id="requirements"
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="What do students need to know or have before starting?"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Image</CardTitle>
                    <CardDescription>Upload a cover image</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      {imagePreview ? (
                        <div className="space-y-4">
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-40 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={removeImage}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <label
                            htmlFor="image-upload"
                            className="block w-full cursor-pointer"
                          >
                            <Button type="button" variant="outline" className="w-full">
                              <Upload className="h-4 w-4 mr-2" />
                              Change Image
                            </Button>
                          </label>
                        </div>
                      ) : (
                        <label
                          htmlFor="image-upload"
                          className="block cursor-pointer py-6"
                        >
                          <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm font-medium">Click to upload</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG up to 1MB
                          </p>
                        </label>
                      )}
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                    <CardDescription>Add keywords</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                      />
                      <Button type="button" onClick={handleAddTag}>
                        Add
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="gap-1">
                            {tag}
                            <button
                              onClick={() => setTags(tags.filter(t => t !== tag))}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Content Tab - Enhanced with Resources */}
          <TabsContent value="content">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Course Content</CardTitle>
                  <CardDescription>Manage weeks, lessons, and resources</CardDescription>
                </div>
                <Button onClick={openCreateWeekDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Week
                </Button>
              </CardHeader>
              <CardContent>
                {weeks.length === 0 ? (
                  <div className="text-center py-12">
                    <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No weeks yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create your first week to start adding lessons and resources
                    </p>
                    <Button onClick={openCreateWeekDialog}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Week
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {weeks
                      .sort((a, b) => (a.weekNumber || 0) - (b.weekNumber || 0))
                      .map((week) => {
                        const weekLessons = lessons[week._id] || [];
                        const isExpanded = expandedWeek === week._id;

                        return (
                          <div key={week._id} className="border rounded-lg overflow-hidden">
                            {/* Week Header */}
                            <div className="p-4 bg-muted/30">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 shrink-0"
                                    onClick={() => setExpandedWeek(isExpanded ? null : week._id)}
                                  >
                                    <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                                  </Button>
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Badge variant="outline">Week {week.weekNumber}</Badge>
                                      <h4 className="font-medium">{week.title}</h4>
                                    </div>
                                    {week.description && (
                                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                        {week.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Badge variant="secondary">
                                    {weekLessons.length} {weekLessons.length === 1 ? "lesson" : "lessons"}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEditWeekDialog(week)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openCreateLessonDialog(week._id)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-600"
                                    onClick={() => handleDeleteWeek(week._id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Expanded Week Content - Lessons */}
                            {isExpanded && (
                              <div className="p-4 space-y-3">
                                {weekLessons.length === 0 ? (
                                  <div className="text-center py-6 border rounded-lg">
                                    <PlayCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground mb-3">
                                      No lessons yet
                                    </p>
                                    <Button
                                      size="sm"
                                      onClick={() => openCreateLessonDialog(week._id)}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Lesson
                                    </Button>
                                  </div>
                                ) : (
                                  weekLessons
                                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                                    .map((lesson) => {
                                      const lessonResources = resources[lesson._id] || [];
                                      const isLessonExpanded = expandedLesson === lesson._id;

                                      return (
                                        <div key={lesson._id} className="border rounded-lg">
                                          {/* Lesson Header */}
                                          <div className="p-3 bg-white dark:bg-gray-950">
                                            <div className="flex items-start justify-between gap-3">
                                              <div className="flex items-start gap-3 flex-1">
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-6 w-6 shrink-0"
                                                  onClick={() => toggleLessonExpansion(lesson._id)}
                                                >
                                                  <ChevronRight className={`h-4 w-4 transition-transform ${isLessonExpanded ? "rotate-90" : ""}`} />
                                                </Button>
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge variant="outline" className="font-mono text-xs">
                                                      {lesson.order}
                                                    </Badge>
                                                    <h5 className="font-medium text-sm">
                                                      {lesson.lessonTitle || lesson.title}
                                                    </h5>
                                                    {!lesson.isActive && (
                                                      <Badge variant="secondary" className="text-[10px]">
                                                        Inactive
                                                      </Badge>
                                                    )}
                                                  </div>
                                                  {lesson.shortDescription && (
                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                                      {lesson.shortDescription}
                                                    </p>
                                                  )}
                                                  <div className="flex items-center gap-3 mt-2">
                                                    {lesson.duration > 0 && (
                                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {lesson.duration} min
                                                      </span>
                                                    )}
                                                    {lesson.videoUrl && (
                                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Video className="h-3 w-3" />
                                                        Video
                                                      </span>
                                                    )}
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                      <Link2 className="h-3 w-3" />
                                                      {lessonResources.length} resources
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-7 w-7"
                                                  onClick={() => openEditLessonDialog(lesson, week._id)}
                                                >
                                                  <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                  onClick={() => handleDeleteLesson(lesson._id, week._id)}
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Expanded Lesson Content - Resources */}
                                          {isLessonExpanded && (
                                            <div className="p-3 border-t bg-muted/20">
                                              <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                  <Link2 className="h-4 w-4 text-primary" />
                                                  <h6 className="text-xs font-medium uppercase tracking-wider">
                                                    Resources
                                                  </h6>
                                                  <Badge variant="secondary" className="text-[10px]">
                                                    {lessonResources.length}
                                                  </Badge>
                                                </div>
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  className="h-7 text-xs gap-1"
                                                  onClick={() => openCreateResourceDialog(lesson._id)}
                                                >
                                                  <Plus className="h-3 w-3" />
                                                  Add Resource
                                                </Button>
                                              </div>

                                              {/* Resources List */}
                                              {lessonResources.length === 0 ? (
                                                <div className="text-center py-4 text-xs text-muted-foreground border border-dashed rounded-md">
                                                  No resources yet
                                                </div>
                                              ) : (
                                                <div className="space-y-2">
                                                  {lessonResources.map((resource) => (
                                                    <div
                                                      key={resource._id}
                                                      className="flex items-center justify-between p-2 bg-background rounded-md border group"
                                                    >
                                                      <div className="flex items-center gap-2 min-w-0">
                                                        <div className="h-7 w-7 rounded bg-primary/5 flex items-center justify-center shrink-0">
                                                          {resource.type === "LINK" ? (
                                                            <Link2 className="h-3.5 w-3.5 text-primary/70" />
                                                          ) : (
                                                            <FileIcon className="h-3.5 w-3.5 text-primary/70" />
                                                          )}
                                                        </div>
                                                        <div className="min-w-0">
                                                          <p className="text-xs font-medium truncate">
                                                            {resource.title}
                                                          </p>
                                                          <a
                                                            href={resource.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 truncate"
                                                          >
                                                            {resource.url}
                                                            <ExternalLink className="h-2.5 w-2.5" />
                                                          </a>
                                                        </div>
                                                      </div>
                                                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Badge variant="outline" className="text-[9px] h-5 px-1.5">
                                                          {resource.type}
                                                        </Badge>
                                                        <Button
                                                          variant="ghost"
                                                          size="icon"
                                                          className="h-6 w-6"
                                                          onClick={() => openEditResourceDialog(resource, lesson._id)}
                                                        >
                                                          <Edit2 className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                          variant="ghost"
                                                          size="icon"
                                                          className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                          onClick={() => handleDeleteResource(resource._id, lesson._id)}
                                                        >
                                                          <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Tab */}
          {/* Media Tab */}
          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle>Preview Video</CardTitle>
                <CardDescription>Add a promotional video for your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="embeddedUrl" className="text-sm font-medium">
                    Video URL
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="embeddedUrl"
                        name="embeddedUrl"
                        placeholder="https://www.youtube.com/watch?v=... or https://www.youtube.com/embed/..."
                        value={formData.embeddedUrl}
                        onChange={handleInputChange}
                        className="pl-10 h-11"
                      />
                    </div>
                    {formData.embeddedUrl && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-11 w-11 shrink-0"
                        onClick={() => window.open(formData.embeddedUrl, '_blank')}
                        title="Open video in new tab"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* URL Helper Text */}
                  <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
                    <div className="space-y-1 flex-1">
                      <p className="font-medium text-foreground">Supported video platforms:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li>YouTube - Use watch URL (youtube.com/watch?v=) or embed URL (youtube.com/embed/)</li>
                        <li>Vimeo - Use video URL (vimeo.com/)</li>
                        <li>Any other embeddable video URL</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Video Preview Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Video Preview</Label>
                    {formData.embeddedUrl && (
                      <Badge variant="outline" className="gap-1">
                        <Video className="h-3 w-3" />
                        Preview Mode
                      </Badge>
                    )}
                  </div>

                  {formData.embeddedUrl ? (
                    <div className="space-y-3">
                      {/* Video Player */}
                      <div className="aspect-video w-full max-w-3xl rounded-xl overflow-hidden border-2 bg-black/5 shadow-lg">
                        {formData.embeddedUrl.includes('youtube.com') || formData.embeddedUrl.includes('youtu.be') ? (
                          // YouTube Video
                          <iframe
                            src={formData.embeddedUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                            className="w-full h-full"
                            title="Course preview video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                          />
                        ) : formData.embeddedUrl.includes('vimeo.com') ? (
                          // Vimeo Video
                          <iframe
                            src={formData.embeddedUrl.replace('vimeo.com', 'player.vimeo.com/video')}
                            className="w-full h-full"
                            title="Course preview video"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                          />
                        ) : (
                          // Generic embed
                          <iframe
                            src={formData.embeddedUrl}
                            className="w-full h-full"
                            title="Course preview video"
                            allowFullScreen
                            loading="lazy"
                          />
                        )}
                      </div>

                      {/* Video Info & Actions */}
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium">Video loaded successfully</p>
                            <p className="text-[10px] text-muted-foreground">
                              {formData.embeddedUrl.length > 50
                                ? `${formData.embeddedUrl.substring(0, 50)}...`
                                : formData.embeddedUrl}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-xs"
                          onClick={() => {
                            navigator.clipboard.writeText(formData.embeddedUrl);
                            toast.success("URL copied to clipboard");
                          }}
                        >
                          <Link2 className="h-3 w-3" />
                          Copy URL
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Empty State - No Video
                    <div className="border-2 border-dashed rounded-xl p-8 text-center max-w-3xl">
                      <div className="flex flex-col items-center justify-center">
                        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                          <Video className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No preview video yet</h3>
                        <p className="text-sm text-muted-foreground max-w-md mb-4">
                          Add a YouTube or Vimeo URL above to preview your course promotional video.
                          This video will be displayed on your course landing page.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            <span>YouTube</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            <span>Vimeo</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            <span>Embed URL</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tips Section */}
                  <div className="mt-4 p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-lg">
                    <div className="flex gap-3">
                      <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">i</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-blue-800 dark:text-blue-300">Tips for a great preview video:</p>
                        <ul className="text-xs text-blue-700 dark:text-blue-400 list-disc list-inside space-y-0.5">
                          <li>Keep it between 1-2 minutes to maintain attention</li>
                          <li>Showcase your teaching style and course highlights</li>
                          <li>Include a clear call-to-action at the end</li>
                          <li>Use high-quality audio and video</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
                <CardDescription>Set your course price</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Course Type</Label>
                  <Select
                    value={formData.learn_type}
                    onValueChange={(value) => handleSelectChange("learn_type", value)}
                  >
                    <SelectTrigger className="w-full sm:w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FREE">Free</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.learn_type === "PAID" && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (NPR)</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discount">Discount (%)</Label>
                      <Input
                        id="discount"
                        name="discount"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.discount}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}

                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium mb-2">Pricing Summary</p>
                  {formData.learn_type === "FREE" ? (
                    <p className="text-lg font-bold text-green-600">Free Course</p>
                  ) : (
                    <div>
                      <p className="text-2xl font-bold">
                        NPR {Math.round(formData.price - (formData.price * (formData.discount || 0) / 100))}
                      </p>
                      {formData.discount > 0 && (
                        <p className="text-sm text-muted-foreground line-through">
                          NPR {formData.price}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>Additional configurations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Course Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Make course active or inactive
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, isActive: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Submission Options</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="submitOption"
                        value="draft"
                        checked={submitOption === "draft"}
                        onChange={(e) => setSubmitOption(e.target.value)}
                        className="h-4 w-4"
                      />
                      <span>Save as Draft</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="submitOption"
                        value="submit"
                        checked={submitOption === "submit"}
                        onChange={(e) => setSubmitOption(e.target.value)}
                        className="h-4 w-4"
                      />
                      <span>
                        {["approved", "published"].includes(courseStatus)
                          ? "Submit for Re-approval"
                          : "Submit for Approval"}
                      </span>
                    </label>
                  </div>

                  {["approved", "published"].includes(courseStatus) && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border rounded-lg">
                      <div className="flex gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-800 dark:text-yellow-300">
                          Editing an approved/published course requires re-approval
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Week Dialog */}
        <Dialog open={isWeekDialogOpen} onOpenChange={setIsWeekDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isEditingWeek ? "Edit Week" : "Create Week"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Week Number *</Label>
                  <Input
                    value={weekFormData.weekNumber}
                    onChange={(e) => setWeekFormData(prev => ({
                      ...prev,
                      weekNumber: e.target.value
                    }))}
                    type="number"
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={weekFormData.isActive ? "active" : "inactive"}
                    onValueChange={(value) =>
                      setWeekFormData(prev => ({
                        ...prev,
                        isActive: value === "active"
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Week Title *</Label>
                <Input
                  value={weekFormData.title}
                  onChange={(e) => setWeekFormData(prev => ({
                    ...prev,
                    title: e.target.value
                  }))}
                  placeholder="e.g., Introduction to Python"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={weekFormData.description}
                  onChange={(e) => setWeekFormData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  rows={3}
                  placeholder="What will students learn?"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsWeekDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleWeekSubmit}>
                {isEditingWeek ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Lesson Dialog */}
        <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
          <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
            <DialogHeader className="px-6 py-4 border-b shrink-0">
              <DialogTitle>
                {isEditingLesson ? "Edit Lesson" : "Create Lesson"}
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="lesson-title" className="flex items-center gap-1">
                      Lesson Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lesson-title"
                      value={lessonFormData.lessonTitle}
                      onChange={(e) => setLessonFormData(prev => ({
                        ...prev,
                        lessonTitle: e.target.value
                      }))}
                      placeholder="e.g., Introduction to HTML"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lesson-order" className="flex items-center gap-1">
                      Order <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lesson-order"
                      type="number"
                      min="1"
                      value={lessonFormData.order}
                      onChange={(e) => setLessonFormData(prev => ({
                        ...prev,
                        order: e.target.value
                      }))}
                      placeholder="1"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lesson-duration">Duration (minutes)</Label>
                    <div className="relative">
                      <Input
                        id="lesson-duration"
                        type="number"
                        min="0"
                        value={lessonFormData.duration}
                        onChange={(e) => setLessonFormData(prev => ({
                          ...prev,
                          duration: e.target.value
                        }))}
                        placeholder="30"
                        className="h-11 pl-16"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                        mins
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lesson-video">Video URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="lesson-video"
                        value={lessonFormData.videoUrl}
                        onChange={(e) => setLessonFormData(prev => ({
                          ...prev,
                          videoUrl: e.target.value
                        }))}
                        placeholder="https://youtube.com/embed/..."
                        className="h-11"
                      />
                      {lessonFormData.videoUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-11 w-11 shrink-0"
                          onClick={() => window.open(lessonFormData.videoUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lesson-short-desc">Short Description</Label>
                  <Textarea
                    id="lesson-short-desc"
                    value={lessonFormData.shortDescription}
                    onChange={(e) => setLessonFormData(prev => ({
                      ...prev,
                      shortDescription: e.target.value
                    }))}
                    rows={2}
                    placeholder="Brief overview of what students will learn in this lesson..."
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {lessonFormData.shortDescription.length}/200
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lesson-content" className="flex items-center gap-1">
                    Lesson Content <span className="text-red-500">*</span>
                  </Label>
                  <div className="border rounded-lg overflow-hidden">
                    <ContentEditor
                      model={lessonFormData.lessonContent}
                      handleModelChange={(content) => setLessonFormData(prev => ({
                        ...prev,
                        lessonContent: content
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lesson-status">Status</Label>
                  <div className="flex items-center gap-4">
                    <Select
                      value={lessonFormData.isActive ? "active" : "inactive"}
                      onValueChange={(value) =>
                        setLessonFormData(prev => ({
                          ...prev,
                          isActive: value === "active"
                        }))
                      }
                    >
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            Active
                          </div>
                        </SelectItem>
                        <SelectItem value="inactive">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-gray-400" />
                            Inactive
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t bg-muted/20 shrink-0">
              <div className="flex items-center justify-between w-full">
                <div className="text-xs text-muted-foreground">
                  <span className="text-red-500">*</span> Required fields
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setIsLessonDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleLessonSubmit}>
                    {isEditingLesson ? "Update Lesson" : "Create Lesson"}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Resource Dialog */}
        <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isEditingResource ? "Edit Resource" : "Add Resource"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="resource-title">Title *</Label>
                <Input
                  id="resource-title"
                  value={resourceFormData.title}
                  onChange={(e) => setResourceFormData(prev => ({
                    ...prev,
                    title: e.target.value
                  }))}
                  placeholder="e.g., Cheat Sheet, Reference Link"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resource-type">Type</Label>
                <Select
                  value={resourceFormData.type}
                  onValueChange={(value) => setResourceFormData(prev => ({
                    ...prev,
                    type: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LINK">Link</SelectItem>
                    <SelectItem value="FILE">File</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="resource-url">URL *</Label>
                <Input
                  id="resource-url"
                  value={resourceFormData.url}
                  onChange={(e) => setResourceFormData(prev => ({
                    ...prev,
                    url: e.target.value
                  }))}
                  placeholder="https://..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsResourceDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleResourceSubmit}>
                {isEditingResource ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Re-approval Dialog */}
        <AlertDialog open={showReapprovalDialog} onOpenChange={setShowReapprovalDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Re-approval Required
              </AlertDialogTitle>
              <AlertDialogDescription>
                You're editing an approved/published course. Submitting will require admin re-approval.
                <br />
                <br />
                Are you sure you want to proceed?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={submitCourse}>
                Yes, Submit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </InstructorDashboardLayout>
  );
}