#!/usr/bin/env node

// Simple frontend build script for Netlify
import { execSync } from 'child_process';

try {
  console.log('Building frontend only for static deployment...');
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('Frontend build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}