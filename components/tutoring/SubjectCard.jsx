"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle } from "lucide-react";

/**
 * SubjectCard - Displays a tutoring subject with name, description, and price
 * @param {Object} subject - The tutoring subject object
 * @param {string} subject.name - Subject name
 * @param {string} subject.description - Subject description (optional)
 * @param {number} subject.monthlyPrice - Monthly price in NPR
 * @param {string} subject.slug - Subject slug for navigation
 * @param {boolean} enrolled - Whether the student is already enrolled
 * @param {Function} onSelect - Optional callback when card is clicked
 */
export default function SubjectCard({ subject, enrolled, onSelect }) {
  const { name, description, monthlyPrice, slug } = subject;

  const handleClick = () => {
    if (onSelect && !enrolled) {
      onSelect(subject);
    }
  };

  const isClickable = onSelect && !enrolled;

  return (
    <Card
      className={`h-full transition-all duration-200 ${isClickable ? 'cursor-pointer hover:shadow-lg hover:border-primary/50' : ''} ${enrolled ? 'opacity-75 border-green-200 bg-green-50/30' : ''}`}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${enrolled ? 'bg-green-100' : 'bg-primary/10'}`}>
              {enrolled ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <BookOpen className="h-5 w-5 text-primary" />
              )}
            </div>
            <CardTitle className="text-lg">{name}</CardTitle>
          </div>
          {enrolled && (
            <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50">
              Enrolled
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {description && (
          <CardDescription className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </CardDescription>
        )}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">Monthly Fee</span>
          <Badge variant="secondary" className="text-base font-semibold">
            NPR {monthlyPrice.toLocaleString()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
