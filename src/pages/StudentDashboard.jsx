import { Book, Clock, GraduationCap, Bell, FileText, Users } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

const StudentDashboard = () => {
  const menuItems = [
    { label: 'My Courses', link: '/student/courses', icon: <Book size={20} /> },
    { label: 'Assignments', link: '/student/assignments', icon: <FileText size={20} /> },
    { label: 'Quizzes', link: '/student/quizzes', icon: <Clock size={20} /> },
    { label: 'Grades', link: '/student/grades', icon: <GraduationCap size={20} /> },
    { label: 'Classmates', link: '/student/classmates', icon: <Users size={20} /> },
    { label: 'Notifications', link: '/student/notifications', icon: <Bell size={20} /> }
  ];

  return <DashboardLayout role="Student" menuItems={menuItems} />;
};

export default StudentDashboard;