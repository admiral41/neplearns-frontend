import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { takeQuiz, submitQuiz, getQuizResult } from '../api/apis';
import { toast } from 'react-hot-toast';
import { FaClock, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

const QuizPlay = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [hasPreviousAttempt, setHasPreviousAttempt] = useState(false);
  const [quizStatus, setQuizStatus] = useState('not_started');
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Check for existing quiz attempt in localStorage
  useEffect(() => {
    const savedQuizState = localStorage.getItem(`quiz_${quizId}`);
    if (savedQuizState) {
      const { status, answers: savedAnswers, startTime, timeLimit } = JSON.parse(savedQuizState);
      
      if (status === 'completed') {
        setHasPreviousAttempt(true);
        setQuizStatus('completed');
        return;
      }

      if (status === 'in_progress') {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        const remainingTime = timeLimit * 60 - elapsedSeconds;
        
        if (remainingTime > 0) {
          // Set minimal quiz data from localStorage
          setQuiz(prev => prev || { 
            _id: quizId,
            timeLimit,
            questions: savedAnswers.map(answer => ({
              _id: answer.questionId,
              options: [] // Will be filled when full quiz data loads
            }))
          });
          setQuizStatus('in_progress');
          setAnswers(savedAnswers);
          setTimeLeft(remainingTime);
          startTimeRef.current = startTime;
          setLoading(false);
          return;
        } else {
          // Time has expired, auto-submit
          handleAutoSubmit(savedAnswers, startTime, timeLimit);
        }
      }
    }
    
    // If no saved state, load quiz from API
    fetchQuizData();
  }, [quizId]);

  // Track if user tries to navigate away
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (quizStatus === 'in_progress') {
        e.preventDefault();
        e.returnValue = 'Your quiz progress will be lost if you leave this page.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [quizStatus]);

  // Fetch quiz data only when needed
  const fetchQuizData = async () => {
    try {
      const res = await takeQuiz(quizId);
      setQuiz(res.data.data);
      
      // Only set initial time if not resuming
      if (quizStatus !== 'in_progress') {
        setTimeLeft(res.data.data.timeLimit * 60);
      }
      
      setLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load quiz');
      navigate(-1);
    }
  };

  // Check if user has already completed this quiz
  useEffect(() => {
    const checkPreviousAttempt = async () => {
      try {
        const result = await getQuizResult(quizId);
        if (result.data.data.submissions.length > 0) {
          setHasPreviousAttempt(true);
          setQuizStatus('completed');
        }
      } catch (error) {
        console.error('Error checking previous attempts:', error);
      }
    };
    
    checkPreviousAttempt();
  }, [quizId]);

  // Timer and auto-submit
  useEffect(() => {
    if (!quiz || quizStatus !== 'in_progress') return;

    const updateTimer = () => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTimeRef.current) / 1000);
      const remainingTime = quiz.timeLimit * 60 - elapsedSeconds;
      
      if (remainingTime <= 0) {
        handleAutoSubmit(answers, startTimeRef.current, quiz.timeLimit);
        return;
      }
      
      setTimeLeft(remainingTime);
    };

    // Update immediately
    updateTimer();
    
    // Then set interval for future updates
    timerRef.current = setInterval(updateTimer, 1000);

    return () => clearInterval(timerRef.current);
  }, [quiz, quizStatus, answers, quizId]);

  const handleAutoSubmit = async (answers, startTime, timeLimit) => {
    try {
      clearInterval(timerRef.current);
      setSubmitted(true);
      
      const res = await submitQuiz(quizId, answers.map(answer => ({
        questionId: answer.questionId,
        selectedOption: answer.selectedOption
      })));
      
      // Mark quiz as completed in localStorage
      localStorage.setItem(`quiz_${quizId}`, JSON.stringify({
        status: 'completed',
        answers,
        startTime,
        timeLimit
      }));
      
      setQuizStatus('completed');
      setHasPreviousAttempt(true);
      
      toast.success(`Quiz auto-submitted! Score: ${res.data.data.score}%`, {
        icon: res.data.data.passed ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-red-500" />
      });

      navigate(`/quiz/${quizId}/results`);
    } catch (error) {
      toast.error('Failed to auto-submit quiz');
      console.error('Auto-submit error:', error);
      setSubmitted(false);
    }
  };

  const startQuiz = () => {
    const now = Date.now();
    startTimeRef.current = now;
    setQuizStatus('in_progress');
    
    // Store minimal quiz data in localStorage
    localStorage.setItem(`quiz_${quizId}`, JSON.stringify({
      status: 'in_progress',
      answers: [],
      startTime: now,
      timeLimit: quiz?.timeLimit || 30 // Default to 30 mins if quiz not loaded yet
    }));
    
    // Only fetch full quiz data if we don't have it
    if (!quiz || !quiz.questions) {
      fetchQuizData();
    }
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    if (quizStatus !== 'in_progress') return;
    
    setAnswers(prev => {
      const existingIndex = prev.findIndex(a => a.questionId === questionId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { questionId, selectedOption: optionIndex };
        return updated;
      }
      return [...prev, { questionId, selectedOption: optionIndex }];
    });
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    if (quizStatus !== 'in_progress' || submitted) return;
    
    try {
      setSubmitted(true);
      clearInterval(timerRef.current);
      
      const res = await submitQuiz(quizId, answers.map(answer => ({
        questionId: answer.questionId,
        selectedOption: answer.selectedOption
      })));
      
      // Mark quiz as completed in localStorage
      localStorage.setItem(`quiz_${quizId}`, JSON.stringify({
        status: 'completed',
        answers,
        startTime: startTimeRef.current,
        timeLimit: quiz.timeLimit
      }));
      
      setQuizStatus('completed');
      
      if (!isAutoSubmit) {
        toast.success(`Quiz submitted! Score: ${res.data.data.score}%`, {
          icon: res.data.data.passed ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-red-500" />
        });
      }

      navigate(`/quiz/${quizId}/results`, {
        state: { 
          submissionData: res.data.data,
          quizData: quiz
        }
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit quiz');
      setSubmitted(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Loading state when resuming quiz
  if (loading && quizStatus === 'in_progress') {
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-6 mt-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resuming Quiz...</h1>
            <p className="text-gray-600">Loading your progress</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <FaSpinner className="animate-spin" />
            <span>Loading timer</span>
          </div>
        </div>

        {[...Array(5)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-4">
            <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
            <div className="space-y-2 pl-8">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Initial loading state
  if (loading && quizStatus === 'not_started') {
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-6 w-64 bg-gray-200 rounded animate-pulse"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-3 p-4 border rounded-lg">
            <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (hasPreviousAttempt || quizStatus === 'completed') {
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-6 mt-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900">{quiz?.title || 'Quiz'}</h1>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <FaCheckCircle className="mx-auto text-green-500 text-4xl mb-4" />
          <h2 className="text-xl font-semibold text-green-800 mb-2">Quiz Completed</h2>
          <p className="text-gray-600 mb-4">You have already completed this quiz.</p>
          <button
            onClick={() => navigate(`/quiz/${quizId}/results`)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
          >
            View Results
          </button>
        </div>
      </div>
    );
  }

  if (quizStatus === 'not_started') {
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-6 mt-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900">{quiz?.title || 'Quiz'}</h1>
        <p className="text-gray-600">{quiz?.description || 'Loading quiz description...'}</p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Quiz Instructions</h2>
          <ul className="text-left space-y-2 mb-6 text-gray-700">
            <li>• You have {quiz?.timeLimit || '--'} minutes to complete the quiz</li>
            <li>• The quiz contains {quiz?.questions?.length || '--'} questions</li>
            <li>• You need {quiz?.passingScore || '--'}% to pass</li>
            <li>• Once started, the timer cannot be paused</li>
            <li>• The quiz will auto-submit when time expires</li>
          </ul>
          <button
            onClick={startQuiz}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
          >
            Start Quiz Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6 mt-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
          <p className="text-gray-600">{quiz.description}</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
          timeLeft < 60 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
        }`}>
          <FaClock />
          <span>{formatTime(timeLeft)} remaining</span>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex items-start gap-2">
          <FaExclamationTriangle className="text-yellow-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-yellow-700">
              <strong>Important:</strong> The quiz will auto-submit when time expires. 
              Navigating away will submit your current answers.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {quiz.questions.map((question, qIndex) => (
          <div key={question._id} className="border rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
              <span className="font-medium text-gray-800">{qIndex + 1}.</span>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-800">{question.question}</h3>
                <span className="text-xs text-gray-500 mt-1">
                  {question.points} point{question.points !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="space-y-2 pl-8">
              {question.options.map((option, oIndex) => {
                const isSelected = answers.some(
                  a => a.questionId === question._id && a.selectedOption === oIndex
                );
                
                return (
                  <button
                    key={oIndex}
                    onClick={() => handleAnswerSelect(question._id, oIndex)}
                    className={`w-full text-left p-3 border rounded-lg transition-colors ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSubmit(false)}
          disabled={submitted}
          className={`px-5 py-2.5 rounded-md font-medium text-white ${
            submitted ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {submitted ? 'Submitting...' : 'Submit Quiz'}
        </button>
      </div>
    </div>
  );
};

export default QuizPlay;