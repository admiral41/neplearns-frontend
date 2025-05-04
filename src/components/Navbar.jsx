import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

const Navbar = () => {
  const location = useLocation();
  const [isSticky, setIsSticky] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const desiredPaths = [
    "/admin/*",
    "/teacher/*",
    "/student/*",
  ];

  const shouldHideNavbar = desiredPaths.some(path =>
    location.pathname.startsWith(path.replace('/*', ''))
  );

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    toast.success('Logged out successfully!');
    setMenuOpen(false);
  };

  if (shouldHideNavbar) return null;

  return (
    <>
      <motion.nav
        className={`w-full top-0 z-50 transition-all duration-300 ${isSticky ? "fixed bg-white shadow-md" : "absolute bg-transparent"
          }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition">
            Nep<span className="text-blue-600">Learn</span>
          </Link>

          <div className="hidden md:flex space-x-8 items-center">
            <NavLink to="/" label="Home" isActive={location.pathname === "/"} />
            <NavLink to="/course" label="Courses" isActive={location.pathname === "/course"} />
            <NavLink to="/about" label="About Us" isActive={location.pathname === "/about"} />
            <NavLink to="/contact" label="Contact" isActive={location.pathname === "/contact"} />

            <div className="flex items-center space-x-6 ml-4">
              {user?.role ? (
                <>
                  <NavLink
                    to={`/${user?.role?.toLowerCase()}/dashboard`}
                    label="Profile"
                    isActive={location.pathname.startsWith(`/${user?.role?.toLowerCase()}`)}
                  />
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-black text-white border border-black hover:bg-white hover:text-black transition-colors duration-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" label="Login" isActive={location.pathname === "/login"} />
                  <button
                    onClick={() => navigate("/register")}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-black text-white border border-black hover:bg-white hover:text-black transition-colors duration-300"
                  >
                    Register
                  </button>
                </>
              )}

            </div>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-900 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </motion.nav>

      {isSticky && (
        <motion.div
          className="w-full h-px bg-gray-200 shadow-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        ></motion.div>
      )}

      <motion.div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setMenuOpen(false)}
        initial={{ opacity: 0 }}
        animate={{ opacity: menuOpen ? 1 : 0 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={`absolute right-0 top-0 h-full w-64 bg-white transform transition-transform ${menuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          onClick={(e) => e.stopPropagation()}
          initial={{ x: "100%" }}
          animate={{ x: menuOpen ? 0 : "100%" }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="p-6 border-b">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Nep<span className="text-blue-600">Learn</span>
            </Link>
          </div>

          <div className="p-6 space-y-6">
            <MobileNavLink to="/" label="Home" setMenuOpen={setMenuOpen} />
            <MobileNavLink to="/course" label="Courses" setMenuOpen={setMenuOpen} />
            <MobileNavLink to="/about" label="About Us" setMenuOpen={setMenuOpen} />
            <MobileNavLink to="/contact" label="Contact" setMenuOpen={setMenuOpen} />

            {user ? (
              <>
                <MobileNavLink
                  to={`/${user.role?.toLowerCase()}}/dashboard`}
                  label="Profile"
                  setMenuOpen={setMenuOpen}
                />
                <div className="pt-6 border-t">
                  <button
                    onClick={handleLogout}
                    className="block w-full mt-4 py-3 px-4 bg-black text-white rounded-md hover:bg-blue-700 text-center transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <MobileNavLink to="/login" label="Login" setMenuOpen={setMenuOpen} />
                <div className="pt-6 border-t">
                  <button
                    onClick={() => {
                      navigate("/register");
                      setMenuOpen(false);
                    }}
                    className="block w-full mt-4 py-3 px-4 bg-black text-white rounded-md hover:bg-blue-700 text-center transition"
                  >
                    Register
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

const NavLink = ({ to, label, isActive }) => {
  return (
    <Link
      to={to}
      className={`relative text-sm font-medium text-black transition-colors duration-300 ${isActive
        ? "font-bold underline decoration-blue-600 underline-offset-4"
        : "hover:underline hover:decoration-blue-600 hover:underline-offset-4"
        }`}
    >
      {label}
    </Link>
  );
};

const MobileNavLink = ({ to, label, setMenuOpen }) => {
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      onClick={() => setMenuOpen(false)}
      className="cursor-pointer"
    >
      <Link
        to={to}
        className="block py-2 text-lg text-gray-900 hover:text-blue-600 transition"
      >
        {label}
      </Link>
    </motion.div>
  );
};

export default Navbar;