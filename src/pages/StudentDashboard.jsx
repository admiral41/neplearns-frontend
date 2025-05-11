import { Book, Clock, GraduationCap, Bell, FileText, Users } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

const StudentDashboard = () => {
  const menuItems = [
    { label: 'Dashboard', link: '/student/dashboard', icon: <Book size={20} /> },
    { label: 'Your Courses', link: '/student/courses', icon: <FileText size={20} /> },
    { label: 'Setting', link: '/student/setting', icon: <Bell size={20} /> }
  ];

  return <DashboardLayout role="Student" menuItems={menuItems} />;
};

export default StudentDashboard;