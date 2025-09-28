import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaSchool, FaGraduationCap, FaCalendarAlt, FaEye, FaEyeSlash, FaClock, FaWhatsapp, FaTwitter, FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa';

export default function Register() {
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    // Page 1 data
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    school: '',
    level: '',
    semesterStart: '',
    semesterEnd: '',
    // Page 2 data
    freeTime: {
      startTime: '',
      endTime: ''
    },
    bio: '',
    socialLinks: {
      whatsapp: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      github: ''
    }
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showMoreSocials, setShowMoreSocials] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFreeTimeChange = (field, value) => {
    setFormData({
      ...formData,
      freeTime: {
        ...formData.freeTime,
        [field]: value
      }
    });
  };

  const handleSocialLinkChange = (platform, value) => {
    let processedValue = value;
    
    // Process WhatsApp number to ensure proper format
    if (platform === 'whatsapp') {
      // Remove any non-digit characters
      processedValue = value.replace(/\D/g, '');
      // Remove any leading zeros
      processedValue = processedValue.replace(/^0+/, '');
    }
    
    setFormData({
      ...formData,
      socialLinks: {
        ...formData.socialLinks,
        [platform]: processedValue
      }
    });
  };

  const handleNextPage = () => {
    // Validate first page data
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setMessage('Please fill in all required fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    setCurrentPage(2);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Add validation for Page 2 fields
    if (!formData.school || !formData.level || !formData.semesterStart || !formData.semesterEnd) {
      setMessage('Please fill in all required fields on this page.');
      return;
    }

    console.log('Submitting form data:', formData);

    setIsLoading(true);
    setMessage('');

    try {
      const apiUrl = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/auth/register`;
      console.log('Making fetch request to:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Fetch response received:', response);

      const data = await response.json();

      console.log('Response data:', data);

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        navigate('/app/dashboard');
      } else {
        setMessage(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration fetch error:', error);
      setMessage('Cannot connect to server or an error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200";

  const renderPage1 = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-gray-900/50 p-8 space-y-6 border border-gray-200 dark:border-gray-700"
    >
      <form className="space-y-6">
        <div className="space-y-4">
          {/* Username */}
            <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                className={inputClasses}
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            </div>

          {/* Email */}
            <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={inputClasses}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className={inputClasses}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                className={inputClasses}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-red-50 p-4"
            >
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{message}</h3>
                </div>
              </div>
            </motion.div>
          )}

            <div>
            <button
              type="button"
              onClick={handleNextPage}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              disabled={isLoading}
            >
              Next
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );

  const renderPage2 = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mt-8 bg-white rounded-2xl shadow-xl p-8 space-y-6"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* School */}
          <div>
            <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-2">
                School
              </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSchool className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="school"
                name="school"
                type="text"
                required
                className={inputClasses}
                placeholder="Enter your school name"
                value={formData.school}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            </div>

          {/* Level */}
            <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                Level/Class
              </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaGraduationCap className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="level"
                name="level"
                type="text"
                required
                className={inputClasses}
                placeholder="Enter your level/class"
                value={formData.level}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            </div>

          {/* Semester Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
              <label htmlFor="semesterStart" className="block text-sm font-medium text-gray-700 mb-2">
                Semester Start
                </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="semesterStart"
                  name="semesterStart"
                  type="date"
                  required
                  className={inputClasses}
                  value={formData.semesterStart}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              </div>

              <div>
              <label htmlFor="semesterEnd" className="block text-sm font-medium text-gray-700 mb-2">
                Semester End
                </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="semesterEnd"
                  name="semesterEnd"
                  type="date"
                  required
                  className={inputClasses}
                  value={formData.semesterEnd}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              </div>
            </div>

          {/* Bio */}
            <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Bio
              </label>
            <textarea
              id="bio"
              name="bio"
              rows="3"
              className={inputClasses}
              placeholder="Tell us about yourself"
              value={formData.bio}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

          {/* Free Time Preferences */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FaClock className="mr-2" />
              Free Time Preferences
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Set your preferred study time. This will be used as default in your planner.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  id="startTime"
                  value={formData.freeTime.startTime}
                  onChange={(e) => handleFreeTimeChange('startTime', e.target.value)}
                  className={inputClasses}
                  placeholder="Start time"
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  id="endTime"
                  value={formData.freeTime.endTime}
                  onChange={(e) => handleFreeTimeChange('endTime', e.target.value)}
                  className={inputClasses}
                  placeholder="End time"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Social Links</h3>
            <div className="space-y-4">
              {/* Default Social Links */}
              <div>
                <label htmlFor="whatsapp" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaWhatsapp className="mr-2 text-green-500" />
                  WhatsApp
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">https://wa.me/</span>
                  </div>
                  <input
                    id="whatsapp"
                    type="text"
                    className={`${inputClasses} pl-[120px]`}
                    placeholder="Your WhatsApp number (e.g., 1234567890)"
                    value={formData.socialLinks.whatsapp}
                    onChange={(e) => handleSocialLinkChange('whatsapp', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Enter your number with country code (e.g., 1234567890)
                </p>
                {formData.socialLinks.whatsapp && (
                  <a 
                    href={`https://wa.me/${formData.socialLinks.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-sm text-green-600 hover:text-green-500 flex items-center"
                  >
                    <FaWhatsapp className="mr-1" />
                    Test WhatsApp Link
                  </a>
                )}
              </div>
              <div>
                <label htmlFor="twitter" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaTwitter className="mr-2 text-blue-400" />
                  Twitter/X
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">@</span>
                  </div>
                  <input
                    id="twitter"
                    type="text"
                    className={`${inputClasses} pl-8`}
                    placeholder="Your Twitter/X handle (without @)"
                    value={formData.socialLinks.twitter}
                    onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Enter your handle without @ symbol
                </p>
              </div>

              {/* Show More Social Links Button */}
              <button
                type="button"
                onClick={() => setShowMoreSocials(!showMoreSocials)}
                className="text-sm text-blue-600 hover:text-blue-500 focus:outline-none flex items-center"
              >
                {showMoreSocials ? 'Show Less' : 'Add More Socials'}
                <svg 
                  className={`ml-1 h-4 w-4 transform transition-transform ${showMoreSocials ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Additional Social Links */}
              {showMoreSocials && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="instagram" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FaInstagram className="mr-2 text-pink-500" />
                      Instagram
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">@</span>
                      </div>
                      <input
                        id="instagram"
                        type="text"
                        className={`${inputClasses} pl-8`}
                        placeholder="Your Instagram handle (without @)"
                        value={formData.socialLinks.instagram}
                        onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="linkedin" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FaLinkedin className="mr-2 text-blue-600" />
                      LinkedIn
                    </label>
                    <input
                      id="linkedin"
                      type="text"
                      className={inputClasses}
                      placeholder="Your LinkedIn profile URL"
                      value={formData.socialLinks.linkedin}
                      onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
            <div>
                    <label htmlFor="github" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FaGithub className="mr-2 text-gray-800" />
                      GitHub
              </label>
              <input
                      id="github"
                      type="text"
                      className={inputClasses}
                      placeholder="Your GitHub profile URL"
                      value={formData.socialLinks.github}
                      onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                disabled={isLoading}
              />
                  </div>
                </div>
              )}
            </div>
            </div>

            {message && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-red-50 p-4"
            >
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{message}</h3>
                </div>
              </div>
            </motion.div>
            )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back
            </button>
              <button
                type="submit"
              className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                disabled={isLoading}
              >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
              </button>
          </div>
            </div>
          </form>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-4xl font-extrabold text-gray-900 dark:text-gray-100"
          >
            {currentPage === 1 ? 'Create your account' : 'Additional Information'}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-2 text-sm text-gray-600"
          >
            {currentPage === 1 ? (
              <>
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  Sign in
                </Link>
              </>
            ) : (
              'Step 2 of 2'
            )}
          </motion.p>
        </div>

        {currentPage === 1 ? renderPage1() : renderPage2()}
      </motion.div>
    </div>
  );
} 