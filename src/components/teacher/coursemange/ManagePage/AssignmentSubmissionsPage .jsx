// AssignmentSubmissionsPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Clock, User, Check, X } from 'lucide-react';
import { 
  getAssignmentWithSubmissions,
  gradeAssignment
} from '../../../../api/apis';
import { toast } from 'react-hot-toast';

const AssignmentSubmissionsPage = () => {
  const { slug, assignmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [gradingData, setGradingData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getAssignmentWithSubmissions(assignmentId);
        setAssignment(response.data.data);
        setSubmissions(response.data.data.submissions || []);
        
        // Initialize grading data
        const initialGradingData = {};
        response.data.data.submissions?.forEach(sub => {
          initialGradingData[sub._id] = {
            grade: sub.grade || '',
            feedback: sub.feedback || ''
          };
        });
        setGradingData(initialGradingData);
      } catch (err) {
        console.error('Error:', err);
        toast.error(err.response?.data?.message || 'Failed to load submissions');
        navigate(`/teacher/courses/${slug}/manage`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [assignmentId, slug, navigate]);

  const handleGradeChange = (submissionId, field, value) => {
    setGradingData(prev => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [field]: value
      }
    }));
  };

  const handleSubmitGrade = async (submissionId) => {
    try {
      const { grade, feedback } = gradingData[submissionId];
      
      if (!grade || isNaN(grade)) {
        toast.error('Please enter a valid grade');
        return;
      }

      const response = await gradeAssignment(assignmentId, submissionId, {
        grade: Number(grade),
        feedback
      });
      
      if (response.data.success) {
        toast.success('Grade submitted successfully!');
        // Update local state
        setSubmissions(prev => prev.map(sub => 
          sub._id === submissionId 
            ? { 
                ...sub, 
                grade: Number(grade), 
                feedback,
                gradedAt: new Date().toISOString() 
              }
            : sub
        ));
      } else {
        toast.error(response.data.message || 'Failed to submit grade');
      }
    } catch (error) {
      console.error('Error submitting grade:', error);
      toast.error(error.response?.data?.message || 'Failed to submit grade');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto bg-white border rounded-2xl p-6 shadow space-y-10">
      <button
        onClick={() => navigate(`/teacher/courses/${slug}/manage`)}
        className="text-gray-500 flex items-center gap-1 text-sm hover:underline"
      >
        <ChevronLeft size={16} /> Back to Course
      </button>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Submissions for: {assignment?.title}
        </h2>
        <span className="text-sm text-gray-500">
          {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center p-8 border-2 border-dashed rounded-xl">
          <p className="text-gray-500">No submissions yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map(submission => (
            <div key={submission._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <User size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {submission.student?.name || 'Unknown Student'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {submission.student?.email || 'No email'}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock size={14} />
                  {new Date(submission.submittedAt).toLocaleString()}
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Submitted Work
                  </h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {submission.task || 'No submission content provided'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grade (out of {assignment?.points})
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded-md text-sm"
                      min="0"
                      max={assignment?.points}
                      value={gradingData[submission._id]?.grade || ''}
                      onChange={(e) => 
                        handleGradeChange(submission._id, 'grade', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Feedback
                    </label>
                    <textarea
                      className="w-full p-2 border rounded-md text-sm"
                      rows={2}
                      value={gradingData[submission._id]?.feedback || ''}
                      onChange={(e) => 
                        handleGradeChange(submission._id, 'feedback', e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => handleSubmitGrade(submission._id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 flex items-center gap-1"
                  >
                    <Save size={16} />
                    {submission.gradedAt ? 'Update Grade' : 'Submit Grade'}
                  </button>
                </div>

                {submission.gradedAt && (
                  <div className="mt-2 text-sm text-gray-500">
                    Last graded: {new Date(submission.gradedAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentSubmissionsPage;