import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaSchool, FaGraduationCap, FaCalendarAlt, FaEye, FaEyeSlash, FaBullseye } from 'react-icons/fa';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    school: '',
    level: '',
    semesterStart: '',
    semesterEnd: '',
    semesterGoals: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setMessage('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (!formData.school || !formData.level || !formData.semesterStart || !formData.semesterEnd) {
      setMessage('Please fill in school information and semester dates');
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
        navigate('/app/notes');
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
  // Multi-step UI state
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const next = () => setStep((s) => Math.min(totalSteps, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const handleFinalSubmit = async (e) => {
    await handleSubmit(e);
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-6 mb-6">
      {[1,2,3,4].map((n) => (
        <div key={n} className="flex items-center gap-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${n === step ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{n}</div>
          {n < 4 && <div className="w-12 h-px bg-gray-200" />}
        </div>
      ))}
    </div>
  );

  const StepCard = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-gray-900/50 p-8 space-y-6 border border-gray-200 dark:border-gray-700"
    >
      <StepIndicator />

      <form onSubmit={step === totalSteps ? handleFinalSubmit : (e) => { e.preventDefault(); next(); }}>
        {step === 1 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
            <input name="username" className="w-full rounded-xl py-4 px-4 bg-gray-50 dark:bg-gray-700 placeholder-gray-400" placeholder="Choose a username" value={formData.username} onChange={handleChange} required />

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
            <input name="email" type="email" className="w-full rounded-xl py-4 px-4 bg-gray-50 dark:bg-gray-700 placeholder-gray-400" placeholder="Enter your email" value={formData.email} onChange={handleChange} required />

            <div className="flex justify-end">
              <button type="button" onClick={next} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Next</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input name="password" type={showPassword ? 'text' : 'password'} className="w-full rounded-xl py-4 px-4 bg-gray-50 dark:bg-gray-700 placeholder-gray-400" placeholder="Create a password" value={formData.password} onChange={handleChange} required />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
            <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} className="w-full rounded-xl py-4 px-4 bg-gray-50 dark:bg-gray-700 placeholder-gray-400" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} required />

            <div className="flex justify-between">
              <button type="button" onClick={back} className="px-4 py-2 border rounded-md">Back</button>
              <button type="button" onClick={next} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">School</label>
            <input name="school" className="w-full rounded-xl py-4 px-4 bg-gray-50 dark:bg-gray-700 placeholder-gray-400" placeholder="Enter your school name" value={formData.school} onChange={handleChange} required />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Level/Class</label>
            <input name="level" className="w-full rounded-xl py-4 px-4 bg-gray-50 dark:bg-gray-700 placeholder-gray-400" placeholder="Enter your level/class" value={formData.level} onChange={handleChange} required />

            <div className="flex justify-between">
              <button type="button" onClick={back} className="px-4 py-2 border rounded-md">Back</button>
              <button type="button" onClick={next} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Next</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Semester Start</label>
                <input name="semesterStart" type="date" className="w-full rounded-xl py-3 px-3 bg-gray-50 dark:bg-gray-700" value={formData.semesterStart} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Semester End</label>
                <input name="semesterEnd" type="date" className="w-full rounded-xl py-3 px-3 bg-gray-50 dark:bg-gray-700" value={formData.semesterEnd} onChange={handleChange} required />
              </div>
            </div>

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Semester Goals</label>
            <textarea name="semesterGoals" rows="3" className="w-full rounded-xl py-3 px-3 bg-gray-50 dark:bg-gray-700" placeholder="What are your goals for this semester? (optional)" value={formData.semesterGoals} onChange={handleChange} />

            {message && <div className="text-sm text-red-600">{message}</div>}

            <div className="flex justify-between items-center">
              <button type="button" onClick={back} className="px-4 py-2 border rounded-md">Back</button>
              <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-md">Create account</button>
            </div>
          </div>
        )}
      </form>
    </motion.div>
  );


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full space-y-8"
      >
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-4xl font-extrabold text-gray-900 dark:text-gray-100"
          >
            Create your account
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-2 text-sm text-gray-600"
          >
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              Sign in
            </Link>
          </motion.p>
        </div>

  {StepCard()}
      </motion.div>
    </div>
  );
} 