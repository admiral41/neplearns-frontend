import { useState, useEffect } from 'react';
import ContentEditor from '../../content_editor/ContentEditor';
import { updateLesson } from '../../../api/apis';
import { toast } from 'react-hot-toast';

const LessonInfoSection = ({ initialData, courseId, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        content: initialData.content
      });
    }
  }, [initialData]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      await updateLesson(initialData._id, {
        ...formData,
        courseId
      });
      toast.success('Lesson updated successfully!');
      onSuccess();
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white border rounded-2xl p-6 shadow-sm space-y-8">
      <div className="space-y-6">
        <section className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Lesson Information</h3>
          <input
            className="w-full p-3 border rounded-md text-sm"
            placeholder="Lesson Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
          <textarea
            className="w-full p-3 border rounded-md text-sm"
            placeholder="Lesson Description"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">Lesson Content</h3>
          </div>
          <ContentEditor
            model={formData.content}
            handleModelChange={(content) => setFormData({...formData, content})}
            height={250}
          />
        </section>

        <button
          className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default LessonInfoSection;