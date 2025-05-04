// Hero.jsx
import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaBook, FaChalkboardTeacher, FaClock, FaGraduationCap, FaLaptopCode, FaStar, FaTools } from "react-icons/fa";
import Slider from "react-slick";
import teacher from "../assets/images/teacher.png";
import bag from "../assets/images/bag.png";
import watch from "../assets/images/watch.png";
import img from "../assets/hero.png"; 
import { getAllCoursesWhy, baseURL } from '../api/apis';
import { BookOpen, List } from 'lucide-react';

const floatAnim = {
    animate: {
        y: [0, -12, 0],
        x: [0, 6, 0],
        transition: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
};
const features = [
    {
        icon: <img src={teacher} alt="Teacher" className="w-10 h-10" />,
        title: "Expert Instructors",
        description: "Learn from industry professionals with years of experience.",
        delay: 0.1,
    },
    {
        icon: <img src={watch} alt="Watch" className="w-8 h-10" />,
        title: "Flexible Learning",
        description: "Study at your own pace, anytime and anywhere.",
        delay: 0.2,
    },
    {
        icon: <img src={bag} alt="Bag" className="w-9 h-10" />,
        title: "Practical Skills",
        description: "Gain hands-on experience with real-world projects.",
        delay: 0.3,
    },
];



const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
        {
            breakpoint: 1024, // tablet
            settings: {
                slidesToShow: 2,
            },
        },
        {
            breakpoint: 640, // mobile
            settings: {
                slidesToShow: 1,
            },
        },
    ],
};

const Home = () => {
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

    return (
        <>
            <section className="w-full pt-28 bg-white overflow-x-hidden">
                <div className="container max-w-screen-xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-10">

                    {/* Left Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="max-w-xl"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            Transform Your <br /> Learning Experience
                        </h1>
                        <p className="text-gray-600 text-lg mb-8">
                            Access quality courses designed to help you master new skills and advance your career.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/register"
                                className="bg-gray-900 text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-800 transition flex items-center gap-2"
                            >
                                Get Started →
                            </Link>
                            <Link
                                to="/course"
                                className="border border-gray-300 text-gray-900 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
                            >
                                Browse Courses
                            </Link>
                        </div>
                    </motion.div>

                    {/* Right Image Placeholder */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className="w-full md:max-w-md h-[400px] bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden"
                    >
                        <img
                            src={img}
                            alt="Hero"
                            className="object-cover w-full h-full"
                        />
                    </motion.div>

                </div>
            </section>
            <section className="w-full py-16 bg-gray-50">
                <div className="container max-w-screen-xl mx-auto px-4 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
                    >
                        Why Choose NepLearn
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-gray-600 text-base md:text-lg mb-10 max-w-2xl mx-auto"
                    >
                        We offer a unique learning experience with features designed to help you succeed.
                    </motion.p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: feature.delay }}
                                className="bg-white p-6 md:p-8 rounded-2xl shadow hover:shadow-lg transition duration-300 text-left"
                            >
                                <div className="mb-3">{feature.icon}</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 text-sm">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
            <section className="w-full py-20 bg-white">
                <div className="container max-w-screen-xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center md:text-left"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                Featured Courses
                            </h2>
                            <p className="text-gray-600 text-base">
                                Explore our comprehensive course catalog
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="mt-4 md:mt-0"
                        >
                            <Link
                                to="/course"
                                className="inline-block px-6 py-2 border border-black text-black font-medium rounded-md hover:bg-black hover:text-white transition duration-300"
                            >
                                View All Courses
                            </Link>
                        </motion.div>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">Loading courses...</div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500">{error}</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => {
                            const totalLessons = course?.lessons?.length || 0;

                            return (
                                <Link to={`/course/${course.slug}`} key={course._id} className="block group">
                                    <div className="border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                                        {/* Course Image */}
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

                                        {/* Course Details */}
                                        <div className="p-5 space-y-4">
                                            {/* Title and Subtitle */}
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
                                                    {course.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 line-clamp-2">
                                                    {course.subtitle}
                                                </p>
                                            </div>

                                            {/* Tags */}
                                            {course.tags?.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {course.tags.map((tag, index) => (
                                                        <span key={index} className="px-2.5 py-1 bg-gray-50 text-gray-600 rounded-md text-xs font-medium border border-gray-100">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Stats */}
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
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>

            <section className="relative py-16 bg-gradient-to-br from-[#0F162B] via-[#121C36] to-[#0F162B] overflow-hidden ">
                {/* Subtle floating icons */}
                <motion.div
                    className="absolute top-10 left-16 w-14 h-14 bg-indigo-500/30 rounded-full blur-2xl z-0"
                    variants={floatAnim}
                    animate="animate"
                />
                <motion.div
                    className="absolute bottom-20 right-12 w-20 h-20 bg-pink-500/20 rounded-full blur-2xl z-0"
                    variants={floatAnim}
                    animate="animate"
                    transition={{ delay: 1 }}
                />
                <motion.div
                    className="absolute top-1/3 right-1/4 w-10 h-10 bg-yellow-300/20 rounded-full blur-xl z-0"
                    variants={floatAnim}
                    animate="animate"
                    transition={{ delay: 2 }}
                />

                {/* CTA Content */}
                <div className="relative z-10 container max-w-screen-xl mx-auto px-4 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-3xl md:text-4xl font-bold text-white mb-3"
                    >
                        Ready to Start Your Learning Journey?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-gray-300 text-lg mb-6 max-w-xl mx-auto"
                    >
                        Join thousands of learners building their futures with NepLearn.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Link
                            to="/register"
                            className="inline-block px-8 py-3 border border-white text-white font-medium rounded-md hover:bg-white hover:text-[#0F162B] transition duration-300"
                        >
                            Join Now
                        </Link>
                    </motion.div>
                </div>
            </section>
        </>



    );
};

export default Home;
