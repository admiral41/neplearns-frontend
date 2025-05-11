import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, FileText } from 'lucide-react';
import { getQuizResults, getQuizById } from '../../../api/apis';
import { toast } from 'react-hot-toast';

const QuizResultsPage = () => {
  const { slug, quizId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resultsRes, quizRes] = await Promise.all([
          getQuizResults(quizId),
          getQuizById(quizId)
        ]);
        
        setResults(resultsRes.data);
        setQuiz(quizRes.data);
      } catch (err) {
        toast.error('Failed to load quiz results');
        navigate(`/teacher/courses/${slug}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [quizId, slug, navigate]);

  if (loading) return <div className="p-6">Loading results...</div>;

  return (
    <div className="max-w-5xl mx-auto bg-white border rounded-2xl p-6 shadow-sm space-y-6">
      <Link
        to={`/teacher/courses/${slug}`}
        className="text-gray-500 flex items-center gap-1 text-sm hover:underline"
      >
        <ChevronLeft size={16} /> Back to Course
      </Link>

      <h2 className="text-2xl font-semibold text-gray-900">
        {quiz?.title || 'Quiz'} - Results
      </h2>
      
      <div className="space-y-4">
        {results.length === 0 ? (
          <p className="text-gray-500">No submissions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result) => (
                  <tr key={result._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600">
                            {result.user?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {result.user?.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {result.user?.email || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {result.score} / {quiz?.totalPoints || result.totalPoints}
                      </div>
                      <div className="text-sm text-gray-500">
                        {Math.round((result.score / (quiz?.totalPoints || result.totalPoints)) * 100)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${(result.score / (quiz?.totalPoints || result.totalPoints)) * 100 >= (quiz?.passingScore || 70) 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'}`}>
                        {(result.score / (quiz?.totalPoints || result.totalPoints)) * 100 >= (quiz?.passingScore || 70) ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(result.submittedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/teacher/courses/${slug}/quiz-results/${quizId}/submissions/${result._id}`}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <FileText size={16} /> Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizResultsPage;