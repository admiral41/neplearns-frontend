// Hero Slider Data
export const heroSlides = [
  {
    id: 1,
    title: "SEE & +2 को तयारी अब घरमै!",
    subtitle: "Prepare for SEE with Nepal's top educators from home",
    image: "/images/hero-1.jpg",
    cta: "Explore Courses",
    ctaLink: "/courses",
    stats: [
      { label: "Expert Teachers", value: "10+" },
      { label: "Courses Available", value: "15+" },
      { label: "Live Classes Daily", value: "5+" },
    ],
  },
  {
    id: 2,
    title: "LIVE classes everyday for each course!",
    subtitle: "Study at your own pace with video lessons and practice tests",
    image: "/images/hero-2.jpg",
    cta: "Start Learning",
    ctaLink: "/courses",
    stats: [
      { label: "Video Lessons", value: "100+" },
      { label: "Practice Tests", value: "50+" },
      { label: "Subjects Covered", value: "10+" },
    ],
  },
  {
    id: 3,
    title: "Build Strong Foundation for Your Future",
    subtitle: "Quality education from experienced teachers across Nepal",
    image: "/images/hero-3.jpg",
    cta: "Join Now",
    ctaLink: "/student-registration",
    stats: [
      { label: "All Subjects", value: "15+" },
      { label: "Study Materials", value: "200+" },
      { label: "Expert Faculty", value: "10+" },
    ],
  },
];

// Platform Stats
export const platformStats = [
  { id: 1, label: "Expert Teachers", value: 10, suffix: "+" },
  { id: 2, label: "Courses Available", value: 15, suffix: "+" },
  { id: 3, label: "Live Classes Daily", value: 5, suffix: "+" },
  { id: 4, label: "Subjects Covered", value: 10, suffix: "+" },
];

// Course Categories
export const courseCategories = [
  "SEE Preparation",
  "+2 Science",
  "+2 Management",
  "+2 Humanities",
  "Mathematics",
  "Science",
  "English",
  "Nepali",
  "Social Studies",
  "Optional Math",
  "Computer Science",
  "Accountancy",
];

// Courses Data
export const courses = [
  {
    id: 1,
    title: "Complete SEE Preparation - All Subjects",
    description: "Comprehensive preparation for all SEE subjects including Math, Science, English, Nepali, and Social Studies with live classes and practice tests",
    category: "SEE Preparation",
    image: "/images/course-1.jpg",
    duration: "6 months",
    students: 1250,
    rating: 4.9,
    reviews: 340,
    instructor: "Ramesh Sharma",
    price: 8000,
    originalPrice: 15000,
    discount: 47,
    level: "Class 10",
    featured: true,
  },
  {
    id: 2,
    title: "+2 Science Complete Package (Physics, Chemistry, Biology, Math)",
    description: "Full preparation for NEB +2 Science stream covering all subjects with video lectures, notes, and model questions",
    category: "+2 Science",
    image: "/images/course-2.jpg",
    duration: "1 year",
    students: 980,
    rating: 4.8,
    reviews: 250,
    instructor: "Dr. Sunita Poudel",
    price: 12000,
    originalPrice: 25000,
    discount: 52,
    level: "Grade 11-12",
    featured: true,
  },
  {
    id: 3,
    title: "Mathematics Mastery - SEE Level",
    description: "Complete mathematics course for SEE with chapter-wise video lessons, practice problems, and model questions",
    category: "Mathematics",
    image: "/images/course-3.jpg",
    duration: "4 months",
    students: 890,
    rating: 4.7,
    reviews: 180,
    instructor: "Krishna Adhikari",
    price: 3500,
    originalPrice: 7000,
    discount: 50,
    level: "Class 10",
    featured: false,
  },
  {
    id: 4,
    title: "+2 Management (Accountancy, Economics, Business Studies)",
    description: "Complete package for +2 Management students covering all core subjects with expert faculty",
    category: "+2 Management",
    image: "/images/course-4.jpg",
    duration: "1 year",
    students: 750,
    rating: 4.8,
    reviews: 190,
    instructor: "Bijay Thapa",
    price: 10000,
    originalPrice: 20000,
    discount: 50,
    level: "Grade 11-12",
    featured: false,
  },
  {
    id: 5,
    title: "English Language & Literature - SEE",
    description: "Complete English preparation with grammar, composition, comprehension, and literature analysis",
    category: "English",
    image: "/images/course-5.jpg",
    duration: "3 months",
    students: 1100,
    rating: 4.9,
    reviews: 280,
    instructor: "Anjali Rai",
    price: 3000,
    originalPrice: 6000,
    discount: 50,
    level: "Class 10",
    featured: true,
  },
  {
    id: 6,
    title: "Optional Mathematics - SEE Level",
    description: "Advanced mathematics course for SEE students with detailed explanations and problem-solving techniques",
    category: "Optional Math",
    image: "/images/course-6.jpg",
    duration: "5 months",
    students: 680,
    rating: 4.9,
    reviews: 150,
    instructor: "Prakash Bhattarai",
    price: 4500,
    originalPrice: 9000,
    discount: 50,
    level: "Class 10",
    featured: false,
  },
];

// Why Choose Us Features
export const whyChooseUs = [
  {
    id: 1,
    icon: "GraduationCap",
    title: "Experienced Teachers",
    description: "Learn from Nepal's top educators with proven track records in SEE and +2 results",
  },
  {
    id: 2,
    icon: "Award",
    title: "Quality Education",
    description: "Focused on helping every student achieve their best results",
  },
  {
    id: 3,
    icon: "Video",
    title: "Daily Live Classes",
    description: "Join interactive live classes every day with expert teachers and real-time Q&A sessions",
  },
  {
    id: 4,
    icon: "Users",
    title: "Doubt Clearing",
    description: "Get your doubts cleared by teachers through chat, call, or live sessions",
  },
  {
    id: 5,
    icon: "BookOpen",
    title: "Complete Study Material",
    description: "Access chapter-wise notes, practice sets, model questions, and previous year papers",
  },
  {
    id: 6,
    icon: "TrendingUp",
    title: "Regular Mock Tests",
    description: "Practice with mock tests and get detailed performance analysis to track progress",
  },
];

// Testimonials
export const testimonials = [
  {
    id: 1,
    name: "Aayush Karki",
    role: "SEE Graduate - GPA 3.95",
    image: "/images/student-1.jpg",
    rating: 5,
    text: "This platform helped me score 3.95 GPA in SEE! The video lessons were clear and the practice tests prepared me perfectly. The teachers were always available to clear my doubts. Highly recommended for SEE students!",
    course: "Complete SEE Preparation - All Subjects",
  },
  {
    id: 2,
    name: "Shreya Shrestha",
    role: "+2 Science Graduate - GPA 3.85",
    image: "/images/student-2.jpg",
    rating: 5,
    text: "I was struggling with Physics and Chemistry, but the detailed video explanations and practice problems helped me understand concepts clearly. Scored 3.85 GPA in +2! Thank you!",
    course: "+2 Science Complete Package",
  },
  {
    id: 3,
    name: "Bibek Ghimire",
    role: "SEE Graduate - Mathematics A+",
    image: "/images/student-3.jpg",
    rating: 5,
    text: "Mathematics was my weakest subject, but Krishna sir's teaching method made it so easy to understand. I scored A+ in both Math and Optional Math in SEE. Best decision I made!",
    course: "Mathematics Mastery - SEE Level",
  },
  {
    id: 4,
    name: "Anisha Tamang",
    role: "+2 Management Graduate - GPA 3.90",
    image: "/images/student-4.jpg",
    rating: 5,
    text: "The Accountancy and Economics courses were excellent. The teachers explained everything step-by-step and the study materials were very helpful. Scored 3.90 GPA in +2 Management!",
    course: "+2 Management Complete Package",
  },
];

// Inquiry Form Benefits
export const inquiryBenefits = [
  "Get free counseling for course selection",
  "Speak with our education counselors",
  "Flexible payment plans available",
  "Access exclusive discounts for early enrollment",
  "Free demo classes before enrollment",
];

// Footer Links
export const footerLinks = {
  company: [
    { label: "About Us", href: "#about" },
    { label: "Careers", href: "#careers" },
    { label: "Press", href: "#press" },
    { label: "Blog", href: "#blog" },
  ],
  support: [
    { label: "Help Center", href: "#help" },
    { label: "Contact Us", href: "#contact" },
    { label: "FAQs", href: "#faqs" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
  categories: [
    { label: "SEE Preparation", href: "#see" },
    { label: "+2 Science", href: "#science" },
    { label: "+2 Management", href: "#management" },
    { label: "+2 Humanities", href: "#humanities" },
    { label: "All Subjects", href: "#subjects" },
  ],
};

// Social Media Links
export const socialLinks = [
  { platform: "Facebook", url: "#", icon: "Facebook" },
  { platform: "Twitter", url: "#", icon: "Twitter" },
  { platform: "Instagram", url: "#", icon: "Instagram" },
  { platform: "LinkedIn", url: "#", icon: "Linkedin" },
  { platform: "YouTube", url: "#", icon: "Youtube" },
];

// Contact Information
export const contactInfo = {
  address: "Sahid Marg, Biratnagar, Morang, Nepal",
  email: "neplearns@gmail.com",
  mobiles: ["+977 9869906931"],
  whatsapp: "9779869906931", // WhatsApp number without + or dashes
  whatsappMessage: "Hi! I want to know about NepLearns courses for SEE/+2 preparation. Please share course details and fees.", // Pre-filled message
  hours: "Sun - Fri: 6:00 AM - 9:00 PM",
};

// Navigation Menu
export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Courses", href: "#courses" },
  { label: "About", href: "#about" },
  { label: "1:1 Tutoring", href: "#tutoring" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];
