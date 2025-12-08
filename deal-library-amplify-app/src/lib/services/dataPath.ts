import * as path from 'path';
import * as fs from 'fs';

/**
 * Get the correct path to data files in Next.js
 * In development: uses public/data
 * In production: uses public/data (copied during build)
 */
export function getDataPath(filename: string): string {
  // Try multiple possible locations
  const possiblePaths = [
    // Production: process.cwd() points to the app directory
    path.join(process.cwd(), 'public', 'data', filename),
    // Alternative production path
    path.join(process.cwd(), '.next', 'server', 'app', 'data', filename),
    // Development fallback
    path.join(process.cwd(), 'deal-library-amplify-app', 'public', 'data', filename),
    // Legacy path (for backwards compatibility)
    path.join(__dirname, '../../data', filename),
    path.join(__dirname, '../../../public/data', filename),
  ];

  // Find the first path that exists
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      console.log(`📁 Found data file at: ${p}`);
      return p;
    }
  }

  // Log all attempted paths for debugging
  console.warn(`⚠️ Data file not found: ${filename}`);
  console.warn('Attempted paths:');
  possiblePaths.forEach(p => console.warn(`  - ${p}`));

  // Return the most likely path (public/data)
  return path.join(process.cwd(), 'public', 'data', filename);
}

/**
 * Check if a data file exists
 */
export function dataFileExists(filename: string): boolean {
  const filepath = getDataPath(filename);
  return fs.existsSync(filepath);
}

