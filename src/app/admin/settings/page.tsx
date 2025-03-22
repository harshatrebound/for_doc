'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Settings as SettingsIcon } from 'lucide-react';
import { Switch } from '@headlessui/react';

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
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-4 py-2 rounded-lg text-white transition-colors ${
            saveStatus === 'saving' ? 'bg-gray-400' :
            saveStatus === 'saved' ? 'bg-green-500' :
            saveStatus === 'error' ? 'bg-red-500' :
            'bg-[#8B5C9E] hover:bg-[#7a4b8d]'
          }`}
        >
          {saveStatus === 'saving' ? 'Saving...' :
           saveStatus === 'saved' ? 'Saved!' :
           saveStatus === 'error' ? 'Error!' :
           'Save Changes'}
        </button>
      </div>

      {/* Required Fields */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Required Fields</h2>
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

      {/* Field Labels */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Field Labels</h2>
        <div className="grid gap-4">
          {Object.entries(settings.labels).map(([field, label]) => (
            <div key={field} className="grid gap-1">
              <label className="text-sm font-medium text-gray-700 capitalize">
                {field.replace(/([A-Z])/g, ' $1').trim()}
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5C9E] focus:border-transparent"
              />
            </div>
          ))}
        </div>
      </motion.section>

      {/* Styling */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Styling</h2>
        <div className="space-y-4">
          <div className="grid gap-1">
            <label className="text-sm font-medium text-gray-700">
              Primary Color
            </label>
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
              className="h-10 w-full"
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium text-gray-700">
              Button Text
            </label>
            <input
              type="text"
              value={settings.styling.buttonText}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                styling: {
                  ...prev.styling,
                  buttonText: e.target.value,
                },
              }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5C9E] focus:border-transparent"
            />
          </div>
          <div className="grid gap-1">
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
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5C9E] focus:border-transparent"
            >
              <option value="rounded">Rounded</option>
              <option value="square">Square</option>
            </select>
          </div>
        </div>
      </motion.section>

      {/* Embed Code */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Embed Code</h2>
          <button
            onClick={copyEmbedCode}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
        <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
          {getEmbedCode()}
        </pre>
      </motion.section>
    </div>
  );
}
 