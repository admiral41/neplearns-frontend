import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginUser, forgotPassword } from "../api/apis";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  
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
  }, [user, navigate]);

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
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      toast.error("Please enter your email");
      return;
    }
    
    setIsSending(true);
    try {
      await forgotPassword({ email: forgotEmail });
      toast.success("Password reset link sent to your email");
      setShowForgotPassword(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setIsSending(false);
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
          
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-indigo-600 hover:underline mb-4"
          >
            Forgot password?
          </button>
          
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

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-lg max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold mb-4">Reset Password</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowForgotPassword(false)}
                className="px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleForgotPassword}
                disabled={isSending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSending ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default Login;