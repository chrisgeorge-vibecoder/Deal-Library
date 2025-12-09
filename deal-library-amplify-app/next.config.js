/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Standalone output for minimal deployment size (required for Amplify)
  output: 'standalone',
  
  // Skip type checking during build for faster deployments
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Exclude native modules from being bundled - they run server-side only
  experimental: {
    serverComponentsExternalPackages: [
      '@xenova/transformers',
      'onnxruntime-node',
      'faiss-node',
      'sharp'
    ],
  },
  
  // Webpack configuration for handling native modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't attempt to bundle server-only modules on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        os: false,
        child_process: false,
        net: false,
        tls: false,
        dns: false,
      };
    }
    
    // Ignore binary files
    config.module.rules.push({
      test: /\.node$/,
      use: 'ignore-loader',
    });
    
    return config;
  },
  
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production';
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
      "style-src 'self' 'unsafe-inline' https:",
      "img-src 'self' data: https:",
      isDev
        ? "connect-src 'self' http://localhost:3001 http://localhost:3002 ws: http: https:"
        : "connect-src 'self' https:",
      "font-src 'self' data: https:",
      "frame-ancestors 'self'",
    ];
    const securityHeaders = [
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
      { key: 'Content-Security-Policy', value: cspDirectives.join('; ') },
    ];
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

module.exports = nextConfig
