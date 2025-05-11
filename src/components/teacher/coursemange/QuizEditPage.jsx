import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, ChevronLeft } from 'lucide-react';
import { getQuizById, updateQuiz, getTeacherCourse } from '../../../api/apis';
import { toast } from 'react-hot-toast';

const QuizEditPage = () => {
  const { slug, quizId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState([]);
  const [quizInfo, setQuizInfo] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    passingScore: 70,
    attemptsAllowed: 1,
    lesson: '',
    lessonName: '' // Add lessonName to store the display name
  });
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, quizRes] = await Promise.all([
          getTeacherCourse(slug),
          getQuizById(quizId)
        ]);

        const courseLessons = courseRes.data.data.lessons || [];
        setLessons(courseLessons);

        const quiz = quizRes.data;

        // Find the lesson name from the course lessons
        const lessonName = courseLessons.find(
          lesson => lesson._id === quiz.lesson._id
        )?.title || quiz.lesson.title || '';

        setQuizInfo({
          title: quiz.title,
          description: quiz.description,
          timeLimit: quiz.timeLimit,
          passingScore: quiz.passingScore,
          attemptsAllowed: quiz.attemptsAllowed,
          lesson: quiz.lesson._id, // Store the ID for form submission
          lessonName: lessonName // Store the name for display
        });

        setQuestions(quiz.questions.map(q => ({
          _id: q._id || Math.random().toString(36).substr(2, 9),
          question: q.question,
          options: q.options.map(opt => opt.text),
          correctOption: q.options.findIndex(opt => opt.isCorrect),
          explanation: q.explanation,
          points: q.points
        })));
      } catch (err) {
        toast.error('Failed to load data');
        navigate(`/teacher/courses/${slug}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [quizId, slug, navigate]);

  const handleQuizInfoChange = (field, value) => {
    setQuizInfo({ ...quizInfo, [field]: value });
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      _id: Math.random().toString(36).substr(2, 9), // Generate unique ID
      question: '',
      options: ['', '', '', ''],
      correctOption: 0,
      explanation: '',
      points: 1
    }]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, idx) => idx !== index));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleCorrectOptionChange = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].correctOption = optionIndex;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!quizInfo.lesson) {
      toast.error('Please select a lesson for this quiz');
      return;
    }

    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    // Validate all questions have text and at least 2 options
    for (const [i, q] of questions.entries()) {
      if (!q.question.trim()) {
        toast.error(`Question ${i + 1} must have text`);
        return;
      }
      if (q.options.filter(opt => opt.trim()).length < 2) {
        toast.error(`Question ${i + 1} must have at least 2 options`);
        return;
      }
    }

    try {
      const quizData = {
        ...quizInfo,
        questions: questions.map(q => ({
          question: q.question,
          options: q.options.map((opt, idx) => ({
            text: opt,
            isCorrect: idx === q.correctOption
          })),
          explanation: q.explanation,
          points: q.points
        }))
      };

      await updateQuiz(quizId, quizData);
      toast.success('Quiz updated successfully!');
      navigate(`/teacher/courses/${slug}`);
    } catch (error) {
      console.error("Quiz update error:", error);
      toast.error(error.response?.data?.message || error.message || 'Failed to update quiz');
    }
  };

  if (loading) return <div className="p-6">Loading quiz data...</div>;

  return (
    <div className="max-w-5xl mx-auto bg-white border rounded-2xl p-6 shadow-sm space-y-6">
      <button
        onClick={() => navigate(`/teacher/courses/${slug}`)}
        className="text-gray-500 flex items-center gap-1 text-sm hover:underline"
      >
        <ChevronLeft size={16} /> Back to Course
      </button>

      <h2 className="text-2xl font-semibold text-gray-900">Edit Quiz</h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Quiz Info Section */}
        <div className="border rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold">Quiz Information</h3>
          <p className="text-sm text-gray-500">Update basic information about the quiz</p>

          <div className="space-y-4">
            <input
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Quiz Title*"
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

            {/* Lesson Selection Dropdown */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Selected Lesson</label>
              <div className="flex items-center gap-2">
                <select
                  className="w-full p-3 border rounded-lg"
                  value={quizInfo.lesson}
                  onChange={(e) => {
                    const selectedLesson = lessons.find(l => l._id === e.target.value);
                    setQuizInfo({
                      ...quizInfo,
                      lesson: e.target.value,
                      lessonName: selectedLesson?.title || ''
                    });
                  }}
                  required
                >
                  <option value="">Select a lesson</option>
                  {lessons.map(lesson => (
                    <option key={lesson._id} value={lesson._id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
                {quizInfo.lessonName && (
                  <span className="text-sm text-gray-600">
                    Currently selected: {quizInfo.lessonName}
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Time Limit (minutes)*</label>
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
                <label className="block text-sm font-medium text-gray-700">Passing Score (%)*</label>
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

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Attempts Allowed*</label>
                <input
                  type="number"
                  className="w-full p-3 border rounded-lg"
                  value={quizInfo.attemptsAllowed}
                  onChange={(e) => handleQuizInfoChange('attemptsAllowed', e.target.value)}
                  min="1"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-6">
          {questions.map((q, i) => (
            <div key={q._id} className="border rounded-xl p-6 space-y-4 relative">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-lg">Question {i + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeQuestion(i)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <textarea
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter question text*"
                value={q.question}
                onChange={(e) => handleQuestionChange(i, 'question', e.target.value)}
                required
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Points*</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  value={q.points}
                  onChange={(e) => handleQuestionChange(i, 'points', parseInt(e.target.value) || 1)}
                  min="1"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Options*</label>
                {q.options.map((opt, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${q._id}`}
                      checked={q.correctOption === j}
                      onChange={() => handleCorrectOptionChange(i, j)}
                    />
                    <input
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder={`Option ${j + 1}*`}
                      value={opt}
                      onChange={(e) => handleOptionChange(i, j, e.target.value)}
                      required
                    />
                  </div>
                ))}
              </div>

              <textarea
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Explanation for correct answer"
                value={q.explanation}
                onChange={(e) => handleQuestionChange(i, 'explanation', e.target.value)}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="w-full py-3 border-2 border-dashed rounded-xl text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
          >
            <Plus size={20} className="inline mr-2" />
            Add New Question
          </button>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            disabled={questions.length === 0}
          >
            Update Quiz
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizEditPage;