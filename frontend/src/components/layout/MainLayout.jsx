import { useState, useEffect } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  AcademicCapIcon,
  UsersIcon,
  PuzzlePieceIcon, // Replaced GameControllerIcon with PuzzlePieceIcon
  LinkIcon, // Added LinkIcon import
  ClipboardDocumentCheckIcon, // Added for Practice Exam
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { QuickThemeToggle } from '../ThemeToggle';
import FloatingAIAssistant from '../FloatingAIAssistant';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();


  const navigation = [
    { name: 'Notes', href: '/app/notes', icon: DocumentTextIcon },
    { name: 'Study', href: '/app/study', icon: AcademicCapIcon },
    { name: 'Practice Exam', href: '/app/practice-exam', icon: ClipboardDocumentCheckIcon },
    { name: 'Settings', href: '/app/settings', icon: Cog6ToothIcon },
  ];

  const getInitials = (name) => {
    if (!name) return user?.username ? user.username.charAt(0).toUpperCase() : 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed and Toggable on Desktop */}
      <div className={`
        fixed inset-y-0 left-0 z-30 bg-white dark:bg-gray-800 transform transition-all duration-300 ease-in-out lg:flex-shrink-0 lg:border-r lg:border-gray-200 dark:lg:border-gray-700
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        w-64 ${isSidebarOpen ? 'lg:w-64' : 'lg:w-20'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h1 className={`text-xl font-semibold text-indigo-600 dark:text-indigo-400 ${isSidebarOpen ? 'block' : 'hidden'} ${isSidebarOpen ? 'lg:block' : 'lg:hidden'}`}>Student Buddy</h1>
            <button
              className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => setIsSidebarOpen(false)}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          {/* Sidebar Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                    }`
                  }
                >
                  <Icon className="h-6 w-6 ${isSidebarOpen ? 'mr-3' : 'mr-0'} ${isSidebarOpen ? 'lg:mr-3' : 'lg:mr-0'}" />
                  <span className={`${isSidebarOpen ? 'inline' : 'hidden'} ${isSidebarOpen ? 'lg:inline' : 'lg:hidden'}`}>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className={`p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 ${isSidebarOpen ? 'lg:block' : 'hidden lg:block'}`}>
            {user ? (
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                  <AvatarImage src={user.profilePictureUrl} alt={user.username} />
                  <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
              </Avatar>
              <div className={`${isSidebarOpen ? 'block' : 'hidden'} ${isSidebarOpen ? 'lg:block' : 'lg:hidden'}`}>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.username}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 animate-pulse">
                 <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                 <div className={`${isSidebarOpen ? 'block' : 'hidden'} ${isSidebarOpen ? 'lg:block' : 'lg:hidden'} space-y-1`}>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Top navigation - Fixed on Desktop */}
      <div className={`fixed top-0 left-0 right-0 z-10 flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/20 border-b border-gray-200 dark:border-gray-700 ${isSidebarOpen ? 'lg:left-64' : 'lg:left-20'} transition-all duration-300 ease-in-out`}>
        {/* Mobile hamburger button and title (hidden on desktop) */}
        <div className="flex items-center lg:hidden w-full justify-between">
            <div className="flex items-center">
              <button
                className="p-2 -ml-2 text-gray-500 dark:text-gray-400 rounded-md hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                onClick={() => setIsSidebarOpen(true)}
                title="Menu"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
            </div>
            {/* Right-aligned content for mobile */}
            <div className="flex items-center space-x-2">
              {/* Theme Toggle */}
              <QuickThemeToggle size="sm" />

              {/* Logout Button */}
              <button
                  onClick={logout}
                  className="px-3 py-1.5 bg-red-600 dark:bg-red-500 text-white rounded-lg text-sm font-semibold shadow-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors duration-200"
              >
                  Logout
              </button>
            </div>
          </div>

        {/* Desktop toggle button and right-aligned content */}
        <div className="items-center w-full hidden lg:flex">
           {/* Desktop toggle button */}
          <button
              className="p-2 text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 mr-4 transition-colors duration-200"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title="Menu"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
          {/* Right-aligned content */}
          <div className="flex items-center space-x-4 ml-auto">
            {/* Theme Toggle */}
            <QuickThemeToggle size="sm" />

            {/* User Info (without Avatar on top bar) */}
            {user && (
            <div className="flex items-center space-x-1">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300 font-playfair">{user.username || 'User'}</span>
            </div>
            )}
            {/* Logout Button */}
            <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg text-sm font-semibold shadow-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors duration-200"
            >
                Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content area (scrollable) */}
      <div className={`flex-1 pt-16 overflow-y-auto ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} transition-all duration-300 ease-in-out`}>
        <div className="">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-900/20">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Floating AI Assistant */}
      <FloatingAIAssistant />
    </div>
  );
};

export default MainLayout;