import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import LessonInfoSection from './LessonInfoSection';
import { getLessonById } from '../../../api/apis';
import { toast } from 'react-hot-toast';

const EditLessonPage = () => {
  const { slug, lessonId } = useParams();
  const navigate = useNavigate();
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLessonData = async () => {
      try {
        const { data } = await getLessonById(lessonId);
        setLessonData(data);
      } catch (error) {
        toast.error('Failed to load lesson data');
        navigate(`/teacher/courses/${slug}`);
      } finally {
        setLoading(false);
      }
    };

    loadLessonData();
  }, [lessonId, slug, navigate]);

  const handleUpdateSuccess = () => {
    navigate(`/teacher/courses/${slug}`);
  };

  if (loading) return <div className="p-6">Loading lesson data...</div>;

  return (
    <div className="max-w-5xl mx-auto bg-white border rounded-2xl p-6 shadow-sm space-y-6">
      <button
        onClick={() => navigate(`/teacher/courses/${slug}`)}
        className="text-gray-500 flex items-center gap-1 text-sm hover:underline"
      >
        <ChevronLeft size={16} /> Back to Course
      </button>

      <h2 className="text-2xl font-semibold text-gray-900">Edit Lesson</h2>

      <LessonInfoSection 
        initialData={lessonData}
        courseId={lessonData.course}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  );
};

export default EditLessonPage;