import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ContactUs from './pages/ContactUs';
import AboutUs from './pages/AboutUs';
import Login from './pages/Login';
import Register from './pages/Register';
import CoursesPage from './pages/CoursePage';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import CourseDetail from './pages/CourseDetail';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import AdminOverview from './components/admin/AdminOverview';
import ManageUser from './components/admin/ManageUser';
import ManageTeacher from './components/admin/ManageTeacher';
import TeacherOverview from './components/teacher/TeacherOverview';
import CreateCourse from './components/teacher/CreateCourse';
import LessonManager from './components/teacher/StudentManager';
import CourseManagePage from './components/teacher/coursemange/CourseManage';
import AddLessonPage from './components/teacher/coursemange/AddLessonPage';
import EditLessonPage from './components/teacher/edit-lessons/EditLessonPage';
import QuizBuilder from './components/teacher/coursemange/ManagePage/pages/QuizBuilder';
import AddAssignmentPage from './components/teacher/coursemange/ManagePage/pages/AddAssignmentPage';
import LessonDetail from './pages/LessonDetail';
import StudentOverview from './components/student-dashboard/StudentOverview';
import YourCoursesPage from './components/student-dashboard/YourCoursesPage';
import UserSetting from './components/student-dashboard/UserSetting';
import QuizPlay from './pages/QuizPlay';
import QuizResults from './pages/QuizResults';
import ResetPassword from './pages/ResetPassword';
import QuizEditPage from './components/teacher/coursemange/QuizEditPage';
import QuizResultsPage from './components/teacher/coursemange/QuizResultsPage';
import SubmissionDetailPage from './components/teacher/coursemange/QuizPreviewPage';
import QuizPreviewPage from './components/teacher/coursemange/QuizPreviewPage';

function App() {
  return (
    <>
      <AuthProvider>
        <Toaster position="top-right" />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/invocie" element={<InvoicePage />} /> */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/course" element={<CoursesPage />} />
          <Route path="/course/:slug" element={<CourseDetail />} />
          <Route path="/course/:slug/lessons/:lessonId" element={<LessonDetail />} />
          <Route path="/quiz/:quizId" element={<QuizPlay />} />
          <Route path="/quiz/:quizId/results" element={<QuizResults />} />
          <Route path="/resetpassword/:resettoken" element={<ResetPassword />} />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }>
            <Route index path='dashboard' element={<AdminOverview />} />
            <Route index path="users" element={<ManageUser />} />
            <Route index path="teachers" element={<ManageTeacher />} />

          </Route>
          <Route path="/teacher" element={
            <ProtectedRoute allowedRoles={['Teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<TeacherOverview />} />
            <Route path="manage-students" element={<LessonManager />} />
            <Route path="courses" element={<CreateCourse />} />
            <Route path="courses/:slug" element={<CourseManagePage />} />
            <Route path="courses/:slug/add-lesson" element={<AddLessonPage />} />
            <Route path="courses/:slug/edit-lesson/:lessonId" element={<EditLessonPage />} />
            <Route path="courses/:slug/add-quiz" element={<QuizBuilder />} />
            <Route path="courses/:slug/edit-quiz/:quizId" element={<QuizEditPage />} />
            <Route path="courses/:slug/quiz-results/:quizId" element={<QuizResultsPage />} />
            <Route path="courses/:slug/preview-quiz/:quizId" element={<QuizPreviewPage />} />
            <Route path="courses/:slug/add-assignment" element={<AddAssignmentPage />} />

          </Route>
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['Student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } >
            <Route path="dashboard" element={<StudentOverview />} />
            <Route path="courses" element={<YourCoursesPage />} />
            <Route path="setting" element={<UserSetting />} />

          </Route>

        </Routes>
        <Footer />
      </AuthProvider>
    </>
  );
}

export default App;
