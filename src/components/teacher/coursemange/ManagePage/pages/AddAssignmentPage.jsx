import { useState } from 'react';
import { Upload, Plus, X } from 'lucide-react';
import { createAssignment } from '../../../../../api/apis';
import { toast } from 'react-hot-toast'; 

const AddAssignmentPage = () => {
  const [assignments, setAssignments] = useState([
    {
      title: '',
      description: '',
      dueDate: '',
      instructions: '',
      files: [],
    },
  ]);

  const handleChange = (index, key, value) => {
    const updated = [...assignments];
    updated[index][key] = value;
    setAssignments(updated);
  };

  const handleFileUpload = (index, e) => {
    const files = Array.from(e.target.files);
    const updated = [...assignments];
    updated[index].files = files;
    setAssignments(updated);
  };

  const addNewAssignment = () => {
    setAssignments((prev) => [
      ...prev,
      {
        title: '',
        description: '',
        dueDate: '',
        instructions: '',
        files: [],
      },
    ]);
  };

  const removeAssignment = (index) => {
    setAssignments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAssignments = async () => {
    try {
      for (const assignment of assignments) {
        const formData = new FormData();
        formData.append('title', assignment.title);
        formData.append('description', assignment.description);
        formData.append('dueDate', assignment.dueDate);
        formData.append('instructions', assignment.instructions);

        if (assignment.files.length > 0) {
          assignment.files.forEach((file) => {
            formData.append('files', file);
          });
        }

        await createAssignment(formData);
      }

      toast.success('Assignments saved successfully!');
      setAssignments([
        {
          title: '',
          description: '',
          dueDate: '',
          instructions: '',
          files: [],
        },
      ]);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save assignments.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white border rounded-2xl p-6 shadow space-y-10">
      <h2 className="text-2xl font-semibold text-gray-900">Add Assignments</h2>

      {assignments.map((assignment, index) => (
        <div key={index} className="border rounded-xl p-6 space-y-6 relative">
          {assignments.length > 1 && (
            <button
              onClick={() => removeAssignment(index)}
              className="absolute top-4 right-4 text-red-500 hover:text-red-700"
              title="Remove assignment"
            >
              <X size={18} />
            </button>
          )}

          <h3 className="text-lg font-semibold text-gray-800 mb-2">Assignment {index + 1}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                className="w-full p-3 border rounded-md text-sm"
                placeholder="e.g. Create a Portfolio Website"
                value={assignment.title}
                onChange={(e) => handleChange(index, 'title', e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Submission Date</label>
              <input
                type="date"
                className="w-full p-3 border rounded-md text-sm"
                value={assignment.dueDate}
                onChange={(e) => handleChange(index, 'dueDate', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Short Description</label>
            <textarea
              className="w-full p-3 border rounded-md text-sm"
              rows={2}
              placeholder="Brief overview of the assignment"
              value={assignment.description}
              onChange={(e) => handleChange(index, 'description', e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Instructions</label>
            <textarea
              className="w-full p-3 border rounded-md text-sm"
              rows={4}
              placeholder="Detailed steps and instructions for the assignment"
              value={assignment.instructions}
              onChange={(e) => handleChange(index, 'instructions', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Upload Files</label>
            <div className="w-full border-2 border-dashed rounded-lg p-6 text-center text-sm text-gray-500 hover:border-gray-300 transition-all">
              <label htmlFor={`file-upload-${index}`} className="cursor-pointer flex flex-col items-center gap-2">
                <Upload size={24} />
                <span>Click to upload files</span>
                <span className="text-xs text-gray-400">(PDF, DOCX, ZIP | max. 50MB)</span>
                <input
                  id={`file-upload-${index}`}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(index, e)}
                />
              </label>

              {assignment.files.length > 0 && (
                <ul className="mt-4 text-left text-sm text-gray-700">
                  {assignment.files.map((file, idx) => (
                    <li key={idx}>• {file.name}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ))}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={addNewAssignment}
          className="inline-flex items-center px-4 py-2 text-sm text-green-700 border border-green-600 rounded-md hover:bg-green-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another Assignment
        </button>

        <button
          onClick={handleSaveAssignments}
          className="px-5 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
        >
          Save All Assignments
        </button>
      </div>
    </div>
  );
};

export default AddAssignmentPage;
