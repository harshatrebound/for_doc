'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      // Show success message
      toast.success('Login successful');
      
      // Force a complete browser redirect with absolute URL and bypass parameter
      const baseUrl = window.location.origin;
      const adminUrl = `${baseUrl}/admin?auth=true`;
      
      // Approach 1: Use Next.js router first (client-side navigation)
      router.replace('/admin?auth=true');
      
      // Approach 2: After a delay, try standard location redirect
      setTimeout(() => {
        // Force page reload to a specific URL
        window.location.href = adminUrl;
      }, 500);
      
    } catch (error) {
      toast.error('Invalid email or password');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full p-8 bg-white shadow-md rounded-xl">
      <div className="mb-8">
        <h2 className="text-center text-2xl font-semibold text-[#8B5C9E]">
          Admin Login
        </h2>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-[#8B5C9E] focus:border-[#8B5C9E]"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-[#8B5C9E] focus:border-[#8B5C9E]"
              placeholder="••••••••"
            />
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-[#8B5C9E] hover:bg-[#7B4C8E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5C9E] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </motion.button>
      </form>
    </div>
  );
} 