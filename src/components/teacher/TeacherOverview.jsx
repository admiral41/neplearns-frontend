import { useState } from 'react';
import { BookOpen, Users, FileText, BarChart, ClipboardCheck, ArrowUpRight, Clock } from 'lucide-react';

const StatCard = ({ icon, title, value, trend }) => {
  const trendColor = trend >= 0 ? 'text-emerald-600' : 'text-rose-600';
  const trendIcon = trend >= 0 ? '▲' : '▼';

  return (
    <div className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-50 hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-gray-500">
            {icon}
            <span className="text-sm font-medium">{title}</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
            <span className="font-medium">{trendIcon} {Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="mt-4 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Updated 2h ago</span>
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ activity }) => (
  <div className="p-4 hover:bg-gray-50 transition-colors rounded-xl">
    <div className="flex items-start gap-4">
      <div className={`mt-1 p-2 rounded-lg ${activity.type === 'enrollment' ? 'bg-blue-100' : 'bg-emerald-100'}`}>
        {activity.type === 'enrollment' ? (
          <Users className="w-5 h-5 text-blue-600" />
        ) : (
          <FileText className="w-5 h-5 text-emerald-600" />
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{activity.description}</h3>
        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
          <span>{activity.date}</span>
          <span className="flex items-center gap-1 text-blue-600 hover:text-blue-700 cursor-pointer">
            View details <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  </div>
);

const CourseCard = ({ course }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{course.name}</h3>
          <p className="text-sm text-gray-500">{course.category}</p>
        </div>
      </div>
      <span className="text-sm px-2 py-1 bg-gray-100 rounded-md text-gray-600">
        {course.lessons} lessons
      </span>
    </div>
    
    <div className="space-y-4">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Enrollment</span>
        <span className="font-medium text-gray-900">{course.students} students</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Completion rate</span>
          <span className="font-medium text-gray-900">{course.completion}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-2 transition-all duration-500"
            style={{ width: `${course.completion}%` }}
          />
        </div>
      </div>
    </div>
  </div>
);

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('activity');
  const [courses] = useState([
    { id: 1, name: 'Advanced React Patterns', category: 'Frontend Development', lessons: 24, students: 245, completion: 82 },
    { id: 2, name: 'Cloud Architecture', category: 'DevOps', lessons: 18, students: 168, completion: 68 },
    { id: 3, name: 'UI/UX Masterclass', category: 'Design', lessons: 32, students: 324, completion: 91 },
  ]);

  const [activities] = useState([
    { type: 'enrollment', description: '15 new students enrolled in UI/UX Masterclass', date: '45 minutes ago' },
    { type: 'lesson', description: 'New lesson published: "Advanced Prototyping Techniques"', date: '2 hours ago' },
    { type: 'enrollment', description: 'Enterprise team enrollment (25 seats) in Cloud Architecture', date: '4 hours ago' },
  ]);

  const [students] = useState([
    { id: 1, name: 'Sarah Johnson', course: 'React Patterns', progress: 82, quizzes: 92, avatar: '👩🏼💻' },
    { id: 2, name: 'Michael Chen', course: 'Cloud Architecture', progress: 68, quizzes: 84, avatar: '👨🏽💻' },
    { id: 3, name: 'Emma Wilson', course: 'UI/UX Masterclass', progress: 91, quizzes: 96, avatar: '👩🏽🎨' },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Educator Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, Professor Anderson</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <span>View Analytics</span>
              <BarChart className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<BookOpen className="w-6 h-6" />}
            title="Total Courses"
            value="12"
            trend={4.2}
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Active Students"
            value="2,458"
            trend={12.7}
          />
          <StatCard
            icon={<ClipboardCheck className="w-6 h-6" />}
            title="Completion Rate"
            value="84%"
            trend={2.1}
          />
          <StatCard
            icon={<BarChart className="w-6 h-6" />}
            title="Avg. Quizzes"
            value="89%"
            trend={-1.3}
          />
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-100">
            {['activity', 'courses', 'students'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 text-sm font-medium relative
                  ${activeTab === tab 
                    ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500' 
                    : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tabs Content */}
          <div className="p-8">
            {activeTab === 'activity' && (
              <div className="space-y-6">
                {activities.map((activity, index) => (
                  <ActivityItem key={index} activity={activity} />
                ))}
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
                <div className="col-span-full flex justify-center mt-6">
                  <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                    View All Courses
                    <ArrowUpRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Student</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Course</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Progress</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Quizzes</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{student.avatar}</span>
                            <span className="font-medium text-gray-900">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{student.course}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-2 bg-gray-100 rounded-full">
                              <div
                                className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                style={{ width: `${student.progress}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{student.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm">
                            {student.quizzes}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:text-blue-700 flex items-center gap-2">
                            Profile <ArrowUpRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;