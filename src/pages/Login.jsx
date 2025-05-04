import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginUser } from "../api/apis";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
      email: "",
      password: "",
  });
  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const { user, setUser } = useAuth();

  useEffect(() => {
      if (user) {
          switch (user.role) {
              case 'Admin':
                  navigate('/admin/dashboard');
                  break;
              case 'Teacher':
                  navigate('/teacher/dashboard');
                  break;
              case 'Student':
                  navigate('/student/dashboard');
                  break;
              default:
                  navigate('/login');
          }
      }
  }, [user, navigate]); // Depend on user and navigate

  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          const response = await loginUser(formData);
          const { token, user: userData } = response.data;

          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));

          setUser({
              id: userData._id,
              role: userData.role,
              token,
          });

          toast.success('Logged in successfully!');
          
          // Removed the navigate call here
      } catch (err) {
          toast.error(err.response?.data?.message || 'Login failed');
      }
  };
    return (
        <section className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full"
            >
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-1">Welcome Back</h2>
                <p className="text-center text-gray-500 mb-6">Sign in to your account</p>

                <form onSubmit={handleSubmit}>
                <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>

                        </div>
                        <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
                    </div>
                    <Link to="#" className="text-sm text-indigo-600 hover:underline">Forgot password?</Link>
                    <button
            type="submit"
            className="w-full bg-gray-900 text-white py-2 mt-4 rounded-md font-semibold hover:bg-gray-800 transition"
          >
            Sign in
          </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-indigo-600 hover:underline font-medium">
                        Create an account
                    </Link>
                </p>
            </motion.div>
        </section>
    );
};

export default Login;
