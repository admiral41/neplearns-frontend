import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { getLessonById } from '../api/apis';
import { toast } from 'react-hot-toast';
import LessonDisplaySection from './LessonDisplaySection';

const LessonDetail = () => {
  const { lessonId, slug } = useParams();
  const navigate = useNavigate();
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const { data } = await getLessonById(lessonId);
        setLessonData(data);
      } catch (error) {
        toast.error('Failed to load lesson');
        navigate(`/course/${slug}`);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId, slug, navigate]);

  if (loading) return <div className="p-6">Loading lesson...</div>;

  return (
    <div className="max-w-5xl mx-auto bg-white  p-6  space-y-6 mt-16">
      <Link
        to={`/course/${slug}`}
        className="text-gray-500 flex items-center gap-1 text-sm hover:underline"
      >
        <ChevronLeft size={16} /> Back to Course
      </Link>

      <h2 className="text-2xl font-semibold text-gray-900">{lessonData.title}</h2>
      <p className="text-gray-600">{lessonData.description}</p>

      <LessonDisplaySection lesson={lessonData} />
    </div>
  );
};

export default LessonDetail;
