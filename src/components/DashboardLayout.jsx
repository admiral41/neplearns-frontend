import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import Swal from 'sweetalert2';
import Title from './Title';

const DashboardLayout = ({ role, menuItems }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [title, setTitle] = useState('');

  // Set page title based on current route
  useEffect(() => {
    const currentMenuItem = menuItems.find(item => item.link === location.pathname);
    setTitle(currentMenuItem?.label || 'Dashboard');
  }, [location, menuItems]);

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure you want to log out?',
      text: "You need to enter your credentials to login again!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#003366',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Logout!'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        window.location.replace('/login');
      }
    });
  };

  return (
    <div className="flex min-h-screen">
      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="relative w-80 bg-white h-full">
          <div className="p-4 flex justify-between items-center border-b">
            <span className="font-semibold text-xl">{role} Dashboard</span>
            <X className="cursor-pointer" onClick={() => setSidebarOpen(false)} />
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.link}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      location.pathname === item.link ? 'bg-gray-100' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.icon}
                    <span className="capitalize">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 border-r bg-white">
        <div className="p-6 border-b">
          <h1 className="text-xl font-semibold">NepLearn {role}</h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.link}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    location.pathname === item.link ? 'bg-gray-100' : 'hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span className="capitalize">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="flex items-center justify-between p-4 border-b bg-white">
          <button
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu />
          </button>
          <Title title={title} />
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <LogOut />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;