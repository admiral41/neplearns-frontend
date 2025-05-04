import { useState } from 'react';
import ContentEditor from '../../../../content_editor/ContentEditor';
import { addLesson } from '../../../../../api/apis';
import toast from 'react-hot-toast';

const LessonInfoSection = ({ courseId }) => {
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [sectionContent, setSectionContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateLesson = async () => {
    if (!lessonTitle || !lessonDescription || !sectionContent) {
      toast.error('Please fill in all fields before submitting.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', lessonTitle);
      formData.append('description', lessonDescription);
      formData.append('content', sectionContent);
      formData.append('courseId', courseId);

      console.log('Creating lesson with:', {
        title: lessonTitle,
        description: lessonDescription,
        content: sectionContent,
        courseId,
      });

      await addLesson(formData);

      toast.success('Lesson created successfully!');
      setLessonTitle('');
      setLessonDescription('');
      setSectionContent('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create lesson.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white border rounded-2xl p-6 shadow-sm space-y-8">
      <div className="space-y-6">
        {/* Lesson Info */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Lesson Information</h3>
          <input
            className="w-full p-3 border rounded-md text-sm"
            placeholder="e.g., Introduction to HTML"
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
          />
          <textarea
            className="w-full p-3 border rounded-md text-sm"
            placeholder="Describe what students will learn in this lesson"
            rows={3}
            value={lessonDescription}
            onChange={(e) => setLessonDescription(e.target.value)}
          />
        </section>

        {/* Lesson Content Editor */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">Introduction</h3>
            <span className="text-sm text-gray-500">Text content</span>
          </div>
          <ContentEditor
            model={sectionContent}
            handleModelChange={setSectionContent}
            height={250}
          />
        </section>

        <button
          className="bg-blue-600 text-white px-5 py-2 rounded-md"
          onClick={handleCreateLesson}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Lesson'}
        </button>
      </div>
    </div>
  );
};

export default LessonInfoSection;
