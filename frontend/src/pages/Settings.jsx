import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaSchool, FaGraduationCap, FaImage } from 'react-icons/fa';
import api from '../utils/axios';
import { toast } from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';
import CourseTopicsManager from '../components/CourseTopicsManager';


import {
  UserCircleIcon,
  SunIcon,
  TrashIcon,
  ArrowPathIcon,
  XMarkIcon,
  AcademicCapIcon,
  PlusIcon,
  PencilIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';


const Settings = () => {
  const navigate = useNavigate();
  const { userId, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  // State for profile fields
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    school: '',
    class: '',
    level: '',
    semesterGoals: ''
  });

  const [courses, setCourses] = useState([]);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [courseForm, setCourseForm] = useState({
    name: '',
    code: '',
    semester: '',
    schedule: [{ day: 'Monday', startTime: '', endTime: '', location: '' }]
  });

  // State for messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processing, setProcessing] = useState(false);



  useEffect(() => {
    fetchUserProfile();
    fetchCourses();
  }, [userId]);
  

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/auth/me');
      const fetchedUserData = response.data;
      
      // Populate profile form data
      setFormData({
        username: fetchedUserData.username || '',
        email: fetchedUserData.email || '',
        school: fetchedUserData.school || '',
        class: fetchedUserData.class || '',
        level: fetchedUserData.level || '',
        semesterGoals: fetchedUserData.semesterGoals || ''
      });
      setPreviewUrl(fetchedUserData.profilePictureUrl || '');


    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('/api/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      // setError(error.message); // Decide if you want a global error for courses
    }
  };
  


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!formData.username.trim()) {
      toast.error('Username is required.');
      return;
    }
     if (!formData.email.trim()) {
      toast.error('Email is required.');
        return;
      }

    try {
      setSaving(true);
      setError(''); // Clear previous errors
      setSuccess(''); // Clear previous success messages

      // Upload profile picture if changed
      let profilePictureUrl = previewUrl;
      if (profilePicture) {
        const formDataImage = new FormData();
        formDataImage.append('profilePicture', profilePicture);
        const uploadResponse = await api.post('/api/users/me/profile-picture', formDataImage, {
        headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
         profilePictureUrl = uploadResponse.data.profilePictureUrl; // Get the URL from the upload response
      }

      // Update profile information including the potentially new picture URL
      await api.put('/api/users/me', { ...formData, profilePicture: profilePictureUrl });
      toast.success('Profile updated successfully!');

    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile.';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };
















  const handleAddSchedule = () => {
    setCourseForm({
      ...courseForm,
      schedule: [...courseForm.schedule, { day: 'Monday', startTime: '', endTime: '', location: '' }]
    });
  };

  const handleRemoveSchedule = (index) => {
    const newSchedule = courseForm.schedule.filter((_, i) => i !== index);
    setCourseForm({
      ...courseForm,
      schedule: newSchedule
    });
  };

  const handleScheduleChange = (index, field, value) => {
    const newSchedule = [...courseForm.schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setCourseForm({
      ...courseForm,
      schedule: newSchedule
    });
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      setProcessing(true);
      setError('');
      setSuccess('');

      // Validate schedule times
      const hasInvalidSchedule = courseForm.schedule.some(slot => {
        if (!slot.startTime || !slot.endTime) return true;
        return new Date(`2000-01-01T${slot.startTime}`) >= new Date(`2000-01-01T${slot.endTime}`);
      });

      if (hasInvalidSchedule) {
        setError('Please ensure all schedule times are valid and end time is after start time');
        return;
      }

      const url = editingCourse 
        ? `/api/courses/${editingCourse._id}`
        : '/api/courses';
      
      const method = editingCourse ? 'PUT' : 'POST';

      const response = await api({
        method,
        url,
        data: courseForm
      });


      setSuccess(editingCourse ? 'Course updated successfully' : 'Course added successfully');
      setShowAddCourse(false);
      setEditingCourse(null);
      setCourseForm({
        name: '',
        code: '',
        semester: '',
        schedule: [{ day: 'Monday', startTime: '', endTime: '', location: '' }]
      });
      fetchCourses();
    } catch (error) {
      console.error('Course submission error:', error);
      setError(error.response?.data?.message || 'Failed to save course');
    } finally {
      setProcessing(false);
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      name: course.name,
      code: course.code,
      semester: course.semester,
      schedule: course.schedule || [] // Ensure schedule is an array
    });
    setShowAddCourse(true);
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      setProcessing(true);
      setError('');
      setSuccess('');

      await api.delete(`/api/courses/${courseId}`);

      setSuccess('Course deleted successfully');
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      setError(error.response?.data?.message || 'Failed to delete course');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Settings</h1>

        {/* Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/20 overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">Profile Settings</h2>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0 relative">
                    <img
                      className="h-20 w-20 rounded-full object-cover"
                      src={previewUrl || 'https://via.placeholder.com/150'} // Placeholder image
                      alt="Profile"
                    />
                    {/* Edit button overlay */}
          <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1.5 shadow-md hover:bg-blue-700 transition-colors"
                      aria-label="Change profile picture"
          >
                      <PencilIcon className="h-4 w-4 text-white" />
          </button>
                     <input
                       type="file"
                       ref={fileInputRef}
                       className="sr-only"
                       onChange={handleProfilePictureChange}
                       accept="image/*"
                     />
        </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Change Profile Picture</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Upload a new avatar for your profile.</p>
                  </div>
                </div>

                {/* Username Input */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
              <input
                type="text"
                    name="username"
                    id="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
              <input
                type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>


                {/* School, Class, Level */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <label htmlFor="school" className="block text-sm font-medium text-gray-700 dark:text-gray-300">School</label>
                    <input
                      type="text"
                      name="school"
                      id="school"
                      value={formData.school}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="class" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Class</label>
                    <input
                      type="text"
                      name="class"
                      id="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Level</label>
                    <input
                      type="text"
                      name="level"
                      id="level"
                      value={formData.level}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                {/* Semester Goals */}
                <div>
                  <label htmlFor="semesterGoals" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Semester Goals</label>
                  <textarea
                    name="semesterGoals"
                    id="semesterGoals"
                    rows="3"
                    value={formData.semesterGoals}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="What are your goals for this semester?"
                  ></textarea>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Share your academic goals for this semester (optional)
                  </p>
                </div>


                {/* Save Button and Status */}
                <div className="pt-4">
                  {error && (
                    <div className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</div>
                  )}
                  {success && (
                    <div className="mb-4 text-sm text-green-600 dark:text-green-400">{success}</div>
                  )}
            <button
              type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                    {saving ? 'Saving...' : 'Save Changes'}
            </button>
                </div>
          </form>
            )}
          </div>
        </div>



        {/* Theme Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6 mt-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-gray-100">
            <SunIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
            Theme Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Theme</span>
              <ThemeToggle showLabels={false} />
            </div>
          </div>
        </div>


        {/* Course Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/20 p-6 space-y-4 mt-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center text-gray-900 dark:text-gray-100"><AcademicCapIcon className="w-5 h-5 mr-2" /> Course Management</h2>
            <button
              onClick={() => {
                setShowAddCourse(true);
                setEditingCourse(null);
                setCourseForm({
                  name: '',
                  code: '',
                  semester: '',
                  schedule: [{ day: 'Monday', startTime: '', endTime: '', location: '' }]
                });
              }}
              className="px-4 py-2 text-sm bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition-colors duration-200"
            >
              <PlusIcon className="w-4 h-4 inline-block mr-2" />
              Add Course
            </button>
          </div>

          {showAddCourse && (
            <form onSubmit={handleCourseSubmit} className="mb-6 p-4 border border-gray-300 dark:border-gray-600 rounded-lg space-y-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Course Name</label>
                  <input
                    type="text"
                  name="name"
                    value={courseForm.name}
                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Course Code</label>
                  <input
                    type="text"
                  name="code"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Semester</label>
                  <input
                    type="text"
                  name="semester"
                    value={courseForm.semester}
                    onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
              </div>

              <div className="mt-4">
                <h3 className="text-md font-semibold mb-2 text-gray-900 dark:text-gray-100">Class Schedule</h3>
                {courseForm.schedule.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2 items-center">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Day</label>
                      <select
                        name="day"
                        value={item.day}
                        onChange={(e) => handleScheduleChange(index, 'day', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Time</label>
                      <input
                        type="time"
                        name="startTime"
                        value={item.startTime}
                        onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Time</label>
                      <input
                        type="time"
                        name="endTime"
                        value={item.endTime}
                        onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={item.location}
                        onChange={(e) => handleScheduleChange(index, 'location', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Room/Location"
                        required
                      />
                    </div>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSchedule(index)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddSchedule}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Another Schedule
                </button>
              </div>

              <div className="flex justify-end space-x-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddCourse(false)}
                  className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {processing ? 'Saving...' : editingCourse ? 'Update Course' : 'Add Course'}
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 flex justify-between items-center">
                    <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{course.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{course.code} • {course.semester}</p>
                    {course.schedule && course.schedule.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <strong>Schedule:</strong>
                        {course.schedule.map((slot, slotIndex) => (
                          <span key={slotIndex} className="mr-2">
                            {slot.day}: {slot.startTime} - {slot.endTime} {slot.location && `(${slot.location})`}
                          </span>
                        ))}
                      </div>
                    )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          // Set selected course for topics management
                          setSelectedCourseId(course._id);
                        }}
                        className="p-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors duration-200"
                        title="Manage Topics"
                      >
                        <BookOpenIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEditCourse(course)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200"
                      title="Edit Course"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course._id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-200"
                        title="Delete Course"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No courses added yet. Click "Add Course" to get started.
              </div>
            )}
          </div>
        </div>


      </div>
      
      {/* Course Topics Management */}
      {selectedCourseId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-gray-900/50 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {courses.find(c => c._id === selectedCourseId)?.name} - Topics Management
                </h2>
                <button
                  onClick={() => setSelectedCourseId(null)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <CourseTopicsManager courseId={selectedCourseId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;