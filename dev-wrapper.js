const { spawn } = require('child_process');
const path = require('path');

// Use the local next binary directly
const nextBin = path.join(__dirname, 'node_modules', '.bin', 'next');

// Spawn next dev, explicitly ignoring any arguments passed to this script
const child = spawn(nextBin, ['dev', '--hostname', '0.0.0.0'], {
  stdio: 'inherit',
  shell: false
});

child.on('error', (err) => {
  console.error('Failed to start subprocess:', err);
});

child.on('close', (code) => {
  process.exit(code);
});
