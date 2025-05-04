import { motion } from "framer-motion";
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";

const ContactUs = () => {
  return (
    <section className="min-h-screen bg-gray-50 pt-28 pb-20 px-4">
      <div className="max-w-screen-xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-6"
        >
          Contact Us
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-gray-600 text-lg mb-12"
        >
          Have a question or need support? We’re here to help!
        </motion.p>

        {/* Contact Info Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white shadow-md p-6 rounded-xl flex items-center gap-4">
            <FaEnvelope size={28} className="text-black" />
            <div>
              <h4 className="font-semibold text-gray-900">Email</h4>
              <p className="text-gray-600 text-sm">support@neplearn.com</p>
            </div>
          </div>
          <div className="bg-white shadow-md p-6 rounded-xl flex items-center gap-4">
            <FaPhoneAlt size={28} className="text-black" />
            <div>
              <h4 className="font-semibold text-gray-900">Phone</h4>
              <p className="text-gray-600 text-sm">+977 9800000000</p>
            </div>
          </div>
          <div className="bg-white shadow-md p-6 rounded-xl flex items-center gap-4">
            <FaMapMarkerAlt size={28} className="text-black" />
            <div>
              <h4 className="font-semibold text-gray-900">Location</h4>
              <p className="text-gray-600 text-sm">Kathmandu, Nepal</p>
            </div>
          </div>
        </div>

        {/* Contact Form and Map */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.form
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white p-8 rounded-2xl shadow-lg"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Feel free to reach out using the form below</h3>
            <input
              type="text"
              placeholder="Your Name"
              className="w-full border border-gray-300 px-4 py-3 mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full border border-gray-300 px-4 py-3 mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              placeholder="Your Message"
              rows="5"
              className="w-full border border-gray-300 px-4 py-3 mb-4 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
            <button
              type="submit"
              className="bg-white border border-black text-black font-medium px-6 py-3 rounded-md hover:bg-black hover:text-white transition w-full"
            >
              Send Message
            </button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl overflow-hidden shadow-lg"
          >
            <iframe
              title="NepLearn Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.0968490593334!2d85.31232941453694!3d27.70903163175364!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb197bdddbdf41%3A0x7f158f2c156bb9a5!2sKathmandu!5e0!3m2!1sen!2snp!4v1611908974982!5m2!1sen!2snp"
              width="100%"
              height="100%"
              className="w-full h-[400px] border-0"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
