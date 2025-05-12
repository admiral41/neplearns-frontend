import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import ContentEditor from '../../../../content_editor/ContentEditor';
import {
  getAssignmentWithSubmissions,
  updateAssignment,
  getTeacherCourse,
  getLessonsByCourse
} from '../../../../../api/apis';
import { toast } from 'react-hot-toast';

const EditAssignmentPage = () => {
  const { slug, assignmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [assignment, setAssignment] = useState({
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    points: 100,
    lesson: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch course data
        const courseRes = await getTeacherCourse(slug);
        setCourse(courseRes.data.data);

        // Fetch lessons for this course
        const lessonsRes = await getLessonsByCourse(courseRes.data.data._id);
        setLessons(lessonsRes.data || []);

        // Fetch assignment data
        console.log('Fetching assignment with ID:', assignmentId); // Debug log
        const assignmentRes = await getAssignmentWithSubmissions(assignmentId);
        console.log('Assignment response:', assignmentRes); // Debug log

        const assignmentData = assignmentRes.data;
        console.log('Assignment data:', assignmentData); // Debug log

        setAssignment({
          title: assignmentData.title,
          description: assignmentData.description || '',
          instructions: assignmentData.instructions,
          dueDate: new Date(assignmentData.dueDate).toISOString().slice(0, 16),
          points: assignmentData.points,
          lesson: assignmentData.lesson._id
        });

      } catch (err) {
        console.error('Error details:', err); // More detailed error logging
        console.error('Error response:', err.response); // API response if available
        toast.error(err.response?.data?.message || 'Failed to load assignment data');
        navigate(`/teacher/courses/${slug}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, assignmentId, navigate]);

  const handleChange = (field, value) => {
    setAssignment(prev => ({ ...prev, [field]: value }));
  };

  // EditAssignmentPage.jsx
  const handleSaveAssignment = async (e) => {
    e.preventDefault();

    if (!assignment.lesson) {
      toast.error('Please select a lesson for this assignment');
      return;
    }

    if (!assignment.instructions) {
      toast.error('Please provide assignment instructions');
      return;
    }

    try {
      const response = await updateAssignment(assignmentId, {
        title: assignment.title,
        description: assignment.description,
        instructions: assignment.instructions,
        dueDate: assignment.dueDate,
        points: assignment.points,
        lesson: assignment.lesson
      });

      if (response.success) {
  toast.success('Assignment updated successfully!');
  navigate(`/teacher/courses/${slug}`);
} else {
  toast.error(response.message || 'Failed to update assignment');
}

    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error(error.response?.message || 'Failed to update assignment');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto bg-white border rounded-2xl p-6 shadow space-y-10">
      <button
        onClick={() => navigate(`/teacher/courses/${slug}`)}
        className="text-gray-500 flex items-center gap-1 text-sm hover:underline"
      >
        <ChevronLeft size={16} /> Back to Course
      </button>

      <h2 className="text-2xl font-semibold text-gray-900">Edit Assignment</h2>

      <form onSubmit={handleSaveAssignment} className="border rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Title*</label>
            <input
              type="text"
              className="w-full p-3 border rounded-md text-sm"
              placeholder="e.g. Create a Portfolio Website"
              value={assignment.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Lesson*</label>
            <select
              className="w-full p-3 border rounded-md text-sm"
              value={assignment.lesson}
              onChange={(e) => handleChange('lesson', e.target.value)}
              required
            >
              <option value="">Select a lesson</option>
              {lessons.map(lesson => (
                <option key={lesson._id} value={lesson._id}>
                  {lesson.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Due Date*</label>
            <input
              type="datetime-local"
              className="w-full p-3 border rounded-md text-sm"
              value={assignment.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Points*</label>
            <input
              type="number"
              className="w-full p-3 border rounded-md text-sm"
              value={assignment.points}
              onChange={(e) => handleChange('points', e.target.value)}
              min="1"
              required
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
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">Instructions*</label>
            <span className="text-sm text-gray-500">Rich text content</span>
          </div>
          <ContentEditor
            model={assignment.instructions}
            handleModelChange={(content) => handleChange('instructions', content)}
            height={300}
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAssignmentPage;