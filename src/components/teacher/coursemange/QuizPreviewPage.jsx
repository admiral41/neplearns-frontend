// components/teacher/coursemange/QuizPreviewPage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getQuizPreview } from '../../../api/apis';
import { toast } from 'react-hot-toast';
import { FaArrowLeft, FaClock, FaCheck, FaTimes } from 'react-icons/fa';

const QuizPreviewPage = () => {
  const { slug, quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await getQuizPreview(quizId);
        setQuiz(response.data.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load quiz preview');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, navigate]);

  if (loading) return <div className="p-6">Loading quiz preview...</div>;
  if (!quiz) return <div className="p-6">Quiz not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
      >
        <FaArrowLeft /> Back to Course
      </button>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
        <p className="text-gray-600 mb-4">{quiz.description}</p>
        
        <div className="flex items-center gap-4 mb-6 text-sm">
          <span className="flex items-center gap-1">
            <FaClock /> {quiz.timeLimit} minutes
          </span>
          <span>Passing Score: {quiz.passingScore}%</span>
        </div>

        <div className="space-y-6">
          {quiz.questions.map((question, index) => (
            <div key={question._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-medium">
                  {index + 1}. {question.question}
                </h3>
                <span className="text-sm text-gray-500">
                  {question.points} point{question.points !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-2">
                {question.options.map((option, optIndex) => (
                  <div
                    key={optIndex}
                    className={`p-3 border rounded-lg ${
                      option.isCorrect
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        option.isCorrect ? 'bg-green-500 text-white' : 'bg-gray-200'
                      }`}>
                        {option.isCorrect ? <FaCheck size={12} /> : <FaTimes size={12} />}
                      </span>
                      <span>{option.text}</span>
                    </div>
                  </div>
                ))}
              </div>

              {question.explanation && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm">
                  <p className="font-medium">Explanation:</p>
                  <p>{question.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizPreviewPage;