import { Book, Users, Settings, FileText, School, Globe, Trophy, ClipboardList } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

const AdminDashboard = () => {
  const menuItems = [
    { label: 'Dashboard', link: '/admin/dashboard', icon: <ClipboardList size={20} /> },
    { label: 'Manage Students', link: '/admin/users', icon: <Users size={20} /> },
    { label: 'Manage Teachers', link: '/admin/teachers', icon: <School size={20} /> },    
    { label: 'Courses', link: '/admin/courses', icon: <Book size={20} /> },
    { label: 'Settings', link: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return <DashboardLayout role="Admin" menuItems={menuItems} />;
};

export default AdminDashboard;