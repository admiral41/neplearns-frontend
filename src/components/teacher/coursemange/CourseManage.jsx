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
  Eye,
  X,
  Check,
} from 'lucide-react';
import {
  getTeacherCourse,
  getLessonsByCourse,
  deleteLessonById,
  deleteQuizById,
  deleteAssignmentById,
  updateCourse,
  deleteCourse,
  getQuizzesByCourse,
  getAssignmentsByCourse,
  baseURL
} from '../../../api/apis';
import Swal from 'sweetalert2';
import { toast } from 'react-hot-toast';

const CourseManagePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('lessons');
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    price: 0,
    tags: []
  });
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  // Fetch basic course data
  useEffect(() => {
    const abortController = new AbortController();

    const fetchCourse = async () => {
      try {
        if (!slug) {
          navigate('/teacher/courses');
          return;
        }

        const response = await getTeacherCourse(slug, { signal: abortController.signal });
        const courseData = response.data.data;

        setCourse({
          ...courseData,
          metrics: courseData.metrics || {
            enrolled: 0,
            completionRate: 0,
            avgQuizScore: 0,
          }
        });

        setEditFormData({
          title: courseData.title,
          subtitle: courseData.subtitle || '',
          description: courseData.description || '',
          price: courseData.price || 0,
          tags: courseData.tags || []
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

    fetchCourse();
    return () => abortController.abort();
  }, [slug, navigate]);

  // Fetch lessons when tab is active or changes
  useEffect(() => {
    if (!course?._id || activeTab !== 'lessons') return;

    const fetchLessons = async () => {
      try {
        setTabLoading(true);
        const lessonsRes = await getLessonsByCourse(course._id);
        setCourse(prev => ({
          ...prev,
          lessons: lessonsRes.data || []
        }));
      } catch (error) {
        console.error('Error fetching lessons:', error);
        toast.error('Failed to load lessons');
      } finally {
        setTabLoading(false);
      }
    };

    fetchLessons();
  }, [course?._id, activeTab]);

  // Fetch quizzes when tab is active or changes
  useEffect(() => {
    if (!course?._id || activeTab !== 'quizzes') return;

    const fetchQuizzes = async () => {
      try {
        setTabLoading(true);
        const quizzesRes = await getQuizzesByCourse(course._id);
        console.log('Quizzes:', quizzesRes.data.data);
        setQuizzes(quizzesRes.data.data || []);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        toast.error('Failed to load quizzes');
      } finally {
        setTabLoading(false);
      }
    };

    fetchQuizzes();
  }, [course?._id, activeTab]);

  // Fetch assignments when tab is active or changes
  useEffect(() => {
    if (!course?._id || activeTab !== 'assignments') return;

    const fetchAssignments = async () => {
      try {
        setTabLoading(true);
        const assignmentsRes = await getAssignmentsByCourse(course._id);
        setAssignments(assignmentsRes.data || []);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        toast.error('Failed to load assignments');
      } finally {
        setTabLoading(false);
      }
    };

    fetchAssignments();
  }, [course?._id, activeTab]);

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
      // Optimistic update for quizzes
      if (type === 'quiz') {
        setQuizzes(prev => prev.filter(q => q._id !== id));
      }

      let apiCall;
      switch (type) {
        case 'lesson':
          apiCall = deleteLessonById(id);
          break;
        case 'quiz':
          apiCall = deleteQuizById(id);
          break;
        case 'assignment':
          apiCall = deleteAssignmentById(id);
          break;
        case 'course':
          apiCall = deleteCourse(slug);
          break;
        default:
          throw new Error('Invalid delete type');
      }

      await apiCall;

      if (type === 'course') {
        navigate('/teacher/courses');
        toast.success('Course deleted successfully');
        return;
      }

      // Refresh data from server after successful deletion
      if (type === 'lesson') {
        const lessonsRes = await getLessonsByCourse(course._id);
        setCourse(prev => ({ ...prev, lessons: lessonsRes.data || [] }));
      } else if (type === 'quiz') {
        const quizzesRes = await getQuizzesByCourse(course._id);
        setQuizzes(quizzesRes.data.data || []); // Note: using data.data
      } else if (type === 'assignment') {
        const assignmentsRes = await getAssignmentsByCourse(course._id);
        setAssignments(assignmentsRes.data || []);
      }

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
    } catch (error) {
      // Revert optimistic update if deletion failed
      if (type === 'quiz') {
        const quizzesRes = await getQuizzesByCourse(course._id);
        setQuizzes(quizzesRes.data.data || []);
      }

      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || `Failed to delete ${type}`);
    }
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await updateCourse(slug, editFormData);
      setCourse(prev => ({
        ...prev,
        ...response.data.data
      }));
      setShowEditModal(false);
      toast.success('Course updated successfully');
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error(error.response?.data?.message || 'Failed to update course');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = e.target.value.trim();
      if (value && !editFormData.tags.includes(value)) {
        setEditFormData(prev => ({
          ...prev,
          tags: [...prev.tags, value]
        }));
        e.target.value = '';
      }
    }
  };

  const removeTag = (indexToRemove) => {
    setEditFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, index) => index !== indexToRemove)
    }));
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
  const handleEditQuiz = (quizId) => {
    navigate(`/teacher/courses/${slug}/edit-quiz/${quizId}`);
  };
  const handlePreviewQuiz = (quizId) => {
  navigate(`/teacher/courses/${slug}/preview-quiz/${quizId}`);
};
  const handleViewResults = (quizId) => {
    const quiz = quizzes.find(q => q._id === quizId);
    if (quiz?.submissions?.length > 0) {
      navigate(`/teacher/courses/${slug}/quiz-results/${quizId}`);
    } else {
      toast.error('No submissions available for this quiz yet');
    }
  };
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <Link
          to="/teacher/courses"
          className="flex items-center text-sm text-gray-500 hover:underline mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Courses
        </Link>

        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg"
          >
            <Eye size={16} /> Preview
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg"
          >
            <Pencil size={16} /> Edit Course
          </button>
          <button
            onClick={() => handleDelete('course', course._id)}
            className="flex items-center gap-1 text-sm bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg"
          >
            <Trash2 size={16} /> Delete Course
          </button>
        </div>
      </div>

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

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Course Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="border-b pb-4">
                <h1 className="text-2xl font-bold">{course.title}</h1>
                <p className="text-gray-600">{course.subtitle}</p>
              </div>

              {course.image && (
                <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={`${baseURL}/${course.image?.replace(/\\/g, '/')}`}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Price</h3>
                <p className="text-gray-700">${course.price}</p>
              </div>

              {course.tags?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Course</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleEditCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={editFormData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  name="subtitle"
                  value={editFormData.subtitle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  name="price"
                  value={editFormData.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editFormData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  onKeyDown={handleTagInput}
                  placeholder="Type a tag and press Enter or comma"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                >
                  <Check size={16} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          {['lessons', 'quizzes', 'assignments', 'students'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm rounded-lg ${activeTab === tab
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
        {tabLoading && (
          <div className="text-center p-4">Loading {activeTab}...</div>
        )}

        {activeTab === 'lessons' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Course Lessons</h3>
            {course.lessons?.length > 0 ? (
              course.lessons.map((lesson) => (
                <div
                  key={lesson._id}
                  className="bg-white border rounded-xl p-4 flex justify-between items-center shadow-sm"
                >
                  <div className="space-y-1">
                    <h4 className="text-md font-semibold">{lesson.title}</h4>
                    <p className="text-sm text-gray-500">{lesson.description}</p>
                    <div className="flex gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <BookOpen size={14} />
                        {lesson.quiz ? 'Has Quiz' : 'No Quiz'}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText size={14} />
                        {lesson.assignment ? 'Has Assignment' : 'No Assignment'}
                      </span>
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
            {quizzes.length > 0 ? (
              quizzes.map((quiz) => {
                const submissionsCount = quiz.submissions?.length || 0;
                return (
                  <div
                    key={quiz._id}
                    className="bg-white border rounded-xl p-4 flex justify-between items-center shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-md font-semibold">{quiz.title}</h4>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {quiz.lesson?.title || 'No Lesson'}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {quiz.timeLimit} mins
                        </span>
                        <span>
                          Passing Score: {quiz.passingScore}%
                        </span>
                        <span>
                          {quiz.questions?.length || 0} Questions
                        </span>
                        <span>
                          {submissionsCount} Submission{submissionsCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditQuiz(quiz._id)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Pencil size={16} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete('quiz', quiz._id)}
                        className="text-red-600 hover:text-red-800 flex items-center gap-1"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                      <button
                        onClick={() => handleViewResults(quiz._id)}
                        className={`flex items-center gap-1 ${submissionsCount > 0
                            ? 'text-green-600 hover:text-green-800'
                            : 'text-gray-400 cursor-not-allowed'
                          }`}
                        disabled={submissionsCount === 0}
                      >
                        <ClipboardList size={16} /> Results
                      </button>
                      <button
                        onClick={() => handlePreviewQuiz(quiz._id)}
                        className="text-purple-600 hover:text-purple-800 flex items-center gap-1"
                      >
                        <Eye size={16} /> Preview
                      </button>
                    </div>
                  </div>
                );
              })
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
            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                <div
                  key={assignment._id}
                  className="bg-white border rounded-xl p-4 flex justify-between items-center shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-md font-semibold">{assignment.title}</h4>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {assignment.lesson?.title || 'No Lesson'}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                      <span>
                        Points: {assignment.points}
                      </span>
                      <span>
                        {assignment.attachments?.length || 0} Attachments
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/teacher/courses/${slug}/edit-assignment/${assignment._id}`)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Pencil size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete('assignment', assignment._id)}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                    <button
                      onClick={() => navigate(`/teacher/courses/${slug}/assignment-submissions/${assignment._id}`)}
                      className="text-green-600 hover:text-green-800 flex items-center gap-1"
                    >
                      <ClipboardList size={16} /> Submissions
                    </button>
                  </div>
                </div>
              ))
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