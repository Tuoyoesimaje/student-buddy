import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Small inline icon set (keeps landing self-contained and avoids font issues)
const Icon = ({ name, className = '' }) => {
  const common = { width: 24, height: 24, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'school':
      return (
        <svg className={className} viewBox="0 0 24 24" {...common}><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17a8 8 0 0 0 20 0" /></svg>
      );
    case 'description':
      return (
        <svg className={className} viewBox="0 0 24 24" {...common}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
      );
    case 'sparkles':
    case 'auto_awesome':
      return (
        <svg className={className} viewBox="0 0 24 24" {...common}><path d="M12 2l1.5 3L17 7l-3 1.5L12 12l-1.5-3L7 7l3.5-2L12 2z" /><path d="M4 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" /></svg>
      );
    case 'style':
      return (
        <svg className={className} viewBox="0 0 24 24" {...common}><path d="M3 21l3-3 11-11 3-3 4 4-3 3L6 21H3z" /></svg>
      );
    case 'donut':
    case 'donut_large':
      return (
        <svg className={className} viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="14" stroke="currentColor" strokeWidth="3" opacity="0.15" /><circle cx="18" cy="18" r="14" stroke="currentColor" strokeWidth="3" strokeDasharray="85 100" strokeLinecap="round" /></svg>
      );
    case 'arrow_right':
    case 'arrow_forward':
      return (
        <svg className={className} viewBox="0 0 24 24" {...common}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
      );
    case 'bolt':
      return (
        <svg className={className} viewBox="0 0 24 24" {...common}><path d="M13 2L3 14h7l-1 8L21 10h-7l-1-8z" /></svg>
      );
    case 'feed':
      return (
        <svg className={className} viewBox="0 0 24 24" {...common}><path d="M4 7a13 13 0 0 1 13 13" /><path d="M4 12a8 8 0 0 1 8 8" /><circle cx="6" cy="18" r="1" fill="currentColor" /></svg>
      );
    case 'task_alt':
      return (
        <svg className={className} viewBox="0 0 24 24" {...common}><path d="M20 6L9 17l-5-5" /></svg>
      );
    case 'trending_up':
      return (
        <svg className={className} viewBox="0 0 24 24" {...common}><path d="M3 17l6-6 4 4 8-8" /><path d="M21 7v6h-6" /></svg>
      );
    case 'upload_file':
      return (
        <svg className={className} viewBox="0 0 24 24" {...common}><path d="M12 3v12" /><path d="M8 7l4-4 4 4" /><path d="M4 21h16" /></svg>
      );
    case 'model_training':
      return (
        <svg className={className} viewBox="0 0 24 24" {...common}><circle cx="12" cy="8" r="3" /><path d="M12 11v6" /><path d="M6 21v-4" /><path d="M18 21v-4" /></svg>
      );
    case 'monitoring':
      return (
        <svg className={className} viewBox="0 0 24 24" {...common}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8" /></svg>
      );
    case 'check_circle':
      return (
        <svg className={className} viewBox="0 0 24 24" {...common}><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" /></svg>
      );
    case 'arrow_upward':
      return (
        <svg className={className} viewBox="0 0 24 24" {...common}><path d="M12 19V6" /><path d="M5 12l7-7 7 7" /></svg>
      );
    case 'more_horiz':
      return (
        <svg className={className} viewBox="0 0 24 24" {...common}><path d="M6 12h.01M12 12h.01M18 12h.01" strokeLinecap="round" /></svg>
      );
    default:
      return <svg className={className} viewBox="0 0 24 24" {...common}><circle cx="12" cy="12" r="10" /></svg>;
  }
};

const Landing = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Respect user reduced motion preference
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    try { mq.addEventListener('change', onChange); } catch (e) { mq.addListener(onChange); }

    // NOTE: Theme is controlled by ThemeProvider. Landing will not mutate root theme class.

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
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 font-montserrat text-gray-900 dark:text-gray-100 ${reducedMotion ? 'reduced-motion' : ''}`}>
      <style>{`.reduced-motion * { animation: none !important; transition: none !important; }`}</style>

      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Icon name="school" className="text-primary text-3xl w-8 h-8" />
              <h2 className="text-gray-900 dark:text-gray-100 text-xl font-bold">Student Buddy</h2>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a className="text-sm font-medium hover:text-primary" href="#features">Features</a>
              <a className="text-sm font-medium hover:text-primary" href="#how">How it works</a>
              <a className="text-sm font-medium hover:text-primary" href="#research">Research</a>
              <a className="text-sm font-medium hover:text-primary" href="#tracker">Tracker</a>
              <a className="text-sm font-medium hover:text-primary" href="#demo">Demo</a>
            </nav>
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium hover:text-primary">Login</Link>
              <Link to="/register" className="flex min-w-[84px] items-center justify-center rounded-full h-10 px-6 bg-primary text-white text-sm font-bold transition-transform duration-300 hover:scale-105 shadow-sm">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 md:py-32" data-reveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
              Make every study session count — <br className="hidden md:block"/> automatic quizzes from your own notes
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-700 dark:text-gray-300">
              Turn notes into targeted practice tests and track your improvement — backed by learning science.
            </p>

            <div className="mt-10 flex justify-center gap-4">
              <Link to="/register" className="flex min-w-[120px] items-center justify-center rounded-full h-12 px-8 bg-primary text-white text-base font-bold transition-transform duration-300 hover:scale-105">
                Get Started
              </Link>
              <button className="flex min-w-[120px] items-center justify-center rounded-full h-12 px-8 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-base font-bold transition-transform duration-300 hover:scale-105">
                Learn More
              </button>
            </div>

            <div className="mt-16 flex justify-center items-center gap-4 md:gap-8 text-gray-700 dark:text-gray-300">
              <div className="flex flex-col items-center gap-2">
                <Icon name="description" className="w-10 h-10" />
                <p className="text-sm font-medium">Notes</p>
              </div>
              <Icon name="arrow_forward" className="w-6 h-6 text-gray-400" />
              <div className="flex flex-col items-center gap-2">
                <Icon name="auto_awesome" className="w-10 h-10" />
                <p className="text-sm font-medium">AI</p>
              </div>
              <Icon name="arrow_forward" className="w-6 h-6 text-gray-400" />
              <div className="flex flex-col items-center gap-2">
                <Icon name="style" className="w-10 h-10" />
                <p className="text-sm font-medium">Quiz Cards</p>
              </div>
              <Icon name="arrow_forward" className="w-6 h-6 text-gray-400" />
              <div className="flex flex-col items-center gap-2">
                <Icon name="donut_large" className="w-10 h-10" />
                <p className="text-sm font-medium">Score Ring</p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-white dark:bg-gray-800" data-reveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Unlock Your Potential</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-700 dark:text-gray-300">Student Buddy offers a suite of features designed to enhance your learning experience.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard icon="bolt" title="Instant Quizzes" copy="Generate practice quizzes from your notes in seconds." />
              <FeatureCard icon="feed" title="Grounded in Your Notes" copy="Questions are based entirely on your course material." />
              <FeatureCard icon="task_alt" title="AI-Graded Feedback" copy="Get immediate feedback on your performance." />
              <FeatureCard icon="trending_up" title="Track Progress" copy="Monitor your improvement over time with our tracker." />
            </div>
          </div>
        </section>

        <section id="how" className="py-20" data-reveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-700 dark:text-gray-300">A simple, three-step process to supercharge your studies.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <HowStep icon="upload_file" title="1. Import Notes" copy="Easily upload your class notes in various formats." />
              <HowStep icon="model_training" title="2. Generate & Practice" copy="Our AI will create a customized quiz for you." />
              <HowStep icon="monitoring" title="3. Track Improvement" copy="See your scores and track your learning progress." />
            </div>
          </div>
        </section>

        <section id="tracker" className="py-20 bg-white dark:bg-gray-800" data-reveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold">Your Personal Assessment Tracker</h2>
                <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Visualize your learning journey. Our tracker provides detailed insights into your performance, helping you identify strengths and weaknesses to focus your efforts effectively.</p>
                <button className="mt-8 flex min-w-[120px] items-center justify-center rounded-full h-12 px-8 bg-primary text-white text-base font-bold transition-transform duration-300 hover:scale-105">Explore the Tracker</button>
              </div>
              <div className="p-8 bg-white dark:bg-gray-900 rounded-xl shadow-2xl shadow-primary/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">Progress Overview</h3>
                  <Icon name="more_horiz" className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative w-40 h-40">
                    <Icon name="donut_large" className="w-full h-full text-gray-300" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">85%</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Average Score</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <Icon name="arrow_upward" className="w-5 h-5 text-green-500" />
                      <span className="font-bold text-green-500">+5.2%</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">vs. last week</span>
                    </div>
                    <div>
                      <h4 className="font-bold mb-2 text-gray-900 dark:text-gray-100">Recent Quizzes</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center justify-between"><span>Cell Biology</span> <span className="font-medium text-green-500">92%</span></li>
                        <li className="flex items-center justify-between"><span>Organic Chemistry</span><span className="font-medium text-red-500">78%</span></li>
                        <li className="flex items-center justify-between"><span>Literary Theory</span><span className="font-medium text-green-500">88%</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="research" className="py-20" data-reveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold">Research &amp; Validation</h2>
              <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Our methods are grounded in proven learning science to ensure you're studying effectively.</p>
            </div>
            <div className="mt-12 max-w-3xl mx-auto space-y-8">
              <ResearchItem title="Active Recall" cite="Roediger & Karpicke (2006). Test-Enhanced Learning. Psychological Science.">Generating answers to questions, rather than passively reviewing notes, strengthens memory and understanding. Student Buddy is built on this principle.</ResearchItem>
              <ResearchItem title="Spaced Repetition" cite="Cepeda et al. (2008). Spacing effects in learning: Psychological Science.">Reviewing information at increasing intervals over time is proven to improve long-term retention. Our tracker helps you schedule your practice sessions.</ResearchItem>
              <ResearchItem title="Immediate Feedback" cite="Butler & Roediger (2008). Feedback-enhanced learning.">Corrective feedback right after a test is crucial for learning from mistakes and reinforcing correct knowledge.</ResearchItem>
            </div>
          </div>
        </section>

        <footer className="bg-gray-900">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center text-gray-400">
            <div className="flex justify-center gap-6 mb-8">
              <a className="text-sm hover:text-white" href="#">Privacy Policy</a>
              <a className="text-sm hover:text-white" href="#">Terms of Service</a>
              <a className="text-sm hover:text-white" href="#">Contact Us</a>
            </div>
            <p className="text-sm">© 2024 Student Buddy. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

const FeatureCard = ({ icon, title, copy }) => (
  <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
    <div className="text-primary text-3xl"><Icon name={icon} className="w-8 h-8" /></div>
    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
    <p className="text-sm text-gray-700 dark:text-gray-300">{copy}</p>
  </div>
);

const HowStep = ({ icon, title, copy }) => (
  <div className="flex flex-col items-center gap-4">
    <div className="w-48 h-48 bg-primary/10 rounded-full flex items-center justify-center">
      <Icon name={icon} className="w-12 h-12 text-primary" />
    </div>
    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</p>
    <p className="text-gray-700 dark:text-gray-300">{copy}</p>
  </div>
);

const ResearchItem = ({ title, cite, children }) => (
  <div className="flex items-start gap-4">
    <Icon name="check_circle" className="w-6 h-6 text-primary mt-1" />
    <div>
      <p className="text-gray-900 dark:text-gray-100"><strong>{title}:</strong> {children}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{cite}</p>
    </div>
  </div>
);

export default Landing;
