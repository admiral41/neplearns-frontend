"use client";

import { useState } from "react";
import Link from "next/link";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Mail,
  Save,
  Edit,
  Eye,
  Send,
  UserPlus,
  Key,
  BookOpen,
  CreditCard,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

const emailTemplates = [
  {
    id: "welcome",
    name: "Welcome Email",
    description: "Sent to new users after registration",
    icon: UserPlus,
    subject: "Welcome to Medha eClass - Let's Start Learning!",
    variables: ["{{name}}", "{{email}}"],
    lastUpdated: new Date("2024-02-15"),
  },
  {
    id: "password_reset",
    name: "Password Reset",
    description: "Sent when user requests password reset",
    icon: Key,
    subject: "Reset Your Medha eClass Password",
    variables: ["{{name}}", "{{reset_link}}", "{{expiry_time}}"],
    lastUpdated: new Date("2024-01-20"),
  },
  {
    id: "course_enrollment",
    name: "Course Enrollment",
    description: "Sent after successful course enrollment",
    icon: BookOpen,
    subject: "You're Enrolled! Start Learning {{course_name}}",
    variables: ["{{name}}", "{{course_name}}", "{{instructor_name}}", "{{course_link}}"],
    lastUpdated: new Date("2024-02-01"),
  },
  {
    id: "payment_confirmation",
    name: "Payment Confirmation",
    description: "Sent after successful payment",
    icon: CreditCard,
    subject: "Payment Confirmed - Order #{{order_id}}",
    variables: ["{{name}}", "{{order_id}}", "{{amount}}", "{{course_name}}", "{{payment_method}}"],
    lastUpdated: new Date("2024-02-10"),
  },
  {
    id: "instructor_approved",
    name: "Instructor Approved",
    description: "Sent when instructor application is approved",
    icon: CheckCircle,
    subject: "Congratulations! You're Now a Medha eClass Instructor",
    variables: ["{{name}}", "{{dashboard_link}}"],
    lastUpdated: new Date("2024-01-25"),
  },
  {
    id: "course_approved",
    name: "Course Approved",
    description: "Sent to instructor when course is approved",
    icon: CheckCircle,
    subject: "Your Course '{{course_name}}' is Now Live!",
    variables: ["{{name}}", "{{course_name}}", "{{course_link}}"],
    lastUpdated: new Date("2024-02-05"),
  },
  {
    id: "refund_processed",
    name: "Refund Processed",
    description: "Sent when refund is approved",
    icon: CreditCard,
    subject: "Refund Processed - Rs. {{amount}}",
    variables: ["{{name}}", "{{amount}}", "{{course_name}}", "{{refund_id}}"],
    lastUpdated: new Date("2024-02-20"),
  },
  {
    id: "application_rejected",
    name: "Application Rejected",
    description: "Sent when instructor application is rejected",
    icon: AlertCircle,
    subject: "Update on Your Instructor Application",
    variables: ["{{name}}", "{{reason}}"],
    lastUpdated: new Date("2024-01-30"),
  },
];

export default function EmailTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editedContent, setEditedContent] = useState({
    subject: "",
    body: "",
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setEditedContent({
      subject: template.subject,
      body: `Dear {{name}},\n\nThank you for choosing Medha eClass!\n\n[Template content for ${template.name}]\n\nBest regards,\nMedha eClass Team`,
    });
  };

  const handleSave = () => {
    toast.success(`${selectedTemplate.name} template saved successfully!`);
    setSelectedTemplate(null);
  };

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  const handleTestEmail = () => {
    toast.success("Test email sent to admin@padhaihub.com");
  };

  return (
    <AdminDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin-dashboard/settings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-bold">Email Templates</h1>
            <p className="text-sm text-muted-foreground">
              Customize email notifications sent to users
            </p>
          </div>
        </div>

        {selectedTemplate ? (
          /* Edit Template View */
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <selectedTemplate.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{selectedTemplate.name}</CardTitle>
                    <CardDescription>{selectedTemplate.description}</CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedTemplate(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={editedContent.subject}
                  onChange={(e) =>
                    setEditedContent({ ...editedContent, subject: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Email Body</Label>
                <Textarea
                  id="body"
                  rows={12}
                  value={editedContent.body}
                  onChange={(e) =>
                    setEditedContent({ ...editedContent, body: e.target.value })
                  }
                  className="font-mono text-sm"
                />
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium mb-2">Available Variables:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.variables.map((variable) => (
                    <Badge key={variable} variant="outline" className="font-mono">
                      {variable}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Click on a variable to copy it to clipboard
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="flex-1" onClick={handlePreview}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleTestEmail}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Test
                </Button>
                <Button className="flex-1" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Template List */
          <div className="grid sm:grid-cols-2 gap-4">
            {emailTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <Card key={template.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10 shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1">{template.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {template.description}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          Subject: {template.subject}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-muted-foreground">
                            Updated: {template.lastUpdated.toLocaleDateString()}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(template)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Email Preview</DialogTitle>
            </DialogHeader>
            <div className="mt-4 border rounded-lg overflow-hidden">
              <div className="p-4 bg-muted border-b">
                <p className="text-sm">
                  <strong>To:</strong> student@example.com
                </p>
                <p className="text-sm">
                  <strong>Subject:</strong>{" "}
                  {editedContent.subject
                    .replace("{{name}}", "John Doe")
                    .replace("{{course_name}}", "Web Development Bootcamp")
                    .replace("{{order_id}}", "ORD-12345")}
                </p>
              </div>
              <div className="p-6 bg-white">
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {editedContent.body
                    .replace(/{{name}}/g, "John Doe")
                    .replace(/{{email}}/g, "john@example.com")
                    .replace(/{{course_name}}/g, "Web Development Bootcamp")
                    .replace(/{{instructor_name}}/g, "Ramesh Kumar")
                    .replace(/{{amount}}/g, "1,999")
                    .replace(/{{order_id}}/g, "ORD-12345")}
                </pre>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  );
}
