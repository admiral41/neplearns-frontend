import { useEffect, useState } from 'react';
import { Users, School, Book } from 'lucide-react';
import { getStats } from '../../api/apis';

const StatCard = ({ icon, title, value }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-blue-50 rounded-lg">{icon}</div>
      <div>
        <p className="text-gray-500">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  </div>
);

const AdminOverview = () => {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    courses: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getStats();
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        icon={<Users size={24} className="text-blue-600" />}
        title="Total Students"
        value={stats.students}
      />
      <StatCard
        icon={<School size={24} className="text-green-600" />}
        title="Total Teachers"
        value={stats.teachers}
      />
      <StatCard
        icon={<Book size={24} className="text-purple-600" />}
        title="Active Courses"
        value={stats.courses}
      />
    </div>
  );
};

export default AdminOverview;
