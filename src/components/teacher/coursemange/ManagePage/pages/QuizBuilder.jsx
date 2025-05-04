import { Plus, Trash2, ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createQuiz,getTeacherCourse } from '../../../../../api/apis'; 
import { toast } from 'react-hot-toast';

const QuizBuilder = () => {
  const { slug, lessonId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const [quizInfo, setQuizInfo] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    passingScore: 70,
    lesson: lessonId
  });

  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await getTeacherCourse(slug);
        setCourse(res.data.data);
      } catch (err) {
        toast.error('Failed to load course data');
        navigate('/teacher/courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [slug, navigate]);

  const handleQuizInfoChange = (field, value) => {
    setQuizInfo({ ...quizInfo, [field]: value });
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      question: '',
      options: ['', '', '', ''],
      correct: 0,
      explanation: ''
    }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const quizData = {
        ...quizInfo,
        questions: questions.map(q => ({
          ...q,
          correctAnswer: q.options[q.correct]
        }))
      };
      
      await createQuiz(quizData);
      toast.success('Quiz created successfully!');
      navigate(`/teacher/courses/${slug}/manage`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save quiz');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto bg-white border rounded-2xl p-6 shadow-sm space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="text-gray-500 flex items-center gap-1 text-sm hover:underline"
      >
        <ChevronLeft size={16} /> Back
      </button>

      <h2 className="text-2xl font-semibold text-gray-900">Create New Quiz</h2>

      <div className="space-y-8">
        {/* Quiz Info Section */}
        <div className="border rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold">Quiz Information</h3>
          <p className="text-sm text-gray-500">Enter basic information about the quiz</p>

          <div className="space-y-4">
            <input
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Quiz Title"
              value={quizInfo.title}
              onChange={(e) => handleQuizInfoChange('title', e.target.value)}
              required
            />

            <textarea
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
              placeholder="Quiz Description"
              value={quizInfo.description}
              onChange={(e) => handleQuizInfoChange('description', e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Time Limit (minutes)</label>
                <input
                  type="number"
                  className="w-full p-3 border rounded-lg"
                  value={quizInfo.timeLimit}
                  onChange={(e) => handleQuizInfoChange('timeLimit', e.target.value)}
                  min="1"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Passing Score (%)</label>
                <input
                  type="number"
                  className="w-full p-3 border rounded-lg"
                  value={quizInfo.passingScore}
                  onChange={(e) => handleQuizInfoChange('passingScore', e.target.value)}
                  min="1"
                  max="100"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-6">
          {questions.map((q, i) => (
            <div key={i} className="border rounded-xl p-6 space-y-4 relative">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-lg">Question {i + 1}</h4>
                <button
                  onClick={() => setQuestions(questions.filter((_, idx) => idx !== i))}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <textarea
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter question text"
                value={q.question}
                onChange={(e) => {
                  const updated = [...questions];
                  updated[i].question = e.target.value;
                  setQuestions(updated);
                }}
                required
              />

              <div className="space-y-2">
                {q.options.map((opt, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${i}`}
                      checked={q.correct === j}
                      onChange={() => {
                        const updated = [...questions];
                        updated[i].correct = j;
                        setQuestions(updated);
                      }}
                    />
                    <input
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder={`Option ${j + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[i].options[j] = e.target.value;
                        setQuestions(updated);
                      }}
                      required
                    />
                  </div>
                ))}
              </div>

              <textarea
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Explanation for correct answer"
                value={q.explanation}
                onChange={(e) => {
                  const updated = [...questions];
                  updated[i].explanation = e.target.value;
                  setQuestions(updated);
                }}
              />
            </div>
          ))}

          <button
            onClick={addQuestion}
            className="w-full py-3 border-2 border-dashed rounded-xl text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
          >
            <Plus size={20} className="inline mr-2" />
            Add New Question
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          Save Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizBuilder;