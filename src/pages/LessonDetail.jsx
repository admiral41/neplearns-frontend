import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { getLessonById, getQuizzesByLesson, getAssignmentsByLesson, getQuizResult } from '../api/apis';
import { toast } from 'react-hot-toast';
import { FaQuestionCircle, FaClock, FaStar, FaRegFileAlt, FaBook, FaCheckCircle } from 'react-icons/fa';
import ContentView from 'react-froala-wysiwyg/FroalaEditorView';

const LessonDetail = () => {
  const { lessonId, slug } = useParams();
  const navigate = useNavigate();
  const [lessonData, setLessonData] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [quizStatus, setQuizStatus] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch lesson data
        const { data: lesson } = await getLessonById(lessonId);
        setLessonData(lesson);

        // Fetch quizzes for this lesson
        const { data: quizzesData } = await getQuizzesByLesson(lessonId);
        setQuizzes(quizzesData.data || []);

        // Fetch assignments for this lesson
        const { data: assignmentsData } = await getAssignmentsByLesson(lessonId);
        setAssignments(assignmentsData.data || []);

        // Check quiz submission status for each quiz
        const statusUpdates = {};
        for (const quiz of quizzesData.data || []) {
          try {
            const result = await getQuizResult(quiz._id);
            if (result.data.data.submissions && result.data.data.submissions.length > 0) {
              statusUpdates[quiz._id] = 'completed';
            } else {
              // Check localStorage for in-progress quiz
              const savedQuizState = localStorage.getItem(`quiz_${quiz._id}`);
              if (savedQuizState) {
                const { status } = JSON.parse(savedQuizState);
                statusUpdates[quiz._id] = status;
              } else {
                statusUpdates[quiz._id] = 'not_started';
              }
            }
          } catch (error) {
            console.error(`Error checking status for quiz ${quiz._id}:`, error);
            statusUpdates[quiz._id] = 'not_started';
          }
        }
        setQuizStatus(statusUpdates);

      } catch (error) {
        toast.error('Failed to load lesson data');
        navigate(`/course/${slug}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lessonId, slug, navigate]);

  const getQuizButton = (quiz) => {
    const status = quizStatus[quiz._id] || 'not_started';
    
    switch (status) {
      case 'completed':
        return (
          <Link
            to={`/quiz/${quiz._id}/results`}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm whitespace-nowrap flex items-center gap-2"
          >
            <FaCheckCircle /> View Results
          </Link>
        );
      case 'in_progress':
        return (
          <Link
            to={`/quiz/${quiz._id}`}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-sm whitespace-nowrap flex items-center gap-2"
          >
            <FaClock /> Resume Quiz
          </Link>
        );
      default:
        return (
          <Link
            to={`/quiz/${quiz._id}`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm whitespace-nowrap flex items-center gap-2"
          >
            <FaQuestionCircle /> Start Quiz
          </Link>
        );
    }
  };

  const getQuizStatusBadge = (quizId) => {
    const status = quizStatus[quizId] || 'not_started';
    
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
            In Progress
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) return <div className="p-6">Loading lesson...</div>;

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 space-y-6 mt-16">
      <Link
        to={`/course/${slug}`}
        className="text-gray-500 flex items-center gap-1 text-sm hover:underline"
      >
        <ChevronLeft size={16} /> Back to Course
      </Link>

      <h2 className="text-2xl font-semibold text-gray-900">{lessonData.title}</h2>
      <p className="text-gray-600">{lessonData.description}</p>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('content')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'content'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <FaBook className="w-4 h-4" />
              Content
            </div>
          </button>

          <button
            onClick={() => setActiveTab('quizzes')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'quizzes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <FaQuestionCircle className="w-4 h-4" />
              Quizzes
              {quizzes.length > 0 && (
                <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {quizzes.length}
                </span>
              )}
            </div>
          </button>

          <button
            onClick={() => setActiveTab('assignments')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assignments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <FaRegFileAlt className="w-4 h-4" />
              Assignments
              {assignments.length > 0 && (
                <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {assignments.length}
                </span>
              )}
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        {activeTab === 'content' && (
          <div className="prose max-w-none">
            {lessonData.content ? (
              <ContentView model={lessonData.content} />
            ) : (
              <p className="text-gray-500">No content available for this lesson.</p>
            )}
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div>
            {quizzes.length > 0 ? (
              <div className="space-y-4">
                {quizzes.map((quiz) => (
                  <div key={quiz._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{quiz.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaClock className="w-3 h-3" />
                            {quiz.timeLimit} mins
                          </span>
                          <span className="flex items-center gap-1">
                            <FaStar className="w-3 h-3 text-yellow-400" />
                            {quiz.passingScore}% to pass
                          </span>
                          {getQuizStatusBadge(quiz._id)}
                        </div>
                      </div>
                      {getQuizButton(quiz)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaQuestionCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No quizzes</h3>
                <p className="mt-1 text-sm text-gray-500">This lesson doesn't have any quizzes yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div>
            {assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaClock className="w-3 h-3" />
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                          {assignment.submitted && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Submitted
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        to={`/assignment/${assignment._id}`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm whitespace-nowrap"
                      >
                        {assignment.submitted ? 'View Submission' : 'View Assignment'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaRegFileAlt className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments</h3>
                <p className="mt-1 text-sm text-gray-500">This lesson doesn't have any assignments yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonDetail;