import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllCoursesWhy, deleteCourse } from '../../api/apis';
import { baseURL } from '../../api/apis';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 10;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getAllCoursesWhy();
        setCourses(response.data.data);
      } catch (err) {
        setError('Failed to load courses');
        alert('Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourse(courseId);
        setCourses(courses.filter(course => course._id !== courseId));
        alert('Course deleted successfully');
      } catch (err) {
        alert('Failed to delete course');
      }
    }
  };

  // Filter courses based on search term
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.teacher?.username && course.teacher.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination logic
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Course Management</h1>
        <Link 
          to="/admin/courses/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
        >
          <span className="mr-2">+</span> Add New Course
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search courses..."
            className="w-full p-2 pl-10 border rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2">🔍</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No courses found</p>
          <Link 
            to="/admin/courses/new" 
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Create your first course
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 border text-left">Image</th>
                  <th className="py-3 px-4 border text-left">Title</th>
                  <th className="py-3 px-4 border text-left">Instructor</th>
                  <th className="py-3 px-4 border text-left">Price</th>
                  <th className="py-3 px-4 border text-left">Students</th>
                  <th className="py-3 px-4 border text-left">Status</th>
                  <th className="py-3 px-4 border text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCourses.map(course => (
                  <tr key={course._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border">
                      <div className="w-16 h-10 rounded-md overflow-hidden">
                        <img
                          src={`${baseURL}/${course.image?.replace(/\\/g, '/')}`}
                          alt="Course thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 border">
                      <div>
                        <div className="font-medium">{course.title}</div>
                        <div className="text-sm text-gray-500">{course.subtitle}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 border">
                      {course.teacher?.username || 'Unknown'}
                    </td>
                    <td className="py-3 px-4 border">${course.price}</td>
                    <td className="py-3 px-4 border">
                      {course.enrolledStudents?.length || 0}
                    </td>
                    <td className="py-3 px-4 border">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        course.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {course.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 border">
                      <div className="flex space-x-2">
                        <Link
                          to={`/course/${course.slug}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View
                        </Link>
                        {/* <Link
                          to={`/admin/courses/edit/${course._id}`}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(course._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded ${
                      currentPage === page ? 'bg-blue-600 text-white' : ''
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CoursesPage;