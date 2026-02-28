'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RichTextEditor from './RichTextEditor';
import { Loader2, Upload, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import {
  useCreateAssignment,
  useUpdateAssignment,
} from '@/lib/hooks/useTutoringAssignment';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg',
  'image/png',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;

/**
 * AssignmentCreateDialog - Dialog for instructor to create/edit assignment
 * @param {boolean} open
 * @param {function} onOpenChange
 * @param {Array} students - Array of { enrollmentId, student, subject } from useMyStudents
 * @param {object|null} editingAssignment - If editing, the existing assignment
 * @param {function} onSuccess
 */
export default function AssignmentCreateDialog({
  open,
  onOpenChange,
  students = [],
  editingAssignment = null,
  onSuccess,
}) {
  const [enrollmentId, setEnrollmentId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const createAssignment = useCreateAssignment();
  const updateAssignment = useUpdateAssignment();

  const isEditing = !!editingAssignment;

  // Pre-fill form when editing
  useEffect(() => {
    if (editingAssignment) {
      setEnrollmentId(editingAssignment.enrollment?._id || editingAssignment.enrollment || '');
      setTitle(editingAssignment.title || '');
      setDescription(editingAssignment.description || '');
      setDueDate(
        editingAssignment.dueDate
          ? new Date(editingAssignment.dueDate).toISOString().split('T')[0]
          : ''
      );
      setFiles([]);
    }
  }, [editingAssignment]);

  const resetForm = () => {
    setEnrollmentId('');
    setTitle('');
    setDescription('');
    setDueDate('');
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen) resetForm();
    onOpenChange(newOpen);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    for (const file of selectedFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`"${file.name}" is not a supported file type.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" exceeds the 5MB limit.`);
        return;
      }
    }

    if (files.length + selectedFiles.length > MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} files allowed.`);
      return;
    }

    setFiles((prev) => [...prev, ...selectedFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    handleFileChange({ target: { files: droppedFiles } });
  };

  const handleSubmit = async () => {
    if (!isEditing && !enrollmentId) {
      toast.error('Please select a student.');
      return;
    }
    if (!title.trim()) {
      toast.error('Please enter a title.');
      return;
    }

    try {
      if (isEditing) {
        await updateAssignment.mutateAsync({
          id: editingAssignment._id,
          title: title.trim(),
          description: description.trim() || undefined,
          dueDate: dueDate || undefined,
        });
      } else {
        const formData = new FormData();
        formData.append('enrollmentId', enrollmentId);
        formData.append('title', title.trim());
        if (description.trim()) formData.append('description', description.trim());
        if (dueDate) formData.append('dueDate', dueDate);
        files.forEach((file) => formData.append('attachments', file));

        await createAssignment.mutateAsync(formData);
      }

      handleOpenChange(false);
      onSuccess?.();
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const isPending = createAssignment.isPending || updateAssignment.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Assignment' : 'Create Assignment'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the assignment details.'
              : 'Create a new assignment for a student.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Student Select (only for create) */}
          {!isEditing && (
            <div className="space-y-2">
              <Label>Student</Label>
              <Select value={enrollmentId} onValueChange={setEnrollmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.enrollmentId} value={s.enrollmentId}>
                      {s.student?.firstname} {s.student?.lastname}
                      {s.subject?.name ? ` - ${s.subject.name}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              placeholder="Assignment title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Instructions or details for the student..."
              disabled={isPending}
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date (Optional)</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isPending}
            />
          </div>

          {/* File Attachments (only for create) */}
          {!isEditing && (
            <div className="space-y-2">
              <Label>Attachments (Optional)</Label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpeg,.jpg,.png"
                onChange={handleFileChange}
                className="hidden"
                disabled={isPending}
              />

              {files.length < MAX_FILES && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOC, DOCX, JPEG, PNG (max 5MB each, up to {MAX_FILES} files)
                  </p>
                </div>
              )}

              {files.length > 0 && (
                <div className="space-y-2 mt-2">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 border rounded bg-muted/30"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm truncate flex-1">{file.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => removeFile(idx)}
                        disabled={isPending}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !title.trim() || (!isEditing && !enrollmentId)}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : isEditing ? (
              'Update Assignment'
            ) : (
              'Create Assignment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
