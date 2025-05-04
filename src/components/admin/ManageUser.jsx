import React, { useEffect, useState } from 'react';
import { getStudents } from '../../api/apis';

const ManageUser = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalStudents: 0
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchStudents = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await getStudents(page, limit);
      setStudents(response.data.data);
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch students');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(pagination.currentPage, itemsPerPage);
  }, [pagination.currentPage, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Students</h1>
        <div className="flex items-center gap-4">
          <select 
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setPagination(prev => ({ ...prev, currentPage: 1 }));
            }}
            className="border rounded px-2 py-1"
          >
            {[10, 20, 50].map(size => (
              <option key={size} value={size}>Show {size}</option>
            ))}
          </select>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No students registered yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">SN</th>
                <th className="py-2 px-4 border-b">Username</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Enrolled Courses</th>
                <th className="py-2 px-4 border-b">Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student._id}>
                  <td className="py-2 px-4 border-b">
                    {(pagination.currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="py-2 px-4 border-b">{student.username}</td>
                  <td className="py-2 px-4 border-b">{student.email}</td>
                  <td className="py-2 px-4 border-b">
                    {student.enrolledCourses?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {student.enrolledCourses.map(course => (
                          <span 
                            key={course._id}
                            className="bg-gray-100 px-2 py-1 rounded text-sm"
                          >
                            {course.name}
                          </span>
                        ))}
                      </div>
                    ) : 'None'}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-gray-600">
              Showing {(pagination.currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(pagination.currentPage * itemsPerPage, pagination.totalStudents)} of{' '}
              {pagination.totalStudents} students
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUser;
