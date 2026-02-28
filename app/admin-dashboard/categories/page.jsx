"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import {
  FolderOpen,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  Loader2,
  Check,
  X,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useAlertDialog } from "@/components/ui/alert-dialog-provider";
import { categoryAPI } from "@/lib/api/category";

export default function CategoriesPage() {
  const { showAlert } = useAlertDialog();
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    categoryName: "",
    categoryDesc: "",
    categoryShortDesc: "",
    color: "#4F46E5",
    icon: "",
    image: null,
    isActive: true,
  });

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await categoryAPI.getAllCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error(error.message || 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories.filter((category) => {
    return searchQuery ? 
      category.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.categoryDesc.toLowerCase().includes(searchQuery.toLowerCase()) : true;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      if (file.size > 500 * 1024) { // 500KB limit
        toast.error('Image size should be less than 500KB');
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const openCreateDialog = () => {
    setIsEditing(false);
    setCurrentCategory(null);
    setFormData({
      categoryName: "",
      categoryDesc: "",
      categoryShortDesc: "",
      color: "#4F46E5",
      icon: "",
      image: null,
      isActive: true,
    });
    setImagePreview(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (category) => {
    setIsEditing(true);
    setCurrentCategory(category);
    setFormData({
      categoryName: category.categoryName,
      categoryDesc: category.categoryDesc,
      categoryShortDesc: category.categoryShortDesc || "",
      color: category.color || "#4F46E5",
      icon: category.icon || "",
      image: null,
      isActive: category.isActive,
    });
    setImagePreview(category.image || null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.categoryName.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    if (!formData.categoryDesc.trim()) {
      toast.error('Category description is required');
      return;
    }

    try {
      // Prepare form data
      const submitFormData = new FormData();
      submitFormData.append('categoryName', formData.categoryName);
      submitFormData.append('categoryDesc', formData.categoryDesc);
      submitFormData.append('categoryShortDesc', formData.categoryShortDesc);
      submitFormData.append('color', formData.color);
      submitFormData.append('icon', formData.icon || '');

      if (formData.image) {
        submitFormData.append('image', formData.image);
      }

      if (isEditing && currentCategory) {
        // Update category
        await categoryAPI.updateCategory(currentCategory.categorySlug, submitFormData);
        toast.success('Category updated successfully!');
      } else {
        // Create category
        await categoryAPI.createCategory(submitFormData);
        toast.success('Category created successfully!');
      }
      
      fetchCategories(); // Refresh list
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.message || 'Failed to save category');
    }
  };

  const handleToggleStatus = async (category) => {
    try {
      await categoryAPI.toggleCategoryStatus(category.categorySlug, !category.isActive);
      toast.success(`Category ${!category.isActive ? 'activated' : 'deactivated'} successfully!`);
      fetchCategories(); // Refresh list
    } catch (error) {
      console.error('Error toggling category status:', error);
      toast.error(error.message || 'Failed to update category status');
    }
  };

  const handleDelete = async (category) => {
    showAlert({
      title: "Delete Category",
      description: `Are you sure you want to delete "${category.categoryName}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await categoryAPI.deleteCategory(category.categorySlug);
          toast.success('Category deleted successfully!');
          fetchCategories(); // Refresh list
        } catch (error) {
          console.error('Error deleting category:', error);
          toast.error(error.message || 'Failed to delete category');
        }
      },
    });
  };

  return (
    <AdminDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold mb-1">
              Category Management
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage course categories
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories Table */}
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
                    <TableHead>Category</TableHead>
                    <TableHead className="hidden sm:table-cell">Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Courses</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {category.image ? (
                            <img 
                              src={category.image} 
                              alt={category.categoryName}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div 
                              className="w-10 h-10 rounded flex items-center justify-center"
                              style={{ backgroundColor: category.color || '#4F46E5' }}
                            >
                              {category.icon ? (
                                <span className="text-white">{category.icon}</span>
                              ) : (
                                <FolderOpen className="h-5 w-5 text-white" />
                              )}
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{category.categoryName}</p>
                            {category.categoryShortDesc && (
                              <p className="text-xs text-muted-foreground">
                                {category.categoryShortDesc}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {category.categoryDesc}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={category.isActive}
                            onCheckedChange={() => handleToggleStatus(category)}
                          />
                          <Badge variant={category.isActive ? "default" : "secondary"}>
                            {category.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">
                          {category.meta?.courseCount || 0} courses
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(category)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(category)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {!isLoading && filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No categories found</h3>
                <p className="text-muted-foreground">
                  {categories.length === 0 ? 
                    'No categories available yet.' : 
                    'Try adjusting your search'}
                </p>
                {categories.length === 0 && (
                  <Button onClick={openCreateDialog} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Category
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Edit Category' : 'Create New Category'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6 py-4">
                {/* Left Column - Form */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryName">Category Name *</Label>
                    <Input
                      id="categoryName"
                      name="categoryName"
                      placeholder="e.g., Web Development"
                      value={formData.categoryName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoryShortDesc">Short Description</Label>
                    <Input
                      id="categoryShortDesc"
                      name="categoryShortDesc"
                      placeholder="Brief description"
                      value={formData.categoryShortDesc}
                      onChange={handleInputChange}
                      maxLength={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoryDesc">Full Description *</Label>
                    <Textarea
                      id="categoryDesc"
                      name="categoryDesc"
                      placeholder="Detailed category description..."
                      rows={4}
                      value={formData.categoryDesc}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="color"
                          name="color"
                          type="color"
                          className="w-12 h-10 p-1"
                          value={formData.color}
                          onChange={handleInputChange}
                        />
                        <Input
                          name="color"
                          value={formData.color}
                          onChange={handleInputChange}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="icon">Icon (Emoji)</Label>
                      <Input
                        id="icon"
                        name="icon"
                        placeholder="🎨"
                        value={formData.icon}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column - Image */}
                <div className="space-y-4">
                  <div>
                    <Label>Category Image</Label>
                    <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Category preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={removeImage}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-sm font-medium mb-2">
                            Upload Category Image
                          </p>
                          <p className="text-xs text-muted-foreground mb-4">
                            PNG, JPG up to 500KB
                          </p>
                          <Label htmlFor="category-image-upload">
                            <div className="cursor-pointer">
                              <Button type="button" variant="outline" size="sm">
                                Choose File
                              </Button>
                            </div>
                          </Label>
                        </>
                      )}
                      <input
                        id="category-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="border rounded-lg p-4">
                    <p className="text-sm font-medium mb-3">Preview</p>
                    <div className="flex items-center gap-3">
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Preview"
                          className="w-12 h-12 rounded object-cover"
                        />
                      ) : (
                        <div 
                          className="w-12 h-12 rounded flex items-center justify-center"
                          style={{ backgroundColor: formData.color }}
                        >
                          {formData.icon ? (
                            <span className="text-white text-lg">{formData.icon}</span>
                          ) : (
                            <FolderOpen className="h-6 w-6 text-white" />
                          )}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{formData.categoryName || "Category Name"}</p>
                        {formData.categoryShortDesc && (
                          <p className="text-xs text-muted-foreground">
                            {formData.categoryShortDesc}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? 'Update Category' : 'Create Category'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  );
}