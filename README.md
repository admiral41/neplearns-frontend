# PadhaiHub

Nepal's #1 Online Learning Platform for SEE and +2 Students

A modern educational landing page built with Next.js 16.0.6, featuring interactive components, smooth animations, and a beautiful gradient design inspired by Nepal's national colors.

## 🎯 About

PadhaiHub is a comprehensive learning management system (LMS) landing page designed specifically for Nepali students preparing for SEE (Secondary Education Examination) and +2 exams. The platform offers live interactive classes, expert teachers, and comprehensive study materials.

## ✨ Features

- 🎨 **Modern UI/UX** - Beautiful gradient designs with Nepal flag colors (Crimson Red & Royal Blue)
- 📱 **Fully Responsive** - Mobile-first design that works seamlessly across all devices
- 🎭 **Interactive Animations** - Smooth scroll animations and floating elements
- 🔄 **Hero Slider** - Auto-playing slider with dynamic gradient backgrounds
- 📊 **Animated Statistics** - Count-up animations for platform stats
- 📚 **Course Catalog** - 6+ courses with detailed information and pricing
- ⭐ **Student Testimonials** - Real success stories from students
- 📝 **Registration Forms** - Separate forms for students and instructors
- 🔔 **Toast Notifications** - "Coming Soon" alerts for enrollment
- 🎨 **Glass-morphism Effects** - Modern frosted glass UI components

## 🛠️ Tech Stack

- **Next.js 16.0.6** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Re-usable component library
- **Sonner** - Toast notifications
- **Lucide React** - Icon library
- **JavaScript (ES6+)** - Programming language

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend-edu-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
frontend-edu-app/
├── app/
│   ├── globals.css                    # Global styles with Tailwind & custom animations
│   ├── layout.js                      # Root layout with Toaster
│   ├── page.js                        # Landing page
│   ├── student-registration/          # Student registration form
│   └── instructor-application/        # Instructor application form
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx                 # Sticky navbar with scroll effects
│   │   └── Footer.jsx                 # Footer with contact info
│   ├── sections/
│   │   ├── HeroSlider.jsx            # Hero section with auto-slider
│   │   ├── StatsBar.jsx              # Animated statistics section
│   │   ├── Courses.jsx               # Course cards with toast
│   │   ├── WhyChooseUs.jsx           # Features section
│   │   ├── PrivateTutoring.jsx       # 1:1 tutoring service section
│   │   ├── Testimonials.jsx          # Student testimonials
│   │   └── InquiryForm.jsx           # Contact/inquiry form
│   └── ui/                            # shadcn/ui components
├── lib/
│   ├── constants/
│   │   └── data.js                    # All content data (courses, testimonials, etc.)
│   ├── hooks/
│   │   └── useIntersectionObserver.js # Custom hook for scroll animations
│   └── utils.js                       # Utility functions
├── public/                            # Static assets
├── components.json                    # shadcn/ui configuration
├── jsconfig.json                      # JavaScript path aliases
├── next.config.js                     # Next.js configuration
├── postcss.config.js                  # PostCSS configuration
└── tailwind.config.js                 # Tailwind CSS configuration
```

## 🎨 Design System

### Colors

- **Primary (Crimson Red)**: `hsl(348, 83%, 47%)` - Nepal flag red
- **Secondary (Royal Blue)**: `hsl(215, 100%, 35%)` - Nepal flag blue
- **Background**: Light/white tones
- **Text**: Dark gray for readability

### Gradients

Three dynamic gradient variations used in the hero slider:
1. Blue spectrum: `from-[#1e3a5f] via-[#2d5a87] to-[#4a90d9]`
2. Mixed: `from-primary via-[#1e3a5f] to-secondary`
3. Dark blue: `from-[#2d5a87] via-[#1e3a5f] to-[#152a45]`

## 📦 shadcn/ui Components Used

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add badge
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add checkbox
npx shadcn@latest add sonner
```

## 🌐 Pages

1. **Landing Page** (`/`) - Main page with all sections
2. **Student Registration** (`/student-registration`) - Student enrollment form
3. **Instructor Application** (`/instructor-application`) - Teacher application form

## 📊 Sections

1. **Hero Slider** - Auto-playing slider with 3 slides, CTAs, and floating stat cards
2. **Stats Bar** - Animated counters showing platform statistics
3. **Courses** - 6 featured courses with pricing and enrollment buttons
4. **Why Choose Us** - 6 key features of the platform
5. **1:1 Private Tutoring** - Premium one-on-one tutoring service with benefits and pricing
6. **Testimonials** - 4 student success stories
7. **Inquiry Form** - Contact form for inquiries
8. **Footer** - Contact information and social links

## 🎯 Key Features Implemented

- Smooth scroll navigation
- Intersection Observer animations
- Auto-playing hero slider (5s interval)
- Count-up animations for statistics
- Toast notifications for "Coming Soon" features
- Glass-morphism effects
- Floating card animations
- Responsive design for all screen sizes
- Nepal-themed color scheme

## 📝 Content

All content data is centralized in `lib/constants/data.js`:
- Hero slides
- Platform statistics
- Course information
- Testimonials
- Features
- Contact information
- Navigation links

## 🔮 Future Enhancements

- User authentication
- Course enrollment system
- Payment integration
- Student dashboard
- Live class integration
- Video lessons
- Practice tests
- Progress tracking

## 📄 License

This project is created for PadhaiHub.

## 🤝 Contributing

For any suggestions or improvements, please create an issue or pull request.

---

**Built with ❤️ for Nepali students**
