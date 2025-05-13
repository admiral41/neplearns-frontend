import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import LessonInfoSection from './ManagePage/pages/LessonInfoSection';
import { getTeacherCourse } from '../../../api/apis';

const AddLessonPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [courseId, setCourseId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await getTeacherCourse(slug);
        const course = res?.data?.data;
        setCourseId(course._id);
      } catch (err) {
        console.error("Failed to fetch course by slug", err);
        navigate('/teacher/courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [slug, navigate]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto bg-white border rounded-2xl p-6 shadow-sm space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="text-gray-500 flex items-center gap-1 text-sm hover:underline"
      >
        <ChevronLeft size={16} /> Back
      </button>

      <h2 className="text-2xl font-semibold text-gray-900">Add New Lesson</h2>

      {/* Lesson Content Section */}
      <LessonInfoSection courseId={courseId} />

      {/* Save Button */}
      {/* <div className="flex justify-end pt-4">
        <button className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">
          Save Lesson
        </button>
      </div> */}
    </div>
  );
};

export default AddLessonPage;