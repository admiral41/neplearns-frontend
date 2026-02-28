"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import InstructorDashboardLayout from "@/components/instructor/InstructorDashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  Search,
  MoreVertical,
  Check,
  X,
  Users,
  Plus,
  Loader2,
  Edit,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Upload,
  RefreshCw,
  Layers,
  Settings,
  Video,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAlertDialog } from "@/components/ui/alert-dialog-provider";
import { courseAPI } from "@/lib/api/courses";
import { categoryAPI } from "@/lib/api/category";

export default function LecturerCoursesPage() {
  const router = useRouter();
  const { showAlert } = useAlertDialog();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    pending: 0,
    published: 0,
    rejected: 0,
  });

  // Fetch courses and categories
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Always fetch created courses (lecturer's own courses)
      const courseResponse = await courseAPI.getMyCourses('created');
      let allCourses = courseResponse.data || [];

      // Apply tab filtering on the client side
      let filteredCourses = allCourses;
      if (activeTab === 'draft') {
        filteredCourses = allCourses.filter(c => c.status === 'draft');
      } else if (activeTab === 'pending') {
        filteredCourses = allCourses.filter(c => c.status === 'pending_approval');
      } else if (activeTab === 'published') {
        filteredCourses = allCourses.filter(c => c.status === 'approved' && c.published);
      } else if (activeTab === 'rejected') {
        filteredCourses = allCourses.filter(c => c.status === 'rejected');
      }

      setCourses(filteredCourses);

      // Calculate stats from all created courses
      setStats({
        total: allCourses.length,
        draft: allCourses.filter(c => c.status === 'draft').length,
        pending: allCourses.filter(c => c.status === 'pending_approval').length,
        published: allCourses.filter(c => c.status === 'approved' && c.published).length,
        rejected: allCourses.filter(c => c.status === 'rejected').length,
      });

      // Fetch categories
      const categoryResponse = await categoryAPI.getActiveCategories();
      setCategories(categoryResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error.message || 'Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = searchQuery ?
      course.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) : true;

    const matchesCategory =
      categoryFilter === "all" ||
      course.category?._id === categoryFilter ||
      course.category?.categoryName === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleSubmitForApproval = async (courseId) => {
    try {
      const course = courses.find(c => c._id === courseId);
      if (!course) return;

      // Update course status to pending_approval
      await courseAPI.updateCourse(course.courseSlug, { status: 'pending_approval' });

      toast.success("Course submitted for approval!");
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Error submitting course:', error);
      toast.error(error.message || 'Failed to submit course for approval');
    }
  };

  const handleWithdrawSubmission = async (courseId) => {
    try {
      const course = courses.find(c => c._id === courseId);
      if (!course) return;

      // Only allow withdraw if status is pending_approval and not approved yet
      if (course.status === 'pending_approval') {
        // Update course status back to draft
        await courseAPI.updateCourse(course.courseSlug, { status: 'draft' });

        toast.success("Course submission withdrawn!");
        fetchData(); // Refresh list
      } else {
        toast.error("Cannot withdraw submission. Course is not pending approval.");
      }
    } catch (error) {
      console.error('Error withdrawing submission:', error);
      toast.error(error.message || 'Failed to withdraw submission');
    }
  };

  const handleEditAllCourse = (course) => {
    if (course.status === 'approved' && course.published) {
      showAlert({
        title: "Edit Published Course",
        description: "Editing a published course will require admin re-approval. Continue?",
        confirmText: "Continue",
        cancelText: "Cancel",
        onConfirm: () => {
          router.push(`/instructor-dashboard/edit-all-course/${course.courseSlug}`);
        },
      });
    } else {
      router.push(`/instructor-dashboard/edit-all-course/${course.courseSlug}`);
    }
  };

  const handleDelete = async (course) => {
    // Only allow delete for draft or rejected courses
    const canDelete = course.status === 'draft' || course.status === 'rejected';

    showAlert({
      title: "Delete Course",
      description: `Are you sure you want to permanently delete "${course.courseTitle}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await courseAPI.deleteCourse(course.courseSlug);
          toast.success("Course deleted successfully!");
          fetchData(); // Refresh list
        } catch (error) {
          console.error('Error deleting course:', error);
          toast.error(error.message || 'Failed to delete course');
        }
      },
    });
  };

  const getStatusBadge = (course) => {
    switch (course.status) {
      case 'approved':
        return course.published ?
          <Badge className="bg-green-500 inline-flex items-center gap-1 w-fit">
            <CheckCircle className="h-3 w-3" />
            Published
          </Badge> :
          <Badge className="bg-blue-500 inline-flex items-center gap-1 w-fit">
            <CheckCircle className="h-3 w-3" />
            Approved
          </Badge>;
      case 'pending_approval':
        return <Badge variant="secondary" className="inline-flex items-center gap-1 w-fit">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="inline-flex items-center gap-1 w-fit">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>;
      case 'draft':
        return <Badge variant="outline" className="inline-flex items-center gap-1 w-fit">
          <FileText className="h-3 w-3" />
          Draft
        </Badge>;
      default:
        return null;
    }
  };

  const getPriceDisplay = (course) => {
    if (course.learn_type === 'FREE') {
      return <span className="text-green-600 font-medium">Free</span>;
    }

    const finalPrice = course.price - (course.price * (course.discount || 0) / 100);

    return (
      <div className="flex items-center gap-1">
        <span className="font-medium">NPR {finalPrice.toLocaleString()}</span>
        {course.discount > 0 && (
          <span className="text-xs text-muted-foreground line-through">
            NPR {course.price.toLocaleString()}
          </span>
        )}
      </div>
    );
  };

  // Get available actions based on course status
  const getCourseActions = (course) => {
    const actions = [];

    // Edit All - comprehensive edit
    actions.push({
      label: "Edit Everything",
      icon: <Layers className="h-4 w-4 mr-2" />,
      onClick: () => handleEditAllCourse(course),
      variant: "purple",
      description: "Manage weeks, lessons, and resources"
    });

    // Create Live Class - only for approved/published courses
    if (course.status === 'approved' || (course.status === 'approved' && course.published)) {
      actions.push({
        label: "Create Live Class",
        icon: <Video className="h-4 w-4 mr-2" />,
        onClick: () => router.push(`/instructor-dashboard/live-classes?course=${course._id}`),
        variant: "blue",
        description: "Schedule a live session"
      });
    }

    // Status-specific actions
    if (course.status === 'draft') {
      actions.push({
        label: "Submit for Approval",
        icon: <Upload className="h-4 w-4 mr-2" />,
        onClick: () => handleSubmitForApproval(course._id),
        variant: "green"
      });
    }

    // Only show withdraw for pending_approval courses (not approved yet)
    if (course.status === 'pending_approval') {
      actions.push({
        label: "Withdraw Submission",
        icon: <X className="h-4 w-4 mr-2" />,
        onClick: () => handleWithdrawSubmission(course._id),
        variant: "orange"
      });
    }

    // Delete - only available for draft or rejected courses
    if (course.status === 'draft' || course.status === 'rejected') {
      actions.push({
        label: "Delete",
        icon: <X className="h-4 w-4 mr-2" />,
        onClick: () => handleDelete(course),
        variant: "destructive"
      });
    }

    return actions;
  };

  const getStatusIcon = (status, count) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-5 w-5 text-gray-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'published':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <BookOpen className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleRefresh = () => {
    fetchData();
    toast.success("Courses refreshed!");
  };

  return (
    <InstructorDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold mb-1">
              My Courses
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your courses and track their approval status
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/instructor-dashboard/courses/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </Link>
            <Button variant="outline" onClick={handleRefresh} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-lg font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                {getStatusIcon('draft', stats.draft)}
                <div>
                  <p className="text-lg font-bold text-gray-600">{stats.draft}</p>
                  <p className="text-xs text-muted-foreground">Draft</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                {getStatusIcon('pending', stats.pending)}
                <div>
                  <p className="text-lg font-bold text-orange-600">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                {getStatusIcon('published', stats.published)}
                <div>
                  <p className="text-lg font-bold text-green-600">{stats.published}</p>
                  <p className="text-xs text-muted-foreground">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                {getStatusIcon('rejected', stats.rejected)}
                <div>
                  <p className="text-lg font-bold text-red-600">{stats.rejected}</p>
                  <p className="text-xs text-muted-foreground">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs - Removed Archived tab */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="all">All Courses</TabsTrigger>
            <TabsTrigger value="draft">Draft ({stats.draft})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="published">Published ({stats.published})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your courses..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Courses Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Price</TableHead>
                    <TableHead className="hidden sm:table-cell">Enrollments</TableHead>
                    <TableHead className="hidden sm:table-cell">Created</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => {
                    const actions = getCourseActions(course);

                    return (
                      <TableRow key={course._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-10 bg-muted rounded overflow-hidden shrink-0">
                              {course.image ? (
                                <img
                                  src={`${process.env.NEXT_PUBLIC_API_URL}/${course.image}`}
                                  alt={course.courseTitle}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                  <BookOpen className="h-4 w-4 text-primary" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <Link
                                href={`/instructor-dashboard/edit-all-course/${course.courseSlug}`}
                                className="font-medium truncate max-w-[200px] hover:underline block"
                              >
                                {course.courseTitle}
                              </Link>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-muted-foreground truncate">
                                  {course.category?.categoryName}
                                </p>
                                {course.rejectionReason && (
                                  <Badge variant="outline" className="text-xs">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Needs Revision
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(course)}
                          {course.rejectionReason && (
                            <p className="text-xs text-red-500 mt-1 max-w-[150px] truncate" title={course.rejectionReason}>
                              {course.rejectionReason.substring(0, 30)}...
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {getPriceDisplay(course)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {course.totalEnrollments || 0}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(course.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              {actions.map((action, index) => {
                                if (action.href) {
                                  return (
                                    <DropdownMenuItem key={index} asChild>
                                      <Link href={action.href} className="cursor-pointer">
                                        {action.icon}
                                        {action.label}
                                      </Link>
                                    </DropdownMenuItem>
                                  );
                                } else {
                                  return (
                                    <DropdownMenuItem
                                      key={index}
                                      onClick={action.onClick}
                                      className={`cursor-pointer ${action.variant === 'destructive' ? 'text-destructive' :
                                        action.variant === 'green' ? 'text-green-600' :
                                          action.variant === 'blue' ? 'text-blue-600' :
                                            action.variant === 'orange' ? 'text-orange-600' :
                                              action.variant === 'purple' ? 'text-purple-600' : ''
                                        }`}
                                    >
                                      {action.icon}
                                      <div className="flex flex-col">
                                        <span>{action.label}</span>
                                        {action.description && (
                                          <span className="text-xs text-muted-foreground font-normal">
                                            {action.description}
                                          </span>
                                        )}
                                      </div>
                                    </DropdownMenuItem>
                                  );
                                }
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            {!isLoading && filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === 'all' ?
                    'You haven\'t created any courses yet.' :
                    `No ${activeTab} courses found.`}
                </p>
                {activeTab === 'all' || activeTab === 'draft' ? (
                  <Link href="/instructor-dashboard/courses/create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Course
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" onClick={() => setActiveTab('all')}>
                    View All Courses
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </InstructorDashboardLayout>
  );
}