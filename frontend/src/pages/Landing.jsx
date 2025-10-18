import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Respect user reduced motion preference
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    try { mq.addEventListener('change', onChange); } catch (e) { mq.addListener(onChange); }

    // Simple reveal animation for sections (if not reduced motion)
    if (!mq.matches) {
      const reveals = Array.from(document.querySelectorAll('[data-reveal]'));
      reveals.forEach((el, i) => {
        el.classList.add('opacity-0', 'translate-y-6');
        setTimeout(() => {
          el.classList.add('transition', 'duration-700', 'ease-out');
          el.classList.remove('opacity-0', 'translate-y-6');
        }, 150 + i * 120);
      });
    }

    return () => { try { mq.removeEventListener('change', onChange); } catch (e) { mq.removeListener(onChange); } };
  }, []);

  return (
    <div className={`min-h-screen bg-background-light dark:bg-background-dark font-montserrat text-text-light dark:text-text-dark ${reducedMotion ? 'reduced-motion' : ''}`}>
      <style>{`.reduced-motion * { animation: none !important; transition: none !important; }`}</style>

      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 dark:border-gray-700 px-4 sm:px-10 py-3 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm z-50">
        <div className="flex items-center gap-4 text-primary">
          <div className="size-8">
            <svg fill="currentColor" viewbox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clip-rule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill-rule="evenodd"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">Student Buddy</h2>
        </div>
        <div className="hidden md:flex flex-1 justify-center items-center gap-9">
          <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full">BETA TESTING</span>
        </div>
        <div className="flex gap-2">
          <Link to="/login" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-transparent border border-primary text-primary text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/10 transition-colors">
            <span className="truncate">Login</span>
          </Link>
          <Link to="/register" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors">
            <span className="truncate">Sign Up</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-col gap-16 md:gap-24 py-16 md:py-24 px-4 sm:px-10">
        <div className="@container">
          <div className="@[480px]:p-4">
            <div className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-center justify-center p-4" data-alt="Abstract gradient background" style={{backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(44, 82, 130, 0.5) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAXIifyafe-94K-DRojvMFW9J3wnfrdVLO3xULLZOyC1cHnLCsQgd7aOMAJWSNnCOZcHIKdvRcGZDbjapgkJFiCEiVY8eA6DWuZZJsVxxG421bfrk8wXnXUgWMyypCjJbbn7IaH2M_SKX3WI2rX0gq0Ws0m5SfxlJFFygmfxWOoOqg8OUbxlnOQiHuVrdceYa8Km7C1DUO7FvIHZzGq08Spv95KwVxzz6yutJc-gxSBBCmt7K2HgM4PDB3PsxHTV6tFUQZN33RQ48E")'}}>
              <div className="flex flex-col gap-4 text-center">
                <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl">
                  Test Student Buddy - AI-Powered Study Assistant
                </h1>
                <h2 className="text-white/90 text-lg font-normal leading-normal @[480px]:text-xl max-w-3xl mx-auto">
                  Experience our complete AI study system designed to help you learn smarter.
                </h2>
              </div>
              <div className="flex-wrap gap-3 flex justify-center">
                <Link to="/register" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-secondary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-secondary/90 transition-colors">
                  <span className="truncate">Start Testing Now</span>
                </Link>
                <a href="#features" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-white/20 border border-white text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-white/30 transition-colors">
                  <span className="truncate">View Features</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div id="features" className="flex flex-col gap-10 @container">
          <div className="flex flex-col gap-4 text-center">
            <h1 className="text-text-light dark:text-text-dark tracking-tight text-3xl font-bold leading-tight @[480px]:text-4xl @[480px]:font-black">
              All the features you need to succeed
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg font-normal leading-normal max-w-3xl mx-auto">
              Student Buddy is a comprehensive AI study system with a wide range of features to help you learn smarter.
            </p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
            <div className="flex flex-col gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark p-6 transition-all hover:shadow-lg hover:-translate-y-1">
              <span className="material-symbols-outlined text-secondary text-2xl">description</span>
              <div className="flex flex-col gap-1">
                <h2 className="text-text-light dark:text-text-dark text-lg font-bold leading-tight">AI Note Processing</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-normal leading-normal">Upload your notes and let our AI create summaries and key takeaways.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark p-6 transition-all hover:shadow-lg hover:-translate-y-1">
              <span className="material-symbols-outlined text-secondary text-2xl">quiz</span>
              <div className="flex flex-col gap-1">
                <h2 className="text-text-light dark:text-text-dark text-lg font-bold leading-tight">Intelligent Quiz Generation</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-normal leading-normal">Generate personalized quizzes from your study materials.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark p-6 transition-all hover:shadow-lg hover:-translate-y-1">
              <span className="material-symbols-outlined text-secondary text-2xl">checklist</span>
              <div className="flex flex-col gap-1">
                <h2 className="text-text-light dark:text-text-dark text-lg font-bold leading-tight">Practice Exams</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-normal leading-normal">Simulate real exam conditions to test your knowledge.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark p-6 transition-all hover:shadow-lg hover:-translate-y-1">
              <span className="material-symbols-outlined text-secondary text-2xl">monitoring</span>
              <div className="flex flex-col gap-1">
                <h2 className="text-text-light dark:text-text-dark text-lg font-bold leading-tight">Progress Tracking</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-normal leading-normal">Monitor your learning journey and identify areas for improvement.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4 text-center">
            <h1 className="text-text-light dark:text-text-dark tracking-tight text-3xl font-bold leading-tight @[480px]:text-4xl @[480px]:font-black">
              How It Works
            </h1>
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-x-4 md:gap-x-8">
            <div className="flex flex-col items-center gap-2 pt-2">
              <div className="flex items-center justify-center size-12 rounded-full bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-primary text-2xl">upload_file</span>
              </div>
              <div className="w-[2px] bg-gray-200 dark:bg-gray-700 grow"></div>
            </div>
            <div className="flex flex-1 flex-col py-3 pb-8">
              <p className="text-text-light dark:text-text-dark text-lg font-bold leading-normal">Upload/Create Notes</p>
              <p className="text-gray-600 dark:text-gray-400 text-base font-normal leading-normal">Start by adding your study materials.</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-[2px] bg-gray-200 dark:bg-gray-700 h-2"></div>
              <div className="flex items-center justify-center size-12 rounded-full bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-primary text-2xl">auto_awesome</span>
              </div>
              <div className="w-[2px] bg-gray-200 dark:bg-gray-700 grow"></div>
            </div>
            <div className="flex flex-1 flex-col py-3 pb-8">
              <p className="text-text-light dark:text-text-dark text-lg font-bold leading-normal">AI Analysis</p>
              <p className="text-gray-600 dark:text-gray-400 text-base font-normal leading-normal">Our AI processes your content to understand key concepts.</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-[2px] bg-gray-200 dark:bg-gray-700 h-2"></div>
              <div className="flex items-center justify-center size-12 rounded-full bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-primary text-2xl">school</span>
              </div>
              <div className="w-[2px] bg-gray-200 dark:bg-gray-700 grow"></div>
            </div>
            <div className="flex flex-1 flex-col py-3 pb-8">
              <p className="text-text-light dark:text-text-dark text-lg font-bold leading-normal">Practice & Learn</p>
              <p className="text-gray-600 dark:text-gray-400 text-base font-normal leading-normal">Use our tools to test your knowledge and reinforce learning.</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-[2px] bg-gray-200 dark:bg-gray-700 h-2"></div>
              <div className="flex items-center justify-center size-12 rounded-full bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-primary text-2xl">show_chart</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col py-3">
              <p className="text-text-light dark:text-text-dark text-lg font-bold leading-normal">Track Progress</p>
              <p className="text-gray-600 dark:text-gray-400 text-base font-normal leading-normal">See how you're improving over time.</p>
            </div>
          </div>
        </div>

        <div className="p-4 @container">
          <div className="flex flex-1 flex-col items-start justify-between gap-4 rounded-xl border border-primary/30 bg-primary/10 dark:bg-primary/20 p-6 @[480px]:flex-row @[480px]:items-center">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-primary text-3xl">info</span>
              <div className="flex flex-col gap-1">
                <p className="text-primary text-lg font-bold leading-tight">Beta Testing Notice</p>
                <p className="text-primary/80 text-base font-normal leading-normal">
                  Welcome to the Student Buddy beta! This is a fully functional version of our platform. We're looking for your feedback to help us improve.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 text-center bg-white dark:bg-background-dark rounded-xl p-8 md:p-12 border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-text-light dark:text-text-dark">Ready to revolutionize your studying?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Join our beta and be among the first to experience the future of learning.</p>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Link to="/register" className="flex min-w-[180px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors">
              <span className="truncate">Access Full System</span>
            </Link>
            <Link to="/app/active-learning" className="flex min-w-[180px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-secondary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-secondary/90 transition-colors">
              <span className="truncate">Try AI Quiz Generator</span>
            </Link>
            <Link to="/app/notes" className="flex min-w-[180px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-transparent border border-primary text-primary text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/10 transition-colors">
              <span className="truncate">Explore OCR Support</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-700 py-8 px-4 sm:px-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">© 2025 Student Buddy. All rights reserved.</p>
          <div className="flex gap-4">
            {/* Social Media Icons */}
          </div>
          <Link to="/register" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors">
            <span className="truncate">Sign Up for Beta</span>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
