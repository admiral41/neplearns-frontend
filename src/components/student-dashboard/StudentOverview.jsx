import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getMyCourses,baseURL } from '../../api/apis';
import { Link } from 'react-router-dom';

const StudentOverview = () => {
  const [courses, setCourses] = useState({
    approved: [],
    pending: []
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await getMyCourses();

        // Filter out rejected courses if needed
        const approvedCourses = response.data.data.approvedCourses || [];
        const pendingCourses = response.data.data.pendingCourses || [];

        setCourses({
          approved: approvedCourses,
          pending: pendingCourses.filter(course =>
            course.enrollmentStatus !== 'rejected'
          )
        });
      } catch (error) {
        toast.error('Failed to fetch courses');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="max-w-screen-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Courses</h3>
          <p className="text-3xl font-bold text-indigo-600">
            {courses.approved.length + courses.pending.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Enrolled Courses</h3>
          <p className="text-3xl font-bold text-green-600">
            {courses.approved.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Pending Requests</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {courses.pending.length}
          </p>
        </div>
      </div>

      {/* Enrolled Courses Section */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Enrolled Courses</h2>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : courses.approved.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {courses.approved.map((course) => (
              <div key={course._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden">
                    <img
                      className="h-full w-full object-cover"
                      src={`${baseURL}/${course.image?.replace(/\\/g, '/')}`}
                      alt={course.title}
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-indigo-600">
                        <Link to={`/course/${course.slug}`}>{course.title}</Link>
                      </h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Enrolled
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span>By {course.teacher.username}</span>
                      <span className="mx-2">•</span>
                      <span>${course.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">You haven't enrolled in any courses yet</p>
            <Link
              to="/course"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Browse Courses
            </Link>
          </div>
        )}
      </div>

      {/* Pending Courses Section */}
      {courses.pending.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Pending Enrollment Requests</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {courses.pending.map((course) => (
              <div key={course._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden">
                    <img
                      className="h-full w-full object-cover"
                      src={`${baseURL}/${course.image?.replace(/\\/g, '/')}`}
                      alt={course.title}
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        Pending Approval
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span>By {course.teacher.username}</span>
                      <span className="mx-2">•</span>
                      <span>${course.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentOverview;