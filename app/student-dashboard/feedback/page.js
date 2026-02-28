"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    MessageSquare,
    AlertTriangle,
    Send,
    Clock,
    CheckCircle2,
    XCircle,
    ThumbsUp,
    MessageSquarePlus,
} from "lucide-react";
import { toast } from "sonner";

export default function FeedbackPage() {
    const [activeTab, setActiveTab] = useState("submit");
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        type: "",
        category: "",
        subject: "",
        message: "",
        priority: "",
        rating: "",
    });

    // Mock data for previous submissions
    const previousSubmissions = [
        {
            id: 1,
            type: "feedback",
            subject: "Great teaching methodology",
            category: "Course Content",
            status: "acknowledged",
            date: "2024-01-15",
            response: "Thank you for your positive feedback!",
        },
        {
            id: 2,
            type: "complaint",
            subject: "Video quality issues in live class",
            category: "Technical Issues",
            status: "resolved",
            date: "2024-01-10",
            response:
                "We have upgraded our streaming infrastructure. Please check now.",
        },
        {
            id: 3,
            type: "complaint",
            subject: "Payment not reflected",
            category: "Payment Problems",
            status: "in-progress",
            date: "2024-01-18",
            response: null,
        },
    ];

    const categories = {
        feedback: [
            "Course Content",
            "Teaching Quality",
            "Platform Experience",
            "Live Classes",
            "Study Materials",
            "Other",
        ],
        complaint: [
            "Technical Issues",
            "Payment Problems",
            "Course Access",
            "Teacher/Staff",
            "Content Quality",
            "Other",
        ],
    };

    const handleTypeChange = (value) => {
        setForm({
            ...form,
            type: value,
            category: "", // Reset category when type changes
            priority: "",
            rating: "",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.type) {
            toast.error("Please select a submission type");
            return;
        }

        if (!form.category || !form.subject || !form.message) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (form.type === "complaint" && !form.priority) {
            toast.error("Please select a priority level");
            return;
        }

        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            if (form.type === "feedback") {
                toast.success(
                    "Thank you! Your feedback has been submitted successfully."
                );
            } else {
                toast.success(
                    "Your complaint has been registered. We will get back to you soon."
                );
            }
            setForm({
                type: "",
                category: "",
                subject: "",
                message: "",
                priority: "",
                rating: "",
            });
            setLoading(false);
        }, 1000);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: {
                variant: "secondary",
                icon: Clock,
                label: "Pending",
            },
            "in-progress": {
                variant: "default",
                icon: Clock,
                label: "In Progress",
            },
            resolved: {
                variant: "success",
                icon: CheckCircle2,
                label: "Resolved",
            },
            acknowledged: {
                variant: "default",
                icon: ThumbsUp,
                label: "Acknowledged",
            },
            rejected: {
                variant: "destructive",
                icon: XCircle,
                label: "Rejected",
            },
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <Badge
                variant={config.variant}
                className={`flex items-center gap-1 ${config.variant === "success"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    : ""
                    }`}
            >
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    return (
        <DashboardLayout>
            <div className="px-4 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-lg sm:text-xl font-bold mb-2">
                        Feedback & Complaints
                    </h1>
                    <p className="text-muted-foreground">
                        Share your feedback or report any issues you&apos;re facing
                    </p>
                </div>

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-6"
                >
                    <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                        <TabsTrigger value="submit" className="flex items-center gap-2">
                            <Send className="h-4 w-4" />
                            Submit New
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            History
                        </TabsTrigger>
                    </TabsList>

                    {/* Submit New Tab */}
                    <TabsContent value="submit" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <MessageSquarePlus className="h-5 w-5 text-primary" />
                                    Submit Feedback or Complaint
                                </CardTitle>
                                <CardDescription>
                                    Help us improve by sharing your experience or reporting issues
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Two Column Layout */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Type Selection */}
                                        <div className="space-y-2">
                                            <Label htmlFor="type">
                                                Type <span className="text-destructive">*</span>
                                            </Label>
                                            <Select value={form.type} onValueChange={handleTypeChange}>
                                                <SelectTrigger id="type">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="feedback">
                                                        <div className="flex items-center gap-2">
                                                            <MessageSquare className="h-4 w-4 text-primary" />
                                                            Feedback
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="complaint">
                                                        <div className="flex items-center gap-2">
                                                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                                                            Complaint
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Category Selection - Shows based on type */}
                                        <div className="space-y-2">
                                            <Label htmlFor="category">
                                                Category <span className="text-destructive">*</span>
                                            </Label>
                                            <Select
                                                value={form.category}
                                                onValueChange={(value) =>
                                                    setForm({ ...form, category: value })
                                                }
                                                disabled={!form.type}
                                            >
                                                <SelectTrigger id="category">
                                                    <SelectValue placeholder={form.type ? "Select category" : "Select type first"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {form.type && categories[form.type].map((cat) => (
                                                        <SelectItem key={cat} value={cat}>
                                                            {cat}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Second Row - Two Columns */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Subject */}
                                        <div className="space-y-2">
                                            <Label htmlFor="subject">
                                                Subject <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="subject"
                                                placeholder="Brief subject of your submission"
                                                value={form.subject}
                                                onChange={(e) =>
                                                    setForm({ ...form, subject: e.target.value })
                                                }
                                            />
                                        </div>

                                        {/* Priority - Only for complaints, Rating - Only for feedback */}
                                        <div className="space-y-2">
                                            {form.type === "complaint" ? (
                                                <>
                                                    <Label htmlFor="priority">
                                                        Priority <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Select
                                                        value={form.priority}
                                                        onValueChange={(value) =>
                                                            setForm({ ...form, priority: value })
                                                        }
                                                    >
                                                        <SelectTrigger id="priority">
                                                            <SelectValue placeholder="Select priority" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="low">
                                                                Low - General inquiry
                                                            </SelectItem>
                                                            <SelectItem value="medium">
                                                                Medium - Needs attention
                                                            </SelectItem>
                                                            <SelectItem value="high">
                                                                High - Urgent issue
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </>
                                            ) : (
                                                <>
                                                    <Label htmlFor="rating">Rating (Optional)</Label>
                                                    <Select
                                                        value={form.rating}
                                                        onValueChange={(value) =>
                                                            setForm({ ...form, rating: value })
                                                        }
                                                    >
                                                        <SelectTrigger id="rating">
                                                            <SelectValue placeholder="Rate your experience" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent</SelectItem>
                                                            <SelectItem value="4">⭐⭐⭐⭐ Good</SelectItem>
                                                            <SelectItem value="3">⭐⭐⭐ Average</SelectItem>
                                                            <SelectItem value="2">⭐⭐ Below Average</SelectItem>
                                                            <SelectItem value="1">⭐ Poor</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Message - Full Width */}
                                    <div className="space-y-2">
                                        <Label htmlFor="message">
                                            {form.type === "complaint" ? "Description" : "Message"}{" "}
                                            <span className="text-destructive">*</span>
                                        </Label>
                                        <Textarea
                                            id="message"
                                            placeholder={
                                                form.type === "complaint"
                                                    ? "Describe your issue in detail..."
                                                    : "Tell us about your experience..."
                                            }
                                            rows={5}
                                            value={form.message}
                                            onChange={(e) =>
                                                setForm({ ...form, message: e.target.value })
                                            }
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        variant={form.type === "complaint" ? "destructive" : "default"}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            "Submitting..."
                                        ) : (
                                            <>
                                                {form.type === "complaint" ? (
                                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                                ) : (
                                                    <Send className="h-4 w-4 mr-2" />
                                                )}
                                                {form.type === "complaint"
                                                    ? "Submit Complaint"
                                                    : "Submit Feedback"}
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Your Submissions</CardTitle>
                                <CardDescription>
                                    Track the status of your feedback and complaints
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {previousSubmissions.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>No submissions yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {previousSubmissions.map((submission) => (
                                            <div
                                                key={submission.id}
                                                className="p-4 border rounded-lg space-y-3"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        {submission.type === "feedback" ? (
                                                            <MessageSquare className="h-4 w-4 text-primary" />
                                                        ) : (
                                                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                                                        )}
                                                        <span className="font-medium">
                                                            {submission.subject}
                                                        </span>
                                                    </div>
                                                    {getStatusBadge(submission.status)}
                                                </div>

                                                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                                    <Badge variant="outline">{submission.category}</Badge>
                                                    <span>•</span>
                                                    <span>
                                                        {new Date(submission.date).toLocaleDateString(
                                                            "en-US",
                                                            {
                                                                year: "numeric",
                                                                month: "short",
                                                                day: "numeric",
                                                            }
                                                        )}
                                                    </span>
                                                    <span>•</span>
                                                    <Badge variant="secondary" className="capitalize">
                                                        {submission.type}
                                                    </Badge>
                                                </div>

                                                {submission.response && (
                                                    <div className="mt-3 p-3 bg-muted rounded-md">
                                                        <p className="text-sm font-medium mb-1">Response:</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {submission.response}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
