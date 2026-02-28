"use client";

import { useState } from "react";
import InstructorDashboardLayout from "@/components/instructor/InstructorDashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FolderOpen,
  Search,
  Info,
  Loader2,
} from "lucide-react";
import { useCategories } from "@/lib/hooks/useInstructor";

export default function InstructorCategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch categories (read-only)
  const { data: categoriesData, isLoading } = useCategories();
  const categories = categoriesData?.data || [];

  const filteredCategories = categories.filter((category) => {
    const name = category.categoryName || category.name || "";
    const desc = category.categoryDesc || category.description || "";
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <InstructorDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-lg sm:text-xl font-bold mb-1">Categories</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Browse available course categories
          </p>
        </div>

        {/* Info Alert - Read Only */}
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Categories are managed by administrators. You can use these categories when creating your courses.
          </AlertDescription>
        </Alert>

        {/* Search */}
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
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="hidden sm:table-cell">Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Courses</TableHead>
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
                              alt={category.categoryName || category.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div
                              className="w-10 h-10 rounded flex items-center justify-center"
                              style={{ backgroundColor: category.color || "#4F46E5" }}
                            >
                              {category.icon ? (
                                <span className="text-white">{category.icon}</span>
                              ) : (
                                <FolderOpen className="h-5 w-5 text-white" />
                              )}
                            </div>
                          )}
                          <div>
                            <p className="font-medium">
                              {category.categoryName || category.name}
                            </p>
                            {(category.categoryShortDesc || category.shortDescription) && (
                              <p className="text-xs text-muted-foreground">
                                {category.categoryShortDesc || category.shortDescription}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {category.categoryDesc || category.description || "No description"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={category.isActive !== false ? "default" : "secondary"}>
                          {category.isActive !== false ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">
                          {category.meta?.courseCount || category.courseCount || 0} courses
                        </Badge>
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
                  {categories.length === 0
                    ? "No categories available yet."
                    : "Try adjusting your search"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </InstructorDashboardLayout>
  );
}
