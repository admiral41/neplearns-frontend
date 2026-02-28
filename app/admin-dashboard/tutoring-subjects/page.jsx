"use client";

import { useState } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { AlertCircle, Plus, Pencil, Trash2, BookOpen, RefreshCw } from "lucide-react";
import {
  useTutoringSubjects,
  useCreateTutoringSubject,
  useUpdateTutoringSubject,
  useDeleteTutoringSubject,
} from "@/lib/hooks/useTutoringSubject";

export default function TutoringSubjectsPage() {
  // State for dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    monthlyPrice: "",
    isActive: true,
  });

  // React Query hooks
  const { data, isLoading, isError, error, refetch } = useTutoringSubjects();
  const createMutation = useCreateTutoringSubject();
  const updateMutation = useUpdateTutoringSubject();
  const deleteMutation = useDeleteTutoringSubject();

  const subjects = data?.data || [];

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      monthlyPrice: "",
      isActive: true,
    });
  };

  // Open create dialog
  const handleOpenCreate = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  // Open edit dialog
  const handleOpenEdit = (subject) => {
    setSelectedSubject(subject);
    setFormData({
      name: subject.name,
      description: subject.description || "",
      monthlyPrice: subject.monthlyPrice?.toString() || "",
      isActive: subject.isActive,
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const handleOpenDelete = (subject) => {
    setSelectedSubject(subject);
    setIsDeleteDialogOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle checkbox change
  const handleCheckboxChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      isActive: checked,
    }));
  };

  // Handle create submit
  const handleCreate = async (e) => {
    e.preventDefault();
    const submitData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      monthlyPrice: parseFloat(formData.monthlyPrice) || 0,
      isActive: formData.isActive,
    };

    createMutation.mutate(submitData, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        resetForm();
      },
    });
  };

  // Handle edit submit
  const handleEdit = async (e) => {
    e.preventDefault();
    const submitData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      monthlyPrice: parseFloat(formData.monthlyPrice) || 0,
      isActive: formData.isActive,
    };

    updateMutation.mutate(
      { slug: selectedSubject.slug, data: submitData },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setSelectedSubject(null);
          resetForm();
        },
      }
    );
  };

  // Handle delete confirm
  const handleDelete = () => {
    deleteMutation.mutate(selectedSubject.slug, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setSelectedSubject(null);
      },
    });
  };

  // Close dialogs
  const handleCloseCreate = () => {
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleCloseEdit = () => {
    setIsEditDialogOpen(false);
    setSelectedSubject(null);
    resetForm();
  };

  const handleCloseDelete = () => {
    setIsDeleteDialogOpen(false);
    setSelectedSubject(null);
  };

  // Truncate description for table display
  const truncateDescription = (text, maxLength = 50) => {
    if (!text) return "-";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Format price as NPR
  const formatPrice = (price) => {
    if (price === undefined || price === null) return "-";
    return `NPR ${price.toLocaleString()}`;
  };

  return (
    <AdminDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold mb-1">
              Tutoring Subjects
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage subjects available for private tutoring
            </p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        </div>

        {/* Content Card */}
        <Card>
          <CardContent className="p-0">
            {/* Loading State */}
            {isLoading && (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-lg font-semibold mb-2">Failed to load subjects</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {error?.message || "An error occurred while fetching subjects."}
                </p>
                <Button onClick={() => refetch()} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            )}

            {/* Data Table */}
            {!isLoading && !isError && subjects.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Description</TableHead>
                    <TableHead>Monthly Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-medium">{subject.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {truncateDescription(subject.description)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(subject.monthlyPrice)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={subject.isActive ? "default" : "secondary"}
                          className={subject.isActive ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                          {subject.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(subject)}
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDelete(subject)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Empty State */}
            {!isLoading && !isError && subjects.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No subjects yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first tutoring subject to get started.
                </p>
                <Button onClick={handleOpenCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Tutoring Subject</DialogTitle>
              <DialogDescription>
                Add a new subject for private tutoring services.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Name *</Label>
                  <Input
                    id="create-name"
                    name="name"
                    placeholder="e.g., Mathematics"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-description">Description</Label>
                  <Textarea
                    id="create-description"
                    name="description"
                    placeholder="Brief description of the subject..."
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-price">Monthly Price (NPR) *</Label>
                  <Input
                    id="create-price"
                    name="monthlyPrice"
                    type="number"
                    placeholder="e.g., 5000"
                    value={formData.monthlyPrice}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="create-active"
                    checked={formData.isActive}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="create-active" className="font-normal">
                    Active (visible to students)
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseCreate}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Subject"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Tutoring Subject</DialogTitle>
              <DialogDescription>
                Update the details of this tutoring subject.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    placeholder="e.g., Mathematics"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    placeholder="Brief description of the subject..."
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Monthly Price (NPR) *</Label>
                  <Input
                    id="edit-price"
                    name="monthlyPrice"
                    type="number"
                    placeholder="e.g., 5000"
                    value={formData.monthlyPrice}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-active"
                    checked={formData.isActive}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="edit-active" className="font-normal">
                    Active (visible to students)
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseEdit}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Tutoring Subject</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{selectedSubject?.name}&quot;?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCloseDelete}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminDashboardLayout>
  );
}
