import { motion } from "framer-motion";
import { FaUsers, FaRocket, FaHandshake } from "react-icons/fa";
import img from "../assets/test.png"; // Placeholder image, replace with actual image path
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  viewport: { once: true },
};

const AboutUs = () => {
  return (
    <div className="pt-12 bg-white">
      {/* Intro Section */}
      <section className="py-20">
        <div className="container max-w-screen-xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <motion.div {...fadeInUp} className="overflow-hidden order-2 md:order-1">
              <img
                src={img}
                alt="About NepLearn"
                className="w-full h-full object-cover"
              />
            </motion.div>
            {/* Text Content */}
            <div className="order-1 md:order-2 text-center md:text-left">
              <motion.h2
                {...fadeInUp}
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              >
                About NepLearn
              </motion.h2>
              <motion.p
                {...fadeInUp}
                className="text-gray-600 text-lg mb-6 leading-relaxed"
              >
                At NepLearn, we believe education should be available to everyone—anytime, anywhere. Our platform was built with the vision of providing accessible, affordable, and practical learning experiences that empower individuals to transform their lives.
              </motion.p>
              <motion.p
                {...fadeInUp}
                className="text-gray-500 text-base mb-6"
              >
                Whether you're a student, a working professional, or simply a lifelong learner, NepLearn equips you with high-quality courses, community support, and tools to grow personally and professionally.
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container max-w-screen-xl mx-auto px-4">
          <motion.h3
            {...fadeInUp}
            className="text-3xl font-bold text-center text-gray-900 mb-12"
          >
            Our Core Values
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              {...fadeInUp}
              className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition"
            >
              <FaUsers className="text-black text-4xl mb-4 mx-auto" />
              <h4 className="text-xl font-semibold text-center mb-2">Community Driven</h4>
              <p className="text-gray-600 text-sm text-center leading-relaxed">
                We believe in the power of community learning—where collaboration, support, and shared goals drive success.
              </p>
            </motion.div>

            <motion.div
              {...fadeInUp}
              className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition"
            >
              <FaRocket className="text-black text-4xl mb-4 mx-auto" />
              <h4 className="text-xl font-semibold text-center mb-2">Innovation First</h4>
              <p className="text-gray-600 text-sm text-center leading-relaxed">
                Staying ahead with emerging tech and modern methodologies keeps our courses effective and engaging.
              </p>
            </motion.div>

            <motion.div
              {...fadeInUp}
              className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition"
            >
              <FaHandshake className="text-black text-4xl mb-4 mx-auto" />
              <h4 className="text-xl font-semibold text-center mb-2">Learner Focused</h4>
              <p className="text-gray-600 text-sm text-center leading-relaxed">
                From course design to platform experience, every decision is made with our learners' success in mind.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section className="py-20">
        <div className="container max-w-screen-xl mx-auto px-4">
          <motion.h3
            {...fadeInUp}
            className="text-3xl font-bold text-center text-gray-900 mb-12"
          >
            Meet Our Team
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                name: "Aarav Sharma",
                role: "Founder & CEO",
                img: "https://img.freepik.com/free-photo/serious-young-african-man-standing-isolated_171337-9633.jpg?semt=ais_hybrid&w=740",
              },
              {
                name: "Sita Thapa",
                role: "Head of Learning",
                img: "https://img.freepik.com/free-photo/serious-young-african-man-standing-isolated_171337-9633.jpg?semt=ais_hybrid&w=740",
              },
              {
                name: "Rajan Bista",
                role: "Tech Lead",
                img: "https://img.freepik.com/free-photo/serious-young-african-man-standing-isolated_171337-9633.jpg?semt=ais_hybrid&w=740",
              },
            ].map((member, index) => (
              <motion.div
                {...fadeInUp}
                key={index}
                className="bg-white p-6 rounded-2xl shadow hover:shadow-xl text-center transition"
              >
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h4 className="text-xl font-semibold mb-1">{member.name}</h4>
                <p className="text-gray-500 text-sm">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;