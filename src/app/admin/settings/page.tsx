'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Settings as SettingsIcon, Loader2, Save } from 'lucide-react';
import { Switch } from '@headlessui/react';
import { toast } from 'react-hot-toast';

interface ModalSettings {
  requiredFields: {
    phone: boolean;
    email: boolean;
    notes: boolean;
  };
  labels: {
    phone: string;
    email: string;
    notes: string;
    patientName: string;
    submitButton: string;
  };
  styling: {
    primaryColor: string;
    buttonText: string;
    buttonStyle: 'rounded' | 'square';
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<ModalSettings>({
    requiredFields: {
      phone: true,
      email: true,
      notes: false,
    },
    labels: {
      phone: 'Phone Number',
      email: 'Email Address',
      notes: 'Additional Notes',
      patientName: 'Patient Name',
      submitButton: 'Book Appointment',
    },
    styling: {
      primaryColor: '#8B5C9E',
      buttonText: 'Book Appointment',
      buttonStyle: 'rounded',
    },
  });

  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    // Load saved settings
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) throw new Error('Failed to save settings');
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const getEmbedCode = () => {
    const encodedSettings = encodeURIComponent(JSON.stringify(settings));
    return `<script src="${origin}/embed.js"></script>
<div class="booking-button" data-settings="${encodedSettings}"></div>`;
  };

  const copyEmbedCode = async () => {
    if (typeof navigator !== 'undefined') {
      await navigator.clipboard.writeText(getEmbedCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold text-[--text-primary]">Settings</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Form Labels */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200"
        >
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Form Labels</h2>
          <div className="space-y-4">
            {Object.entries(settings.labels).map(([field, label]) => (
              <div key={field} className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <label className="text-sm font-medium text-gray-700 capitalize">
                  {field}
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    labels: {
                      ...prev.labels,
                      [field]: e.target.value,
                    },
                  }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-[#8B5C9E] focus:border-[#8B5C9E] text-sm"
                />
              </div>
            ))}
          </div>
        </motion.section>

        {/* Required Fields */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200"
        >
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Required Fields</h2>
          <div className="space-y-4">
            {Object.entries(settings.requiredFields).map(([field, required]) => (
              <div key={field} className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 capitalize">
                  {field}
                </label>
                <Switch
                  checked={required}
                  onChange={(checked: boolean) => setSettings(prev => ({
                    ...prev,
                    requiredFields: {
                      ...prev.requiredFields,
                      [field]: checked,
                    },
                  }))}
                  className={`${
                    required ? 'bg-[#8B5C9E]' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                >
                  <span className={`${
                    required ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                </Switch>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Styling */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200"
        >
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Styling</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <label className="text-sm font-medium text-gray-700">
                Primary Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={settings.styling.primaryColor}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    styling: {
                      ...prev.styling,
                      primaryColor: e.target.value,
                    },
                  }))}
                  className="h-8 w-8 rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={settings.styling.primaryColor}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    styling: {
                      ...prev.styling,
                      primaryColor: e.target.value,
                    },
                  }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-[#8B5C9E] focus:border-[#8B5C9E] text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(settings.styling.primaryColor);
                    toast.success('Color code copied!');
                  }}
                  className="p-2 text-gray-600 hover:text-[#8B5C9E] hover:bg-[#8B5C9E]/5 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <label className="text-sm font-medium text-gray-700">
                Button Style
              </label>
              <select
                value={settings.styling.buttonStyle}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  styling: {
                    ...prev.styling,
                    buttonStyle: e.target.value as 'rounded' | 'square',
                  },
                }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-[#8B5C9E] focus:border-[#8B5C9E] text-sm"
              >
                <option value="rounded">Rounded</option>
                <option value="square">Square</option>
              </select>
            </div>
          </div>
        </motion.section>

        {/* Save Button */}
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 bg-[#8B5C9E] text-white text-sm sm:text-base font-medium rounded-lg hover:bg-[#7B4C8E] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                <span>Save Changes</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
 