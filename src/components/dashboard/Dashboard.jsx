import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, User, LogOut, Home, Users, School, Layers, Briefcase, Boxes, BarChart } from 'lucide-react';

const Dashboard = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const navItems = [
    { path: '/', icon: Home, label: 'Tableau de bord' },
    { path: '/groupes', icon: Layers, label: 'Groupes' },
    { path: '/encadrements', icon: Briefcase, label: 'Encadrements' },
    { path: '/membres-goupes', icon: Boxes, label: 'Membres groupes' },
    { path: '/niveaux', icon: BarChart, label: 'Niveaux' },
    { path: '/etudiants', icon: Users, label: 'Étudiants' },
    { path: '/enseignants', icon: School, label: 'Enseignants' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out`}>
        <nav>
          <div className="text-2xl font-semibold text-center mb-6">MentorWise</div>
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 ${location.pathname === item.path ? 'bg-gray-700' : ''}`}
            >
              <item.icon className="inline-block mr-2" size={20} />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="bg-white shadow-md">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button onClick={toggleSidebar} className="text-gray-500 focus:outline-none focus:text-gray-700 md:hidden">
                <Menu size={24} />
              </button>
            </div>

            <div className="flex items-center">
              <div className="relative">
                <button className="flex items-center text-gray-700 focus:outline-none">
                  <User className="h-6 w-6 text-gray-700" />
                  <span className="ml-2">John Doe</span>
                </button>
                {/* Dropdown menu would go here */}
              </div>
              <Link to="/login" className="ml-4 text-gray-700 hover:text-gray-900">
                <LogOut className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;