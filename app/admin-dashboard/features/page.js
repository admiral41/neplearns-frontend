"use client";

import { useState } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  GraduationCap,
  Award,
  Video,
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  Shield,
  Star,
  Target,
  Zap,
  Heart,
  CheckCircle,
  MessageCircle,
  Globe,
  Laptop,
  GripVertical,
  Sparkles,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAlertDialog } from "@/components/ui/alert-dialog-provider";
import {
  useAdminFeatures,
  useCreateFeature,
  useUpdateFeature,
  useToggleFeatureStatus,
  useDeleteFeature,
  useUpdateSectionContent,
} from "@/lib/hooks/useFeatures";
import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/providers/SettingsProvider";

// Icon mapping
const iconMap = {
  GraduationCap,
  Award,
  Video,
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  Shield,
  Star,
  Target,
  Zap,
  Heart,
  CheckCircle,
  MessageCircle,
  Globe,
  Laptop,
};

const iconOptions = [
  { value: "GraduationCap", label: "Graduation Cap" },
  { value: "Award", label: "Award" },
  { value: "Video", label: "Video" },
  { value: "Users", label: "Users" },
  { value: "BookOpen", label: "Book" },
  { value: "TrendingUp", label: "Trending Up" },
  { value: "Clock", label: "Clock" },
  { value: "Shield", label: "Shield" },
  { value: "Star", label: "Star" },
  { value: "Target", label: "Target" },
  { value: "Zap", label: "Lightning" },
  { value: "Heart", label: "Heart" },
  { value: "CheckCircle", label: "Check Circle" },
  { value: "MessageCircle", label: "Message" },
  { value: "Globe", label: "Globe" },
  { value: "Laptop", label: "Laptop" },
];

export default function FeaturesPage() {
  const { showAlert } = useAlertDialog();
  const { getPlatformName } = useSettings();
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSectionOpen, setIsSectionOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);

  const [formData, setFormData] = useState({
    icon: "Star",
    title: "",
    description: "",
  });

  const [sectionData, setSectionData] = useState({
    title: "",
    subtitle: "",
  });

  // Fetch features
  const { data: response, isLoading } = useAdminFeatures({
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const createMutation = useCreateFeature();
  const updateMutation = useUpdateFeature();
  const toggleMutation = useToggleFeatureStatus();
  const deleteMutation = useDeleteFeature();
  const updateSectionMutation = useUpdateSectionContent();

  const features = response?.features || [];
  const sectionContent = response?.section || {
    title: "Why Choose {platformName}?",
    subtitle: "We provide the best learning experience",
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      return;
    }

    const featureData = {
      icon: formData.icon,
      title: formData.title,
      description: formData.description,
    };

    if (editingFeature) {
      updateMutation.mutate(
        { featureId: editingFeature._id, featureData },
        {
          onSuccess: () => {
            setIsCreateOpen(false);
            setEditingFeature(null);
            resetForm();
          },
        }
      );
    } else {
      createMutation.mutate(featureData, {
        onSuccess: () => {
          setIsCreateOpen(false);
          resetForm();
        },
      });
    }
  };

  const handleSectionSubmit = (e) => {
    e.preventDefault();
    updateSectionMutation.mutate(sectionData, {
      onSuccess: () => {
        setIsSectionOpen(false);
      },
    });
  };

  const resetForm = () => {
    setFormData({
      icon: "Star",
      title: "",
      description: "",
    });
  };

  const handleEdit = (feature) => {
    setEditingFeature(feature);
    setFormData({
      icon: feature.icon,
      title: feature.title,
      description: feature.description,
    });
    setIsCreateOpen(true);
  };

  const handleEditSection = () => {
    setSectionData({
      title: sectionContent.title,
      subtitle: sectionContent.subtitle,
    });
    setIsSectionOpen(true);
  };

  const handleDelete = (feature) => {
    showAlert({
      title: "Delete Feature",
      description: `Are you sure you want to delete "${feature.title}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: () => {
        deleteMutation.mutate(feature._id);
      },
    });
  };

  const handleToggleStatus = (feature) => {
    toggleMutation.mutate(feature._id);
  };

  const activeCount = features.filter((f) => f.isActive).length;
  const inactiveCount = features.filter((f) => !f.isActive).length;
  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    toggleMutation.isPending;

  // Replace {platformName} with actual name
  const displayTitle = sectionContent.title?.replace(
    "{platformName}",
    getPlatformName()
  );

  return (
    <AdminDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold mb-1">
              Why Choose Us Features
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage the features displayed in the "Why Choose Us" section
            </p>
          </div>
          <Dialog
            open={isCreateOpen}
            onOpenChange={(open) => {
              setIsCreateOpen(open);
              if (!open) {
                setEditingFeature(null);
                resetForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Feature
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingFeature ? "Edit Feature" : "Add Feature"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) =>
                      setFormData({ ...formData, icon: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => {
                        const IconComponent = iconMap[icon.value];
                        return (
                          <SelectItem key={icon.value} value={icon.value}>
                            <span className="flex items-center gap-2">
                              {IconComponent && (
                                <IconComponent className="h-4 w-4" />
                              )}
                              {icon.label}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Experienced Teachers"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="e.g., Learn from Nepal's top educators with proven track records"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    disabled={isMutating}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isMutating}>
                    {isMutating && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {editingFeature ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Section Content Card */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Section Header</h3>
                </div>
                <h2 className="text-xl font-bold mb-1">{displayTitle}</h2>
                <p className="text-muted-foreground">{sectionContent.subtitle}</p>
              </div>
              <Dialog open={isSectionOpen} onOpenChange={setIsSectionOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleEditSection}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Section Header</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSectionSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="sectionTitle">Title</Label>
                      <Input
                        id="sectionTitle"
                        value={sectionData.title}
                        onChange={(e) =>
                          setSectionData({ ...sectionData, title: e.target.value })
                        }
                        placeholder="Why Choose {platformName}?"
                      />
                      <p className="text-xs text-muted-foreground">
                        Use {"{platformName}"} to insert the platform name dynamically
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sectionSubtitle">Subtitle</Label>
                      <Textarea
                        id="sectionSubtitle"
                        rows={2}
                        value={sectionData.subtitle}
                        onChange={(e) =>
                          setSectionData({
                            ...sectionData,
                            subtitle: e.target.value,
                          })
                        }
                        placeholder="We provide the best learning experience..."
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsSectionOpen(false)}
                        disabled={updateSectionMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={updateSectionMutation.isPending}
                      >
                        {updateSectionMutation.isPending && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Save
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{features.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-500">{activeCount}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-500">
                {inactiveCount}
              </p>
              <p className="text-sm text-muted-foreground">Inactive</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Features List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-1/4" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : features.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Star className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No features found</h3>
                <p className="text-muted-foreground">
                  Add features to display in the "Why Choose Us" section
                </p>
              </CardContent>
            </Card>
          ) : (
            features.map((feature, index) => {
              const IconComponent = iconMap[feature.icon];
              return (
                <Card
                  key={feature._id}
                  className={cn(!feature.isActive && "opacity-60")}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        {IconComponent && (
                          <IconComponent className="h-6 w-6 text-primary" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-sm text-muted-foreground">
                            #{index + 1}
                          </span>
                          <h3 className="font-semibold">{feature.title}</h3>
                          {feature.isActive ? (
                            <Badge className="bg-green-500">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          {feature.description}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>
                            Added{" "}
                            {formatDistanceToNow(new Date(feature.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(feature)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(feature)}
                          >
                            {feature.isActive ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(feature)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
