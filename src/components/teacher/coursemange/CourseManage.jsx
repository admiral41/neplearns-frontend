import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BarChart2,
  ClipboardList,
  Users,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Clock,
  Calendar,
  BookOpen,
  FileText,
} from 'lucide-react';
import { getTeacherCourse, getLessonsByCourse, deleteLessonById, deleteQuizById, deleteAssignmentById } from '../../../api/apis';
import Swal from 'sweetalert2';
import { toast } from 'react-hot-toast';

const CourseManagePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('lessons');
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchCourseAndLessons = async () => {
      try {
        if (!slug) {
          navigate('/teacher/courses');
          return;
        }

        const response = await getTeacherCourse(slug, { signal: abortController.signal });
        const courseData = response.data.data;

        const lessonsRes = await getLessonsByCourse(courseData._id, { populate: 'quiz assignment' });
        const lessons = lessonsRes.data;

        setCourse({
          ...courseData,
          metrics: courseData.metrics || {
            enrolled: 0,
            completionRate: 0,
            avgQuizScore: 0,
          },
          lessons: lessons || [],
        });

      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching course:', error);
          navigate('/teacher/courses', { replace: true });
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchCourseAndLessons();
    return () => abortController.abort();
  }, [slug, navigate]);

  const handleDelete = async (type, id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      let apiCall;
      switch(type) {
        case 'lesson': 
          apiCall = deleteLessonById(id);
          break;
        case 'quiz':
          apiCall = deleteQuizById(id);
          break;
        case 'assignment':
          apiCall = deleteAssignmentById(id);
          break;
        default:
          throw new Error('Invalid delete type');
      }

      await apiCall;
      
      // Refresh data after deletion
      const lessonsRes = await getLessonsByCourse(course._id, { populate: 'quiz assignment' });
      setCourse(prev => ({
        ...prev,
        lessons: lessonsRes.data
      }));

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || `Failed to delete ${type}`);
    }
  };

  const MetricCard = ({ label, value, change, icon: Icon }) => (
    <div className="bg-white border rounded-xl p-5 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      </div>
      <h3 className="text-2xl font-semibold">{value}</h3>
      <p className="text-xs text-green-500">{change}</p>
    </div>
  );
  const tabSingularMap = {
    lessons: 'Lesson',
    quizzes: 'Quiz',
    assignments: 'Assignment',
  };
  if (loading) return <div className="p-6">Loading course...</div>;

  return (
    <div className="p-6 space-y-6">
      <Link
        to="/teacher/courses"
        className="flex items-center text-sm text-gray-500 hover:underline mb-2"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Courses
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
        <p className="text-gray-500">{course.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Enrolled Students"
          value={course.metrics.enrolled}
          change="+8 from last month"
          icon={Users}
        />
        <MetricCard
          label="Completion Rate"
          value={`${course.metrics.completionRate}%`}
          change="+4% from last month"
          icon={BarChart2}
        />
        <MetricCard
          label="Average Quiz Score"
          value={`${course.metrics.avgQuizScore}%`}
          change="+2% from last month"
          icon={ClipboardList}
        />
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          {['lessons', 'quizzes', 'assignments', 'students'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm rounded-lg ${
                activeTab === tab
                  ? 'bg-white shadow-sm text-gray-900 font-medium'
                  : 'text-gray-500'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {['lessons', 'quizzes', 'assignments'].includes(activeTab) && (
  <Link
    to={`/teacher/courses/${slug}/add-${tabSingularMap[activeTab].toLowerCase()}`}
    className="flex items-center gap-1 bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800"
  >
    <Plus size={16} />
    Add {tabSingularMap[activeTab]}
  </Link>
)}
      </div>

      <div className="mt-4">
        {activeTab === 'lessons' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Course Lessons</h3>
            {course.lessons.length > 0 ? (
              course.lessons.map((lesson) => (
                <div
                  key={lesson._id}
                  className="bg-white border rounded-xl p-4 flex justify-between items-center shadow-sm"
                >
                  <div className="space-y-1">
                    <h4 className="text-md font-semibold">{lesson.title}</h4>
                    <p className="text-sm text-gray-500">{lesson.description}</p>
                    <div className="flex gap-4 text-xs text-gray-400">
                      {lesson.quiz && (
                        <span className="flex items-center gap-1">
                          <BookOpen size={14} /> Has Quiz
                        </span>
                      )}
                      {lesson.assignment && (
                        <span className="flex items-center gap-1">
                          <FileText size={14} /> Has Assignment
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/teacher/courses/${slug}/edit-lesson/${lesson._id}`)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Pencil size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete('lesson', lesson._id)}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-6 border-2 border-dashed rounded-xl text-gray-500">
                No lessons added yet
              </div>
            )}
          </div>
        )}
 {activeTab === 'quizzes' && (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Course Quizzes</h3>
      {course.lessons.some(l => l.quiz) ? (
        course.lessons.map(
          (lesson) =>
            lesson.quiz && (
              <div
                key={lesson.quiz._id}
                className="bg-white border rounded-xl p-4 flex justify-between items-center shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-md font-semibold">{lesson.quiz.title}</h4>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {lesson.title}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {lesson.quiz.timeLimit} mins
                    </span>
                    <span>
                      Passing Score: {lesson.quiz.passingScore}%
                    </span>
                    <span>
                      {lesson.quiz.questions?.length} Questions
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/teacher/courses/${slug}/edit-quiz/${lesson.quiz._id}`)}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Pencil size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete('quiz', lesson.quiz._id)}
                    className="text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            )
        )
      ) : (
        <div className="text-center p-6 border-2 border-dashed rounded-xl text-gray-500">
          No quizzes added yet
        </div>
      )}
    </div>
  )}

  {activeTab === 'assignments' && (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Course Assignments</h3>
      {course.lessons.some(l => l.assignment) ? (
        course.lessons.map(
          (lesson) =>
            lesson.assignment && (
              <div
                key={lesson.assignment._id}
                className="bg-white border rounded-xl p-4 flex justify-between items-center shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-md font-semibold">{lesson.assignment.title}</h4>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {lesson.title}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      Due: {new Date(lesson.assignment.dueDate).toLocaleDateString()}
                    </span>
                    <span>
                      {lesson.assignment.attachments?.length} Attachments
                    </span>
                    <span>
                      {lesson.assignment.submissions?.length} Submissions
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/teacher/courses/${slug}/edit-assignment/${lesson.assignment._id}`)}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Pencil size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete('assignment', lesson.assignment._id)}
                    className="text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            )
        )
      ) : (
        <div className="text-center p-6 border-2 border-dashed rounded-xl text-gray-500">
          No assignments added yet
        </div>
      )}
    </div>
  )}

        {activeTab === 'students' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Enrolled Students</h3>
            {course.enrolledStudents?.length > 0 ? (
              <div className="bg-white border rounded-xl p-4 shadow-sm">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {course.enrolledStudents.map((student) => (
                    <div key={student._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm">
                          {student.name?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center p-6 border-2 border-dashed rounded-xl text-gray-500">
                No enrolled students yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseManagePage;