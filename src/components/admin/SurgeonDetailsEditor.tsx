'use client';

import { useState, useEffect } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';

interface SurgeonDetailsEditorProps {
  doctorId: string;
  doctorSlug: string;
}

// Define the sections we want to make editable
const EDITABLE_SECTIONS = [
  { key: 'Awards & Distinction', label: 'Awards & Distinctions' },
  { key: 'Qualifications', label: 'Qualifications' },
  { key: 'Expertise', label: 'Expertise' },
  { key: 'Publications', label: 'Publications' },
  { key: 'Affiliations & Memberships', label: 'Affiliations & Memberships' },
  { key: 'Professional Visits', label: 'Professional Visits' },
  { key: 'Conferences', label: 'Conferences' },
  { key: 'Courses', label: 'Courses' },
  { key: 'Podium Presentations', label: 'Podium Presentations' },
  { key: 'Poster Presentations', label: 'Poster Presentations' },
  { key: 'Faculty & Guest Lectures', label: 'Faculty & Guest Lectures' },
  { key: 'Executive & Management Experience', label: 'Executive Experience' },
  { key: 'Additional Credentials', label: 'Additional Credentials' },
  { key: 'Continued Medical Education (Cmes)', label: 'CMEs' },
];

export default function SurgeonDetailsEditor({ doctorId, doctorSlug }: SurgeonDetailsEditorProps) {
  const [activeTab, setActiveTab] = useState(EDITABLE_SECTIONS[0].key);
  const [sectionData, setSectionData] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newItem, setNewItem] = useState('');

  // Load surgeon details when component mounts or doctorSlug changes
  useEffect(() => {
    async function loadSurgeonDetails() {
      if (!doctorSlug) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/surgeon-details?slug=${doctorSlug}`);
        
        if (!response.ok) {
          throw new Error('Failed to load surgeon details');
        }
        
        const data = await response.json();
        setSectionData(data);
      } catch (error) {
        console.error('Error loading surgeon details:', error);
        toast.error('Failed to load surgeon details');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadSurgeonDetails();
  }, [doctorSlug]);

  // Function to add a new item to the current section
  const addItem = () => {
    if (!newItem.trim()) return;
    
    const updatedItems = [...(sectionData[activeTab] || []), newItem.trim()];
    setSectionData({
      ...sectionData,
      [activeTab]: updatedItems
    });
    setNewItem('');
  };

  // Function to remove an item from the current section
  const removeItem = (index: number) => {
    const updatedItems = [...(sectionData[activeTab] || [])];
    updatedItems.splice(index, 1);
    setSectionData({
      ...sectionData,
      [activeTab]: updatedItems
    });
  };

  // Function to save changes to the current section
  const saveSection = async () => {
    if (!doctorSlug) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/surgeon-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: doctorSlug,
          sectionKey: activeTab,
          items: sectionData[activeTab] || []
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save surgeon details');
      }
      
      toast.success(`Saved ${sectionData[activeTab]?.length || 0} items to ${activeTab}`);
    } catch (error) {
      console.error('Error saving surgeon details:', error);
      toast.error('Failed to save surgeon details');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#8B5C9E]" />
        <span className="ml-2 text-gray-600">Loading surgeon details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
        Detailed Surgeon Information
      </h3>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {EDITABLE_SECTIONS.map((section) => (
            <TabsTrigger 
              key={section.key} 
              value={section.key}
              className="text-xs md:text-sm"
            >
              {section.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {EDITABLE_SECTIONS.map((section) => (
          <TabsContent key={section.key} value={section.key} className="space-y-4 pt-4">
            <div className="flex items-end gap-2 mb-4">
              <div className="flex-1">
                <Label htmlFor={`new-${section.key}`} className="text-sm font-medium text-gray-700 mb-1 block">
                  Add New {section.label} Item
                </Label>
                <Input
                  id={`new-${section.key}`}
                  value={activeTab === section.key ? newItem : ''}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder={`Enter new ${section.label.toLowerCase()} item`}
                  className="h-10 border-gray-300 focus:border-[#8B5C9E] focus:ring-[#8B5C9E]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem();
                    }
                  }}
                />
              </div>
              <Button
                onClick={addItem}
                disabled={!newItem.trim()}
                className="bg-[#8B5C9E] hover:bg-[#8B5C9E]/90 h-10"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h4 className="font-medium text-sm text-gray-700">
                  {section.label} ({sectionData[section.key]?.length || 0} items)
                </h4>
              </div>
              
              <div className="divide-y">
                {sectionData[section.key]?.length ? (
                  sectionData[section.key].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50">
                      <span className="text-sm text-gray-700 flex-1">{item}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No items added yet. Add your first {section.label.toLowerCase()} item above.
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={saveSection}
                disabled={isSaving}
                className="bg-[#8B5C9E] hover:bg-[#8B5C9E]/90"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save {section.label}
              </Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
