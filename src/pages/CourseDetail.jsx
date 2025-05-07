import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link, useNavigate } from 'react-router-dom';
import { baseURL, getCourseBySlug, enrollInCourse } from '../api/apis';
import {
  FaBookOpen,
  FaClock,
  FaUserGraduate,
  FaRegFileAlt,
  FaQuestionCircle,
  FaLock,
  FaCheckCircle,
  FaStar,
  FaChevronDown,
  FaChevronUp,
  FaHourglassHalf,
  FaTimesCircle
} from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const CourseDetail = () => {
  const [activeTab, setActiveTab] = useState('about');
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null); // null, 'pending', 'approved', 'rejected'
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await getCourseBySlug(slug);
        setCourse(response?.data?.data || null);

        // Check user's enrollment status
        if (user) {
          // Check if enrolled
          const isEnrolled = response?.data?.data?.enrolledStudents?.some(
            student => student.student.toString() === user.id
          );

          // Check if has pending request
          const hasPendingRequest = response?.data?.data?.enrollmentRequests?.some(
            request => request.student.toString() === user.id && request.status === 'pending'
          );

          // Check if has rejected request
          const hasRejectedRequest = response?.data?.data?.enrollmentRequests?.some(
            request => request.student.toString() === user.id && request.status === 'rejected'
          );

          if (isEnrolled) {
            setEnrollmentStatus('approved');
          } else if (hasPendingRequest) {
            setEnrollmentStatus('pending');
          } else if (hasRejectedRequest) {
            setEnrollmentStatus('rejected');
          }
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [slug, user]);

  const handleEnroll = async () => {
    if (!user) {
      toast.error('Please login to enroll in this course');
      navigate('/login', { state: { from: `/course/${slug}` } });
      return;
    }

    try {
      setEnrolling(true);
      await enrollInCourse(course._id);
      setEnrollmentStatus('pending');
      toast.success('Enrollment request submitted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const toggleLesson = (index) => {
    if (enrollmentStatus !== 'approved') {
      toast('Please wait for your enrollment to be approved to access lessons', { icon: '🔒' });
      return;
    }
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  if (!course && !loading) return (
    <div className="w-full text-center py-16 text-gray-600">
      <h2 className="text-2xl font-medium">Course not found</h2>
      <p className="mt-2">The course you're looking for doesn't exist or may have been removed.</p>
      <Link
        to="/courses"
        className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
      >
        Browse Courses
      </Link>
    </div>
  );

  const renderEnrollmentStatus = () => {
    switch (enrollmentStatus) {
      case 'approved':
        return (
          <>
            <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-green-100/20 backdrop-blur rounded-full">
              <FaCheckCircle className="text-green-300" />
              <span className="text-green-100 font-medium">You're enrolled in this course</span>
            </div>
            <Link
              to={`/course/${slug}/lessons/${course.lessons?.[0]?._id}`}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium text-white transition-colors flex items-center gap-2"
            >
              Continue Learning
            </Link>
          </>
        );
      case 'pending':
        return (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-yellow-100/20 backdrop-blur rounded-full">
              <FaHourglassHalf className="text-yellow-300" />
              <span className="text-yellow-100 font-medium">Enrollment pending approval</span>
            </div>
            <button
              className="px-8 py-3 bg-gray-500 rounded-lg font-medium text-white cursor-not-allowed flex items-center gap-2"
              disabled
            >
              Waiting for Approval
            </button>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-red-100/20 backdrop-blur rounded-full">
              <FaTimesCircle className="text-red-300" />
              <span className="text-red-100 font-medium">Enrollment request rejected</span>
            </div>
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className={`px-8 py-3 rounded-lg font-medium text-white transition-colors flex items-center gap-2 ${enrolling ? 'bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
            >
              {enrolling ? 'Reapplying...' : 'Reapply for Enrollment'}
            </button>
          </div>
        );
      default:
        return (
          <>
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className={`px-8 py-3 rounded-lg font-medium text-white transition-colors flex items-center gap-2 ${enrolling ? 'bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
            >
              {enrolling ? (
                'Enrolling...'
              ) : (
                <>
                  <span>Enroll Now</span>
                  <span className="text-indigo-100">• ${course.price}</span>
                </>
              )}
            </button>
            <p className="mt-3 text-indigo-100 flex items-center gap-2">
              <FaStar className="text-yellow-300" />
              <span>{course.rating || '4.8'} rating ({course.reviewsCount || 120} reviews)</span>
            </p>
          </>
        );
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Course Banner */}
      <div className="relative h-96 mt-16">
        <div className={`absolute inset-0 z-10 ${enrollmentStatus === 'approved' ? 'bg-black/30' : 'bg-black/50'}`} />
        {loading ? (
          <Skeleton className="absolute inset-0 w-full h-full" />
        ) : (
          course?.image && (
            <img
              src={`${baseURL}/${course.image}`}
              alt="Course banner"
              className="w-full h-full object-cover absolute inset-0"
            />
          )
        )}

        <div className="relative z-20 h-full flex items-center justify-center">
          <div className="max-w-4xl w-full px-4 text-center text-white">
            <div className="mb-4 flex justify-center gap-2">
              {loading ? (
                <>
                  <Skeleton width={80} height={24} className="rounded-full" />
                  <Skeleton width={80} height={24} className="rounded-full" />
                </>
              ) : (
                course?.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/10 rounded-full text-sm backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {loading ? <Skeleton width="70%" className="mx-auto" /> : course?.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
              {loading ? <Skeleton count={2} className="mx-auto" /> : course?.subtitle}
            </p>

            {!loading && (
              <div className="mt-6 flex flex-col items-center">
                {renderEnrollmentStatus()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('about')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'about'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  About
                </button>
                <button
                  onClick={() => setActiveTab('curriculum')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'curriculum'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Curriculum
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reviews'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Reviews
                </button>
              </div>
            </div>

            <AnimatePresence mode='wait'>
              {activeTab === 'about' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
                    <div className="prose max-w-none text-gray-700">
                      {loading ? (
                        <Skeleton count={6} />
                      ) : (
                        course?.description?.split('\n').map((paragraph, i) => (
                          <p key={i} className="mb-4">{paragraph}</p>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">What you'll learn</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {loading ? (
                        Array(4).fill(0).map((_, i) => (
                          <Skeleton key={i} height={24} />
                        ))
                      ) : (
                        course?.learningOutcomes?.map((outcome, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span className="text-gray-700">{outcome}</span>
                          </div>
                        )) || (
                          <div className="text-gray-500">No learning outcomes specified</div>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      {loading ? (
                        Array(3).fill(0).map((_, i) => (
                          <li key={i}><Skeleton width="80%" /></li>
                        ))
                      ) : (
                        course?.requirements?.length > 0 ? (
                          course.requirements.map((req, i) => (
                            <li key={i}>{req}</li>
                          ))
                        ) : (
                          <li>No specific requirements</li>
                        )
                      )}
                    </ul>
                  </div>
                </motion.div>
              )}

              {activeTab === 'curriculum' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Curriculum
                    </h3>
                    <div className="text-sm text-gray-600">
                      {loading ? (
                        <Skeleton width={100} />
                      ) : (
                        `${course?.lessons?.length || 0} lessons • ${course?.duration || 'N/A'} hours`
                      )}
                    </div>
                  </div>

                  {enrollmentStatus !== 'approved' && (
                    <div className={`p-4 rounded-lg ${enrollmentStatus === 'pending' ?
                        'bg-yellow-50 border border-yellow-100' :
                        'bg-indigo-50 border border-indigo-100'
                      }`}>
                      <div className="flex items-start gap-3">
                        <FaLock className={`mt-0.5 flex-shrink-0 ${enrollmentStatus === 'pending' ? 'text-yellow-600' : 'text-indigo-600'
                          }`} />
                        <div>
                          <h4 className={`font-medium ${enrollmentStatus === 'pending' ? 'text-yellow-800' : 'text-indigo-800'
                            }`}>
                            {enrollmentStatus === 'pending' ?
                              'Enrollment pending approval' :
                              'This content is locked'}
                          </h4>
                          <p className={`text-sm mt-1 ${enrollmentStatus === 'pending' ? 'text-yellow-700' : 'text-indigo-700'
                            }`}>
                            {enrollmentStatus === 'pending' ?
                              'You will be able to access the course content once your enrollment is approved.' :
                              'Enroll in this course to access all lessons, quizzes, and assignments.'}
                          </p>
                          {enrollmentStatus !== 'pending' && (
                            <button
                              onClick={handleEnroll}
                              disabled={enrolling}
                              className={`mt-3 px-4 py-2 ${enrollmentStatus === 'rejected' ?
                                  'bg-red-600 hover:bg-red-700' :
                                  'bg-indigo-600 hover:bg-indigo-700'
                                } text-white text-sm font-medium rounded-md transition-colors disabled:opacity-70`}
                            >
                              {enrolling ? 'Enrolling...' : 'Enroll Now'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <Skeleton key={i} height={72} className="rounded-lg" />
                    ))
                  ) : course?.lessons?.length > 0 ? (
                    <div className="border rounded-lg divide-y">
                      {course.lessons.map((lesson, index) => (
                        <div
                          key={lesson._id}
                          className={`${enrollmentStatus !== 'approved' ? 'bg-gray-50' : ''}`}
                        >
                          <button
                            onClick={() => toggleLesson(index)}
                            className={`w-full px-5 py-4 flex justify-between items-center text-left ${enrollmentStatus === 'approved' ? 'hover:bg-gray-50' : 'cursor-not-allowed'
                              }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-md flex items-center justify-center ${enrollmentStatus === 'approved' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-200 text-gray-500'
                                }`}>
                                {index + 1}
                              </div>
                              <div>
                                <h4 className={`font-medium ${enrollmentStatus === 'approved' ? 'text-gray-900' : 'text-gray-600'
                                  }`}>
                                  {lesson.title}
                                </h4>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs text-gray-500">
                                    {lesson.duration || '15'} min
                                  </span>
                                  {enrollmentStatus !== 'approved' && (
                                    <span className="text-xs flex items-center gap-1 text-gray-500">
                                      <FaLock size={10} /> Locked
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <span className="text-gray-400">
                              {expandedIndex === index ? <FaChevronUp /> : <FaChevronDown />}
                            </span>
                          </button>

                          <AnimatePresence initial={false}>
                            {expandedIndex === index && enrollmentStatus === 'approved' && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="px-5 pb-4"
                              >
                                <div className="pl-14 pt-2">
                                  <p className="text-gray-600 mb-4">{lesson.description}</p>
                                  <div className="flex flex-wrap gap-3">
                                    <Link
                                      to={`/course/${slug}/lessons/${lesson._id}`}
                                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm flex items-center gap-2"
                                    >
                                      <FaBookOpen className="w-4 h-4" />
                                      Start Lesson
                                    </Link>
                                    {lesson.quizzes?.length > 0 && (
                                      <Link
                                        to={`/course/${slug}/lessons/${lesson._id}/quizzes`}
                                        className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-md text-sm flex items-center gap-2"
                                      >
                                        <FaQuestionCircle className="w-4 h-4" />
                                        {lesson.quizzes.length} Quiz{lesson.quizzes.length > 1 ? 'zes' : ''}
                                      </Link>
                                    )}
                                    {lesson.assignments?.length > 0 && (
                                      <Link
                                        to={`/course/${slug}/lessons/${lesson._id}/assignments`}
                                        className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-md text-sm flex items-center gap-2"
                                      >
                                        <FaRegFileAlt className="w-4 h-4" />
                                        {lesson.assignments.length} Assignment{lesson.assignments.length > 1 ? 's' : ''}
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 border rounded-lg">
                      No lessons available for this course
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">Reviews</h3>
                    <div className="flex items-center gap-2">
                      <FaStar className="text-yellow-400" />
                      <span className="font-medium">
                        {loading ? <Skeleton width={30} /> : course?.rating || '4.8'}
                      </span>
                      <span className="text-gray-500">
                        ({loading ? <Skeleton width={30} /> : course?.reviewsCount || '120'} reviews)
                      </span>
                    </div>
                  </div>

                  {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <Skeleton height={120} />
                      </div>
                    ))
                  ) : (
                    <div className="space-y-4">
                      {course?.reviews?.length > 0 ? (
                        course.reviews.map(review => (
                          <div key={review._id} className="border rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <img
                                src={review.user.avatar || '/default-avatar.png'}
                                alt={review.user.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div>
                                <h4 className="font-medium">{review.user.name}</h4>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <FaStar
                                      key={i}
                                      className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                            <p className="text-sm text-gray-500 mt-2">
                              {new Date(review.date).toLocaleDateString()}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500 border rounded-lg">
                          No reviews yet for this course
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3 space-y-6">
            <div className="sticky top-6 space-y-6">
              {/* Course Card */}
              <div className="border rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                  <Skeleton height={200} />
                ) : (
                  course?.image && (
                    <img
                      src={`${baseURL}/${course.image}`}
                      alt="Course thumbnail"
                      className="w-full h-48 object-cover"
                    />
                  )
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Course Details</h3>
                    {enrollmentStatus === 'approved' && (
                      <span className="px-2.5 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Enrolled
                      </span>
                    )}
                    {enrollmentStatus === 'pending' && (
                      <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        Pending
                      </span>
                    )}
                    {enrollmentStatus === 'rejected' && (
                      <span className="px-2.5 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        Rejected
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">
                        {loading ? <Skeleton width={50} /> : `$${course?.price}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Lessons:</span>
                      <span className="font-medium">
                        {loading ? <Skeleton width={50} /> : course?.lessons?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">
                        {loading ? <Skeleton width={50} /> : course?.duration || 'N/A'} hours
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Level:</span>
                      <span className="font-medium">
                        {loading ? <Skeleton width={50} /> : course?.level || 'All Levels'}
                      </span>
                    </div>
                  </div>

                  {!loading && (
                    <button
                      onClick={enrollmentStatus === 'approved' ?
                        () => navigate(`/course/${slug}/lessons/${course.lessons?.[0]?._id}`) :
                        handleEnroll
                      }
                      disabled={enrolling || enrollmentStatus === 'pending'}
                      className={`w-full mt-6 py-3 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2 ${enrollmentStatus === 'approved' ?
                          'bg-green-600 hover:bg-green-700' :
                          enrollmentStatus === 'pending' ?
                            'bg-gray-500 cursor-not-allowed' :
                            enrollmentStatus === 'rejected' ?
                              'bg-red-600 hover:bg-red-700' :
                              (enrolling ? 'bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700')
                        }`}
                    >
                      {enrollmentStatus === 'approved' ? (
                        'Continue Learning'
                      ) : enrollmentStatus === 'pending' ? (
                        'Pending Approval'
                      ) : enrolling ? (
                        'Enrolling...'
                      ) : enrollmentStatus === 'rejected' ? (
                        'Reapply for Enrollment'
                      ) : (
                        <>
                          <span>Enroll Now</span>
                          <span className="text-indigo-100">• ${course.price}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Instructor Card */}
              <div className="border rounded-xl shadow-sm p-5">
                <h3 className="text-xl font-semibold mb-4">Instructor</h3>
                {loading ? (
                  <div className="flex items-center gap-4">
                    <Skeleton circle width={64} height={64} />
                    <div className="space-y-2">
                      <Skeleton width={120} />
                      <Skeleton width={80} />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        course?.teacher?.profilePicture
                          ? `${baseURL}/${course.teacher.profilePicture}`
                          : 'https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png'
                      }
                      className="w-16 h-16 rounded-full object-cover"
                      alt="Instructor"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {course?.teacher?.username} {course?.teacher?.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {course?.teacher?.title || 'Course Instructor'}
                      </p>
                    </div>
                  </div>

                )}
                {!loading && (
                  <>
                    <p className="mt-4 text-gray-700 text-sm">
                      {course?.teacher?.bio || 'No bio available'}
                    </p>
                    {/* <button className="w-full mt-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      View Profile
                    </button> */}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;