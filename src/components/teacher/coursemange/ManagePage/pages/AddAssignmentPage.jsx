import { useState, useEffect } from 'react';
import { Plus, ChevronLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import ContentEditor from '../../../../content_editor/ContentEditor';
import { 
  createAssignment, 
  getTeacherCourse,
  getLessonsByCourse
} from '../../../../../api/apis';
import { toast } from 'react-hot-toast';

const AddAssignmentPage = () => {
  const { slug, lessonId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [assignment, setAssignment] = useState({
    title: '',
    description: '',
    instructions: '', // This will now contain rich text content
    dueDate: '',
    points: 100,
    lesson: lessonId || ''
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
        
        // If lessonId was provided in URL, verify it exists
        if (lessonId) {
          const lessonExists = lessonsRes.data.some(lesson => lesson._id === lessonId);
          if (!lessonExists) {
            toast.error('Invalid lesson specified');
            navigate(`/teacher/courses/${slug}/manage`);
          }
        }
      } catch (err) {
        toast.error('Failed to load course data');
        navigate('/teacher/courses');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [slug, lessonId, navigate]);

  const handleChange = (field, value) => {
    setAssignment(prev => ({ ...prev, [field]: value }));
  };

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
      const formData = new FormData();
      formData.append('title', assignment.title);
      formData.append('description', assignment.description);
      formData.append('instructions', assignment.instructions);
      formData.append('dueDate', assignment.dueDate);
      formData.append('points', assignment.points);
      formData.append('lesson', assignment.lesson);

      await createAssignment(formData);
      toast.success('Assignment created successfully!');
      navigate(`/teacher/courses/${slug}/manage`);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to create assignment');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto bg-white border rounded-2xl p-6 shadow space-y-10">
      <button
        onClick={() => navigate(-1)}
        className="text-gray-500 flex items-center gap-1 text-sm hover:underline"
      >
        <ChevronLeft size={16} /> Back
      </button>

      <h2 className="text-2xl font-semibold text-gray-900">Create New Assignment</h2>

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
            <Plus size={16} />
            Create Assignment
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAssignmentPage;