import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, List, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { CardContent } from "../ui/Card";
import { Button } from "../ui/button";
import { getMyCourses, baseURL } from "../../api/apis";
import { toast } from "react-hot-toast";

const YourCoursesPage = () => {
    const [courses, setCourses] = useState({
        approved: [],
        pending: [],
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("enrolled");

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const response = await getMyCourses();
                setCourses({
                    approved: response.data.data.approvedCourses || [],
                    pending: response.data.data.pendingCourses || [],
                });
            } catch (error) {
                toast.error("Failed to fetch your courses");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    return (
        <div className="max-w-screen-7xl mx-auto px-4 pt-8 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold">Your Courses</h1>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 w-full sm:w-auto">
                    <button
                        onClick={() => setActiveTab("enrolled")}
                        className={`py-2 px-4 font-medium text-sm ${activeTab === "enrolled"
                                ? "border-b-2 border-indigo-500 text-indigo-600"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Enrolled Courses ({courses.approved.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("pending")}
                        className={`py-2 px-4 font-medium text-sm ${activeTab === "pending"
                                ? "border-b-2 border-indigo-500 text-indigo-600"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Pending Requests ({courses.pending.length})
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-8 text-gray-500">Loading your courses...</div>
            ) : (
                <>
                    {/* Enrolled Courses */}
                    {activeTab === "enrolled" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.approved.length > 0 ? (
                                courses.approved.map((course) => {
                                    const totalLessons = course?.lessons?.length || 0;
                                    const completedLessons = 0; // Replace with actual progress tracking

                                    return (
                                        <Link
                                            key={course._id}
                                            to={`/course/${course.slug}`}
                                            className="block group"
                                        >
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                className="border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                                            >
                                                <div className="relative aspect-video bg-gray-50">
                                                    <img
                                                    src={`${baseURL}/${course.image?.replace(/\\/g, '/')}`}
                                                        alt={course.title}
                                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-102"
                                                    />
                                                    <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 shadow-sm">
                                                        Enrolled
                                                    </span>
                                                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-200">
                                                        <div
                                                            className="h-full bg-indigo-600"
                                                            style={{
                                                                width: `${totalLessons
                                                                        ? Math.round((completedLessons / totalLessons) * 100)
                                                                        : 0
                                                                    }%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <CardContent className="p-5 space-y-4">
                                                    <div className="space-y-2">
                                                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
                                                            {course.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 line-clamp-2">
                                                            {course.subtitle ||
                                                                course.description?.substring(0, 100) ||
                                                                "No description available."}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <span className="font-medium text-gray-700">
                                                            {course.teacher?.username || "Unknown Teacher"}
                                                        </span>
                                                    </div>

                                                    {course.tags?.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {course.tags.map((tag, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="px-2.5 py-1 bg-gray-50 text-gray-600 rounded-md text-xs font-medium border border-gray-100"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="pt-3 border-t border-gray-100">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <div className="flex items-center gap-4 text-gray-600">
                                                                <div className="flex items-center gap-1.5">
                                                                    <BookOpen className="w-4 h-4 text-gray-400" />
                                                                    <span className="font-medium text-gray-900">
                                                                        {completedLessons}/{totalLessons}
                                                                    </span>
                                                                    <span className="text-gray-500">Lessons</span>
                                                                </div>
                                                                <div className="w-px h-4 bg-gray-200" />
                                                                <div className="flex items-center gap-1.5">
                                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                                    <span className="text-gray-500">Active</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </motion.div>
                                        </Link>
                                    );
                                })
                            ) : (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet</p>
                                    <Link
                                        to="/courses"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        Browse Courses
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pending Courses */}
                    {activeTab === "pending" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.pending.length > 0 ? (
                                courses.pending.map((course) => (
                                    <div
                                        key={course._id}
                                        className="border border-gray-100 rounded-xl bg-white shadow-sm overflow-hidden"
                                    >
                                        <div className="relative aspect-video bg-gray-50">
                                            <img
                                                src={`${baseURL}/${course.image?.replace(/\\/g, '/')}`}
                                                alt={course.title}
                                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-102"
                                            />
                                            <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 shadow-sm">
                                                Pending
                                            </span>
                                        </div>

                                        <CardContent className="p-5 space-y-4">
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
                                                    {course.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 line-clamp-2">
                                                    {course.subtitle ||
                                                        course.description?.substring(0, 100) ||
                                                        "No description available."}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <span className="font-medium text-gray-700">
                                                    {course.teacher?.username || "Unknown Teacher"}
                                                </span>
                                            </div>

                                            {course.tags?.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {course.tags.map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-2.5 py-1 bg-gray-50 text-gray-600 rounded-md text-xs font-medium border border-gray-100"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="pt-3 border-t border-gray-100">
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-4 text-gray-600">
                                                        <div className="flex items-center gap-1.5">
                                                            <BookOpen className="w-4 h-4 text-gray-400" />
                                                            <span className="font-medium text-gray-900">${course.price || "0"}</span>
                                                            <span className="text-gray-500">Price</span>
                                                        </div>
                                                        <div className="w-px h-4 bg-gray-200" />
                                                        <div className="flex items-center gap-1.5">
                                                            <List className="w-4 h-4 text-gray-400" />
                                                            <span className="text-gray-500">
                                                                {course.lessons?.length || 0} Lessons
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-gray-500">No pending course requests</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default YourCoursesPage;