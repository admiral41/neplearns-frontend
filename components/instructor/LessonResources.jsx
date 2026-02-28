"use client";

import { useState, useEffect } from "react";
import { Plus, Link as LinkIcon, FileText, Loader2, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { resourceAPI } from "@/lib/api/resources";

export default function LessonResources({ lessonId }) {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        title: "",
        type: "LINK",
        url: "",
    });

    useEffect(() => {
        if (lessonId) fetchResources();
    }, [lessonId]);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const response = await resourceAPI.getResourcesByLesson(lessonId);
            setResources(response.data || response || []);
        } catch {
            setResources([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!form.title.trim() || !form.url.trim()) {
            return toast.error("Title and URL required");
        }

        try {
            setAdding(true);
            const response = await resourceAPI.createResource({
                ...form,
                lesson: lessonId,
            });

            if (response.success || response.status === 200 || response.status === 201) {
                toast.success("Resource added");
                setResources(prev => [...prev, response.data || response]);
                setForm({ title: "", type: "LINK", url: "" });
                setShowForm(false);
            }
        } catch {
            toast.error("Failed to add");
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await resourceAPI.deleteResource(id);
            if (response.success || response.status === 200) {
                toast.success("Deleted");
                setResources(prev => prev.filter(r => r._id !== id));
            }
        } catch {
            toast.error("Failed to delete");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground/50">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Loading resources...</span>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Resources</span>
                    {resources.length > 0 && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                            {resources.length}
                        </Badge>
                    )}
                </div>

                {!showForm && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => setShowForm(true)}
                    >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add
                    </Button>
                )}
            </div>

            {/* Add Form */}
            {showForm && (
                <div className="border rounded-md p-3 bg-muted/20 space-y-3">
                    <Input
                        placeholder="Resource title"
                        value={form.title}
                        onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                        className="h-8 text-sm"
                    />

                    <div className="flex gap-2">
                        <Select
                            value={form.type}
                            onValueChange={(v) => setForm(f => ({ ...f, type: v }))}
                        >
                            <SelectTrigger className="h-8 w-24 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="LINK">Link</SelectItem>
                                <SelectItem value="FILE">File</SelectItem>
                            </SelectContent>
                        </Select>

                        <Input
                            placeholder="URL"
                            value={form.url}
                            onChange={(e) => setForm(f => ({ ...f, url: e.target.value }))}
                            className="h-8 text-sm flex-1"
                        />

                        <Button
                            size="sm"
                            className="h-8 px-3"
                            onClick={handleAdd}
                            disabled={adding}
                        >
                            {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Add"}
                        </Button>

                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2"
                            onClick={() => {
                                setShowForm(false);
                                setForm({ title: "", type: "LINK", url: "" });
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {/* Resources List */}
            {resources.length > 0 && (
                <div className="space-y-1.5">
                    {resources.map((r) => (
                        <div key={r._id} className="flex items-center justify-between group py-1.5 px-2 rounded-md hover:bg-muted/50">
                            <div className="flex items-center gap-2 min-w-0">
                                {r.type === "LINK" ? (
                                    <LinkIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                ) : (
                                    <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                )}
                                <a
                                    href={r.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs truncate max-w-[200px] hover:text-primary flex items-center gap-1"
                                >
                                    {r.title}
                                    <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-50" />
                                </a>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                onClick={() => handleDelete(r._id)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}