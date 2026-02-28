"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  Search,
  MoreVertical,
  Eye,
  Check,
  X,
  Star,
  StarOff,
  Trash2,
  Users,
  Plus,
  Loader2,
  AlertCircle,
  Edit,
  Archive,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAlertDialog } from "@/components/ui/alert-dialog-provider";
import { courseAPI } from "@/lib/api/courses";
import { categoryAPI } from "@/lib/api/category";

export default function CoursesPage() {
  const { showAlert } = useAlertDialog();
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [courseToReject, setCourseToReject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    published: 0,
    featured: 0,
    rejected: 0,
  });

  // Fetch courses and categories
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch courses based on active tab
      let courseResponse;
      if (activeTab === 'pending') {
        courseResponse = await courseAPI.getPendingCourses();
      } else {
        const params = {};
        if (activeTab === 'published') params.status = 'approved';
        if (activeTab === 'rejected') params.status = 'rejected';
        courseResponse = await courseAPI.getAllCourses(params);
      }
      
      setCourses(courseResponse.data || []);
      
      // Update stats
      const allCourses = courseResponse.data || [];
      setStats({
        total: allCourses.length,
        pending: allCourses.filter(c => c.status === 'pending_approval').length,
        published: allCourses.filter(c => c.status === 'approved' && c.published).length,
        featured: allCourses.filter(c => c.isFeatured).length,
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
      course.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.createdBy?.firstname + ' ' + course.createdBy?.lastname).toLowerCase().includes(searchQuery.toLowerCase()) : true;
    
    const matchesCategory = 
      categoryFilter === "all" || 
      course.category?._id === categoryFilter ||
      course.category?.categoryName === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleApprove = async (courseId, publishDirectly = true) => {
    try {
      await courseAPI.processCourseRequest(courseId, {
        action: 'approve',
        publishDirectly,
        reason: 'Course meets our quality standards.'
      });
      
      toast.success(`Course ${publishDirectly ? 'approved and published' : 'approved'} successfully!`);
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Error approving course:', error);
      toast.error(error.message || 'Failed to approve course');
    }
  };

  const openRejectDialog = (course) => {
    setCourseToReject(course);
    setIsRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    try {
      await courseAPI.processCourseRequest(courseToReject._id, {
        action: 'reject',
        reason: rejectReason
      });
      
      toast.success("Course rejected. Instructor will be notified.");
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Error rejecting course:', error);
      toast.error(error.message || 'Failed to reject course');
    } finally {
      setIsRejectDialogOpen(false);
      setRejectReason("");
      setCourseToReject(null);
    }
  };

  const handlePublishToggle = async (course, publish) => {
    try {
      await courseAPI.togglePublish(course.courseSlug, publish);
      toast.success(`Course ${publish ? 'published' : 'unpublished'} successfully!`);
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error(error.message || 'Failed to update course status');
    }
  };

  const handleArchive = async (course) => {
    showAlert({
      title: course.status === 'archived' ? "Delete Course" : "Archive Course",
      description: course.status === 'archived' 
        ? `Are you sure you want to permanently delete "${course.courseTitle}"? This action cannot be undone.`
        : `Are you sure you want to archive "${course.courseTitle}"? Archived courses are not visible to students.`,
      confirmText: course.status === 'archived' ? "Delete" : "Archive",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await courseAPI.deleteCourse(course.courseSlug);
          toast.success(course.status === 'archived' ? "Course deleted." : "Course archived successfully.");
          fetchData(); // Refresh list
        } catch (error) {
          console.error('Error archiving course:', error);
          toast.error(error.message || 'Failed to archive course');
        }
      },
    });
  };

  const getStatusBadge = (course) => {
    switch (course.status) {
      case 'approved':
        return course.published ? 
          <Badge className="bg-green-500">Published</Badge> :
          <Badge className="bg-blue-500">Approved</Badge>;
      case 'pending_approval':
        return <Badge variant="secondary">Pending Review</Badge>;
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

  const getPriceDisplay = (course) => {
    if (course.learn_type === 'FREE') {
      return <span className="text-green-600 font-medium">Free</span>;
    }
    
    const finalPrice = course.price - (course.price * (course.discount || 0) / 100);
    
    return (
      <div className="flex items-center gap-1">
        {course.discount > 0 ? (
          <>
            <span className="font-medium">NPR {finalPrice.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground line-through">
              {course.price.toLocaleString()}
            </span>
            <Badge variant="outline" className="ml-1 text-xs">
              -{course.discount}%
            </Badge>
          </>
        ) : (
          <span className="font-medium">NPR {course.price.toLocaleString()}</span>
        )}
      </div>
    );
  };

  // Get available actions based on course status
  const getCourseActions = (course) => {
    const actions = [];
    
    // View Details - always available
    actions.push({
      label: "View Details",
      icon: <Eye className="h-4 w-4 mr-2" />,
      href: `/admin-dashboard/courses/${course.courseSlug}`,
      variant: "default"
    });
    
    // Status-specific actions
    if (course.status === 'pending_approval') {
      actions.push(
        {
          label: "Approve & Publish",
          icon: <Check className="h-4 w-4 mr-2" />,
          onClick: () => handleApprove(course._id, true),
          variant: "green"
        },
        {
          label: "Approve Only",
          icon: <Check className="h-4 w-4 mr-2" />,
          onClick: () => handleApprove(course._id, false),
          variant: "blue"
        },
        {
          label: "Reject",
          icon: <X className="h-4 w-4 mr-2" />,
          onClick: () => openRejectDialog(course),
          variant: "destructive"
        }
      );
    }
    
    if (course.status === 'approved') {
      if (course.published) {
        actions.push({
          label: "Unpublish",
          icon: <X className="h-4 w-4 mr-2" />,
          onClick: () => handlePublishToggle(course, false),
          variant: "orange"
        });
      } else {
        actions.push({
          label: "Publish",
          icon: <Check className="h-4 w-4 mr-2" />,
          onClick: () => handlePublishToggle(course, true),
          variant: "green"
        });
      }

      // Create Live Class - for approved/published courses
      actions.push({
        label: "Create Live Class",
        icon: <Video className="h-4 w-4 mr-2" />,
        onClick: () => router.push(`/admin-dashboard/liveclass?course=${course._id}`),
        variant: "blue"
      });
    }
    
    // Edit - available for all non-archived courses
    if (course.status !== 'archived') {
      actions.push({
        label: "Edit",
        icon: <Edit className="h-4 w-4 mr-2" />,
        href: `/admin-dashboard/courses/${course.courseSlug}`,
        variant: "default"
      });
    }
    
    // Archive/Delete - available for all
    actions.push({
      label: course.status === 'archived' ? "Delete" : "Archive",
      icon: course.status === 'archived' ? <Trash2 className="h-4 w-4 mr-2" /> : <Archive className="h-4 w-4 mr-2" />,
      onClick: () => handleArchive(course),
      variant: "destructive"
    });
    
    return actions;
  };

  return (
    <AdminDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold mb-1">
              Course Management
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Review, approve, and manage all platform courses
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin-dashboard/courses/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </Link>
            <Link href="/admin-dashboard/categories">
              <Button variant="outline">
                Manage Categories
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats - Simplified */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Courses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-500">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-500">{stats.published}</p>
              <p className="text-sm text-muted-foreground">Published</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-500">{stats.rejected}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs - Simplified */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
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

        {/* Courses Table - Simplified */}
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
                                href={`/admin-dashboard/courses/${course.courseSlug}`}
                                className="font-medium truncate max-w-[200px] hover:underline block"
                              >
                                {course.courseTitle}
                              </Link>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-muted-foreground truncate">
                                  {course.category?.categoryName}
                                </p>
                                {course.createdBy && (
                                  <p className="text-xs text-muted-foreground hidden sm:inline">
                                    • {course.createdBy.firstname} {course.createdBy.lastname}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(course)}
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
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {actions.map((action, index) => {
                                if (action.href) {
                                  return (
                                    <DropdownMenuItem key={index} asChild>
                                      <Link href={action.href}>
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
                                      className={action.variant === 'destructive' ? 'text-destructive' : 
                                                action.variant === 'green' ? 'text-green-600' :
                                                action.variant === 'blue' ? 'text-blue-600' :
                                                action.variant === 'orange' ? 'text-orange-600' : ''}
                                    >
                                      {action.icon}
                                      {action.label}
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
                <p className="text-muted-foreground">
                  {courses.length === 0 ? 
                    'No courses available yet.' : 
                    'Try adjusting your search or filters'}
                </p>
                {courses.length === 0 && (
                  <Link href="/admin-dashboard/courses/create">
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Course
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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
              {courseToReject && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">Course:</p>
                  <p className="text-sm">{courseToReject.courseTitle}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Instructor: {courseToReject.createdBy?.firstname} {courseToReject.createdBy?.lastname}
                  </p>
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
                  disabled={rejectReason.trim().length < 10}
                >
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