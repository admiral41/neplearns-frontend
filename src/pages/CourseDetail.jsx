import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link } from 'react-router-dom';
import { baseURL, getCourseBySlug } from '../api/apis';
import { FaBookOpen, FaClock, FaUserGraduate, FaRegFileAlt, FaQuestionCircle } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const CourseDetail = () => {
  const [activeTab, setActiveTab] = useState('about');
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { slug } = useParams();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await getCourseBySlug(slug);
        setCourse(response?.data?.data || null);
      } catch (error) {
        console.error("Error fetching course:", error);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [slug]);

  const toggleLesson = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  if (!course && !loading) return <div className="w-full text-center py-16 text-gray-600">Course not found</div>;

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Course Banner */}
      <div className="relative h-96 mt-16">
        <div className="absolute inset-0 bg-black/40 z-10" />
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
              {loading ? <Skeleton count={2} className="mx-auto" /> : course?.shortDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('about')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'about'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'curriculum'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Curriculum
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode='wait'>
          {activeTab === 'about' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructor</h3>
                <div className="flex items-center gap-4">
                  {loading ? (
                    <Skeleton circle width={64} height={64} />
                  ) : (
                    course?.teacher?.profilePicture && (
                      <img
                        src={`${baseURL}/${course.teacher.profilePicture}`}
                        className="w-16 h-16 rounded-full object-cover"
                        alt="Instructor"
                      />
                    )
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {loading ? (
                        <Skeleton width={120} />
                      ) : (
                        `${course?.teacher?.firstName || ''} ${course?.teacher?.lastName || ''}`
                      )}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {loading ? <Skeleton width={200} /> : course?.teacher?.bio}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                  loading={loading}
                  icon={<FaBookOpen className="w-6 h-6 text-indigo-600" />}
                  label="Lessons"
                  value={course?.lessons?.length}
                />
                <StatCard
                  loading={loading}
                  icon={<FaClock className="w-6 h-6 text-emerald-600" />}
                  label="Duration"
                  value={course?.duration ? `${course.duration} Hours` : '-'}
                />
                <StatCard
                  loading={loading}
                  icon={<FaUserGraduate className="w-6 h-6 text-amber-600" />}
                  label="Students"
                  value={course?.enrolledStudents?.length}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Course Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FeatureItem
                    icon={<FaRegFileAlt className="w-5 h-5 text-indigo-600" />}
                    text="Practical Assignments"
                  />
                  <FeatureItem
                    icon={<FaQuestionCircle className="w-5 h-5 text-indigo-600" />}
                    text="Interactive Quizzes"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'curriculum' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} height={72} className="rounded-lg" />
                ))
              ) : course?.lessons?.length > 0 ? (
                course.lessons.map((lesson, index) => (
                  <motion.div
                    key={lesson._id}
                    className="border rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleLesson(index)}
                      className="w-full px-4 py-3 hover:bg-gray-50 flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          {index + 1}
                        </div>
                        <span className="text-gray-900">{lesson.title}</span>
                      </div>
                      <span className="text-gray-400">
                        {expandedIndex === index ? '-' : '+'}
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {expandedIndex === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-4 pb-4"
                        >
                          <div className="pt-4 border-t">
                            <p className="text-gray-600 mb-4">{lesson.description}</p>
                            <div className="flex flex-wrap gap-2">
                              <Link
                                to={`/course/${slug}/lessons/${lesson._id}`}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm flex items-center gap-2"
                              >
                                <FaBookOpen className="w-4 h-4" />
                                Start Lesson
                              </Link>
                              {lesson.quizzes?.length > 0 && (
                                <span className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-md text-sm flex items-center gap-1">
                                  <FaQuestionCircle className="w-4 h-4" />
                                  {lesson.quizzes.length} Quiz{lesson.quizzes.length > 1 ? 'zes' : ''}
                                </span>
                              )}
                              {lesson.assignments?.length > 0 && (
                                <span className="px-3 py-2 bg-amber-50 text-amber-700 rounded-md text-sm flex items-center gap-1">
                                  <FaRegFileAlt className="w-4 h-4" />
                                  {lesson.assignments.length} Assignment{lesson.assignments.length > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No lessons available for this course
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const StatCard = ({ loading, icon, label, value }) => (
  <div className="bg-white p-4 rounded-lg border">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-indigo-50 rounded-lg">{icon}</div>
      <div>
        <div className="text-sm text-gray-600">{label}</div>
        <div className="text-xl font-semibold text-gray-900">
          {loading ? <Skeleton width={40} /> : value ?? '-'}
        </div>
      </div>
    </div>
  </div>
);

const FeatureItem = ({ icon, text }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
    {icon}
    <span className="text-gray-700">{text}</span>
  </div>
);

export default CourseDetail;