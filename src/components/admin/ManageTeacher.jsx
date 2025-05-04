import React, { useEffect, useState } from 'react';
import { getTeachers, approveTeacher } from '../../api/apis';

const ManageTeacher = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalTeachers: 0
    });
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchTeachers = async (page = 1, limit = 10) => {
        try {
            setLoading(true);
            const response = await getTeachers(page, limit);
            setTeachers(response.data.data);
            if (response.data.pagination) {
                setPagination(response.data.pagination);
            }
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch teachers');
            setLoading(false);
        }
    };

    const handleApprove = async (teacherId) => {
        try {
            await approveTeacher(teacherId);
            fetchTeachers(pagination.currentPage, itemsPerPage);
        } catch (err) {
            setError('Failed to approve teacher');
        }
    };

    useEffect(() => {
        fetchTeachers(pagination.currentPage, itemsPerPage);
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
                <h1 className="text-2xl font-bold">Manage Teachers</h1>
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

            {teachers.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-lg">No teachers registered yet</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">SN</th>
                                <th className="py-2 px-4 border-b">Username</th>
                                <th className="py-2 px-4 border-b">Email</th>
                                <th className="py-2 px-4 border-b">Status</th>
                                <th className="py-2 px-4 border-b">Enrolled Courses</th>
                                <th className="py-2 px-4 border-b">Joined Date</th>
                                <th className="py-2 px-4 border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.map((teacher, index) => (
                                <tr key={teacher._id}>
                                    <td className="py-2 px-4 border-b">
                                        {(pagination.currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="py-2 px-4 border-b">{teacher.username}</td>
                                    <td className="py-2 px-4 border-b">{teacher.email}</td>
                                    <td className="py-2 px-4 border-b">
                                        <span className={`px-2 py-1 rounded text-sm ${teacher.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {teacher.isApproved ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        {teacher.enrolledCourses?.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {teacher.enrolledCourses.map(course => (
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
                                        {new Date(teacher.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        {!teacher.isApproved && (
                                            <button
                                                onClick={() => handleApprove(teacher._id)}
                                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                            >
                                                Approve
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}

                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    <div className="flex justify-between items-center mt-4">
                        <div className="text-gray-600">
                            Showing {(pagination.currentPage - 1) * itemsPerPage + 1} to
                            {Math.min(pagination.currentPage * itemsPerPage, pagination.totalTeachers)} of
                            {pagination.totalTeachers} teachers
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

export default ManageTeacher;