import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/Card";
import { FaFilter, FaChalkboardTeacher, FaStar, FaClock, FaGraduationCap } from "react-icons/fa";
import { Link } from "react-router-dom";
import { BookOpen, List } from 'lucide-react';
import { getAllCoursesWhy, baseURL } from '../api/apis';

const COURSES_PER_PAGE = 6;

const CoursesPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedLevel, setSelectedLevel] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await getAllCoursesWhy();
                setCourses(response.data.data);
            } catch (err) {
                setError('Failed to load courses');
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? course.category === selectedCategory : true;
        const matchesLevel = selectedLevel ? course.level === selectedLevel : true;
        return matchesSearch && matchesCategory && matchesLevel;
    });

    const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);
    const paginatedCourses = filteredCourses.slice(
        (currentPage - 1) * COURSES_PER_PAGE,
        currentPage * COURSES_PER_PAGE
    );

    return (
        <div className="max-w-screen-xl mx-auto px-4 pt-20 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold">Courses</h1>
            </div>

            <div className="flex gap-6">
                {/* Sidebar Filters */}
                <div className="relative mb-8">
                    {showFilters && (
                        <div className="bg-white p-4 rounded-xl shadow-md w-full sm:w-[300px] relative">
                            <button
                                onClick={() => setShowFilters(false)}
                                className="absolute -right-5 top-5 z-10 border border-gray-300 bg-white rounded-full p-2 shadow hover:bg-gray-100 transition"
                            >
                                <FaFilter className="text-gray-600" />
                            </button>

                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                Filters
                            </h2>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <h4 className="font-medium">Category</h4>
                                    <select
                                        className="w-full mt-1 border border-gray-300 rounded-md p-2"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="">All</option>
                                        <option value="Web Development">Web Development</option>
                                        <option value="Programming">Programming</option>
                                        <option value="Design">Design</option>
                                    </select>
                                </div>

                                <div>
                                    <h4 className="font-medium">Level</h4>
                                    <select
                                        className="w-full mt-1 border border-gray-300 rounded-md p-2"
                                        value={selectedLevel}
                                        onChange={(e) => setSelectedLevel(e.target.value)}
                                    >
                                        <option value="">All</option>
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {!showFilters && (
                        <button
                            onClick={() => setShowFilters(true)}
                            className="sticky top-20 z-50 border border-gray-300 bg-white rounded-full p-2 shadow hover:bg-gray-100 transition"
                        >
                            <FaFilter className="text-gray-600" />
                        </button>
                    )}
                </div>

                <div className="flex-1">
                    <div className="mb-6">
                        <Input
                            type="text"
                            placeholder="Search for courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading courses...</div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500">{error}</div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No courses found</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedCourses.map(course => {
                                const totalLessons = course?.lessons?.length || 0;

                                return (
                                    <Link 
                                        to={`/course/${course.slug}`} 
                                        key={course._id} 
                                        className="block group"
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            className="border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                                        >
                                            <div className="relative aspect-video bg-gray-50">
                                                <img
                                                    src={`${baseURL}/${course.image?.replace(/\\/g, '/')}`}
                                                    alt="Course preview"
                                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-102"
                                                />
                                                <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 shadow-sm">
                                                    New
                                                </span>
                                            </div>

                                            <CardContent className="p-5 space-y-4">
                                                <div className="space-y-2">
                                                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
                                                        {course.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 line-clamp-2">
                                                        {course.subtitle}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <FaChalkboardTeacher className="w-4 h-4 text-gray-400" />
                                                    <span className="font-medium text-gray-700">
                                                        {course.teacher?.firstName} {course.teacher?.lastName}
                                                    </span>
                                                </div>

                                                {course.tags?.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {course.tags.map((tag, index) => (
                                                            <span key={index} className="px-2.5 py-1 bg-gray-50 text-gray-600 rounded-md text-xs font-medium border border-gray-100">
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
                                                                <span className="font-medium text-gray-900">${course.price}</span>
                                                                <span className="text-gray-500">Price</span>
                                                            </div>
                                                            <div className="w-px h-4 bg-gray-200" />
                                                            <div className="flex items-center gap-1.5">
                                                                <List className="w-4 h-4 text-gray-400" />
                                                                <span className="font-medium text-gray-900">{totalLessons}</span>
                                                                <span className="text-gray-500">Lessons</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </motion.div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="flex flex-wrap justify-center gap-2 mt-6">
                        {Array.from({ length: totalPages }, (_, index) => (
                            <Button
                                key={index}
                                variant={currentPage === index + 1 ? "default" : "outline"}
                                onClick={() => setCurrentPage(index + 1)}
                            >
                                {index + 1}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoursesPage;