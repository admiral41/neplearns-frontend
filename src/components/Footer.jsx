import { Link, useLocation } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  const location = useLocation();

  const desiredPaths = ["/admin/*"]; // Add more paths as needed

  const shouldHideFooter = desiredPaths.some(path =>
    location.pathname.startsWith(path.replace("/*", ""))
  );

  if (shouldHideFooter) return null;

  return (
    <footer className="bg-[#111926] text-white pt-16 pb-10">
      <div className="container max-w-screen-xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo & About */}
        <div>
          <h2 className="text-2xl font-bold mb-3">NepLearn</h2>
          <p className="text-gray-300">
            Empowering learners worldwide with quality education and practical skills.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-gray-300">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/course" className="hover:text-white">Courses</Link></li>
            <li><Link to="/about" className="hover:text-white">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Legal</h3>
          <ul className="space-y-2 text-gray-300">
            <li><Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link to="/terms-of-service" className="hover:text-white">Terms of Service</Link></li>
            <li><Link to="/cookie-policy" className="hover:text-white">Cookie Policy</Link></li>
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
          <div className="flex space-x-4 text-gray-300">
            <a href="#" className="hover:text-white"><FaTwitter /></a>
            <a href="#" className="hover:text-white"><FaFacebookF /></a>
            <a href="#" className="hover:text-white"><FaInstagram /></a>
            <a href="#" className="hover:text-white"><FaLinkedinIn /></a>
          </div>
        </div>
      </div>

      {/* Footer bottom */}
      <div className="mt-12 border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
        © 2025 NepLearn. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
