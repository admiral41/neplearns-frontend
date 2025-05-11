import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizResult } from '../api/apis';
import { toast } from 'react-hot-toast';
import { FaCheck, FaTimes, FaChartBar, FaArrowLeft } from 'react-icons/fa';

const QuizResults = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await getQuizResult(quizId);
        setResult(res.data.data);
        setLoading(false);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load quiz results');
        navigate(-1);
      }
    };
    fetchResults();
  }, [quizId, navigate]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded w-full"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-4 border p-4 rounded-lg">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded w-full"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const latestSubmission = result.submissions[result.submissions.length - 1];
  console.log('Score:', latestSubmission.score, 'Passing Score:', result.passingScore);
  const passed = latestSubmission.score >= result.passingScore;
  console.log('Passed:', passed);

  return (
    <div className="max-w-4xl mx-auto p-6 mt-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 mb-6"
      >
        <FaArrowLeft /> Back to Course
      </button>

      <div className={`p-6 rounded-lg mb-8 ${passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Quiz Results</h2>
            <p className="text-gray-600">{result.title}</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{latestSubmission.score}%</div>
            <div className={`flex items-center gap-1 ${passed ? 'text-green-600' : 'text-red-600'}`}>
              {passed ? <FaCheck /> : <FaTimes />}
              <span>{passed ? 'Passed' : 'Failed'}</span>
            </div>
            <div className="text-sm text-gray-500">Passing: {result.passingScore}%</div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaChartBar /> Performance Summary
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{latestSubmission.score}%</div>
            <div className="text-sm text-gray-500">Your Score</div>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{result.submissions.length}/{result.attemptsAllowed}</div>
            <div className="text-sm text-gray-500">Attempts</div>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{result.questions.length}</div>
            <div className="text-sm text-gray-500">Questions</div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <h3 className="text-lg font-semibold">Question Review</h3>

        {result.questions.map((question, qIndex) => {
          const submissionAnswer = latestSubmission.answers.find(a =>
            a.questionId === question._id.toString()
          );
          const isCorrect = submissionAnswer?.isCorrect;


          return (
            <div key={question._id} className={`border rounded-lg p-6 ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-start gap-3 mb-4">
                <span className="font-medium text-gray-800">{qIndex + 1}.</span>
                <h3 className="text-lg font-medium text-gray-800">{question.question}</h3>
                <span className="ml-auto text-sm text-gray-500">{question.points} point{question.points !== 1 ? 's' : ''}</span>
              </div>

              <div className="space-y-3 pl-8">
                {question.options.map((option, oIndex) => {
                  const isSelected = submissionAnswer?.selectedOption === oIndex;
                  const isCorrectOption = oIndex === question.correctOption;

                  return (
                    <div
                      key={oIndex}
                      className={`p-3 border rounded-lg ${isCorrectOption ? 'border-green-500 bg-green-100' : isSelected ? 'border-red-500 bg-red-100' : 'border-gray-200'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isCorrectOption ? 'border-green-500 bg-green-500' : isSelected ? 'border-red-500 bg-red-500' : 'border-gray-400'}`}>
                          {isCorrectOption || isSelected ? (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          ) : null}
                        </div>
                        <span>{option}</span>
                        {isCorrectOption && (
                          <span className="ml-auto text-sm text-green-600">Correct Answer</span>
                        )}
                        {isSelected && !isCorrectOption && (
                          <span className="ml-auto text-sm text-red-600">Your Answer</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {question.explanation && !isCorrect && (
                <div className="mt-4 pl-8 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Explanation:</span> {question.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizResults;