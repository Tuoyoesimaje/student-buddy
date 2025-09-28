import { spawn } from 'child_process';
import open from 'open';

// Start the Vite dev server
const vite = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Wait a bit for the server to start
setTimeout(() => {
  // Open the browser with production URL
  open('https://main-student-buddy.vercel.app');
}, 2000);

// Handle process exit
process.on('SIGINT', () => {
  vite.kill();
  process.exit();
});