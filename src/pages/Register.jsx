import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { registerStudent, registerTeacher } from "../api/apis";
import { useState } from "react";

const roles = ["Student", "Teacher"];

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "Student"
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (role) => {
        setFormData({ ...formData, role });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.role === "Student") {
                await registerStudent(formData);
            } else {
                await registerTeacher(formData);
            }

            toast.success("Registration successful! Please login.");
            navigate("/login");
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <section className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full"
            >
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-1">Create an Account</h2>
                <p className="text-center text-gray-500 mb-6">Join us and start learning today</p>

                {/* Role Tabs */}
                <div className="flex mb-6 border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
                    {roles.map((role) => (
                        <button
                            key={role}
                            type="button"
                            onClick={() => handleRoleChange(role)}
                            className={`
                                w-1/2 py-2 text-sm font-medium transition-all duration-200
                                ${formData.role === role
                                    ? "bg-white text-gray-900 shadow-inner border-b-2 border-indigo-500"
                                    : "text-gray-500 hover:text-gray-700"}
                            `}
                        >
                            {role}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            name="username"
                            placeholder="john_doe"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-semibold transition"
                    >
                        Register as {formData.role}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{" "}
                    <Link to="/login" className="text-indigo-600 hover:underline font-medium">
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </section>
    );
};

export default Register;
