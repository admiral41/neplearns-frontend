import { Book, Users, FileText, ClipboardList, Bell, GraduationCap } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

const TeacherDashboard = () => {
  const menuItems = [
    { label: 'Dashboard', link: '/teacher/dashboard', icon: <Book size={20} /> },
    { label: 'Courses', link: '/teacher/courses', icon: <ClipboardList size={20} /> },
    
    { label: 'Students', link: '/teacher/create-course', icon: <Book size={20} /> },
    { label: 'Assignments', link: '/teacher/assignments', icon: <FileText size={20} /> },
    { label: 'Settings', link: '/teacher/quizzes', icon: <ClipboardList size={20} /> },
   
  ];

  return <DashboardLayout role="Teacher" menuItems={menuItems} />;
};

export default TeacherDashboard;