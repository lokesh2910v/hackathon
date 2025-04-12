const { join } = require('path');
const { spawn } = require('child_process');

const npxPath = 'npx';
const configPath = join(__dirname, 'vite.config.local.js');

// Debugging logs
console.log(`Resolved config path: ${configPath}`);
console.log(`Executing backend: ${npxPath} vite --config "${configPath}"`);
console.log(`Executing frontend: ${npxPath} vite --config "${configPath}"`);

// Start the backend server
console.log('Starting backend server...');
const backend = spawn(npxPath, ['vite', '--config', `"${configPath}"`], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' },
  shell: true,
});

// Start the frontend server
console.log('Starting frontend...');
const frontend = spawn(npxPath, ['vite', '--config', `"${configPath}"`], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' },
  shell: true,
});