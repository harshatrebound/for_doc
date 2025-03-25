'use client';

import { motion } from 'framer-motion';
import { 
  Palette, 
  Type, 
  Layout, 
  Component, 
  Smartphone, 
  Maximize2, 
  MinusSquare,
  PlusSquare,
  ChevronRight,
  Check,
  X
} from 'lucide-react';

const DesignSystem = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Design System</h1>
          <p className="mt-2 text-gray-600">Guidelines and components for building consistent interfaces</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Brand Colors */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-[#8B5C9E]" />
              <h2 className="text-xl font-semibold text-gray-900">Brand Colors</h2>
            </div>
            <p className="text-gray-600">Our color palette emphasizes trust, professionalism, and accessibility</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Primary */}
              <div className="space-y-3">
                <div className="h-24 bg-[#8B5C9E] rounded-lg shadow-sm"></div>
                <div>
                  <p className="font-medium text-gray-900">Primary</p>
                  <p className="text-sm text-gray-500">#8B5C9E</p>
                </div>
              </div>

              {/* Primary Hover */}
              <div className="space-y-3">
                <div className="h-24 bg-[#7A4B8D] rounded-lg shadow-sm"></div>
                <div>
                  <p className="font-medium text-gray-900">Primary Hover</p>
                  <p className="text-sm text-gray-500">#7A4B8D</p>
                </div>
              </div>

              {/* Secondary */}
              <div className="space-y-3">
                <div className="h-24 bg-[#6B4A7E] rounded-lg shadow-sm"></div>
                <div>
                  <p className="font-medium text-gray-900">Secondary</p>
                  <p className="text-sm text-gray-500">#6B4A7E</p>
                </div>
              </div>

              {/* Background */}
              <div className="space-y-3">
                <div className="h-24 bg-gray-50 rounded-lg shadow-sm border border-gray-200"></div>
                <div>
                  <p className="font-medium text-gray-900">Background</p>
                  <p className="text-sm text-gray-500">#F9FAFB</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Type className="w-5 h-5 text-[#8B5C9E]" />
              <h2 className="text-xl font-semibold text-gray-900">Typography</h2>
            </div>
            <p className="text-gray-600">Font hierarchy and styles for clear communication</p>
          </div>
          
          <div className="p-6 space-y-8">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Heading 1</h1>
              <p className="mt-1 text-sm text-gray-500">Font: Inter / 30px / Semi Bold</p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Heading 2</h2>
              <p className="mt-1 text-sm text-gray-500">Font: Inter / 24px / Semi Bold</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Heading 3</h3>
              <p className="mt-1 text-sm text-gray-500">Font: Inter / 20px / Semi Bold</p>
            </div>
            <div>
              <p className="text-base text-gray-600">Body Text</p>
              <p className="mt-1 text-sm text-gray-500">Font: Inter / 16px / Regular</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Small Text</p>
              <p className="mt-1 text-sm text-gray-500">Font: Inter / 14px / Regular</p>
            </div>
          </div>
        </section>

        {/* Components */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Component className="w-5 h-5 text-[#8B5C9E]" />
              <h2 className="text-xl font-semibold text-gray-900">Components</h2>
            </div>
            <p className="text-gray-600">Core UI components with consistent styling</p>
          </div>
          
          <div className="p-6 space-y-8">
            {/* Buttons */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <button className="px-4 py-2 bg-[#8B5C9E] text-white rounded-lg hover:bg-[#7A4B8D] transition-colors">
                  Primary Button
                </button>
                <button className="px-4 py-2 border border-[#8B5C9E] text-[#8B5C9E] rounded-lg hover:bg-[#8B5C9E]/5 transition-colors">
                  Secondary Button
                </button>
                <button className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors">
                  Text Button
                </button>
              </div>
            </div>

            {/* Form Elements */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Form Elements</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Input field"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5C9E] focus:border-transparent"
                />
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5C9E] focus:border-transparent">
                  <option>Select option</option>
                </select>
              </div>
            </div>

            {/* Cards */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Cards</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-gray-900">Card Title</h4>
                  <p className="mt-2 text-sm text-gray-600">Card content with consistent padding and rounded corners.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile First Design */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-[#8B5C9E]" />
              <h2 className="text-xl font-semibold text-gray-900">Mobile First Design</h2>
            </div>
            <p className="text-gray-600">Key principles for our mobile-first approach</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Maximize2 className="w-6 h-6 text-[#8B5C9E]" />
                <h3 className="font-medium text-gray-900">Touch Targets</h3>
                <p className="text-sm text-gray-600">Minimum 44x44px touch targets for buttons and interactive elements</p>
              </div>
              
              <div className="space-y-2">
                <MinusSquare className="w-6 h-6 text-[#8B5C9E]" />
                <h3 className="font-medium text-gray-900">Spacing</h3>
                <p className="text-sm text-gray-600">Consistent spacing system with 4px increments</p>
              </div>
              
              <div className="space-y-2">
                <PlusSquare className="w-6 h-6 text-[#8B5C9E]" />
                <h3 className="font-medium text-gray-900">Progressive Enhancement</h3>
                <p className="text-sm text-gray-600">Core functionality works on all devices, enhanced on larger screens</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features & Interactions */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <ChevronRight className="w-5 h-5 text-[#8B5C9E]" />
              <h2 className="text-xl font-semibold text-gray-900">Features & Interactions</h2>
            </div>
            <p className="text-gray-600">Key features and interaction patterns</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Smooth Transitions</h3>
                  <p className="text-sm text-gray-600">All interactions include smooth animations for better UX</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Error Handling</h3>
                  <p className="text-sm text-gray-600">Clear error messages with actionable feedback</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Loading States</h3>
                  <p className="text-sm text-gray-600">Skeleton loaders and progress indicators for all async operations</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Form Validation</h3>
                  <p className="text-sm text-gray-600">Real-time validation with clear success/error states</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DesignSystem; 