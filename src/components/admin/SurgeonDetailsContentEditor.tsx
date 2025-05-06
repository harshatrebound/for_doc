'use client';

import React from 'react';
import { Loader2, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface SurgeonDetailsContentEditorProps {
  pageSlug: string;
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

export default function SurgeonDetailsContentEditor({ pageSlug }: SurgeonDetailsContentEditorProps) {
  // State management
  const [activeTab, setActiveTab] = React.useState(EDITABLE_SECTIONS[0].key);
  const [sectionData, setSectionData] = React.useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [savingSection, setSavingSection] = React.useState<string | null>(null);
  const [newItem, setNewItem] = React.useState('');
  const [hasChanges, setHasChanges] = React.useState(false);

  // Extract surgeon slug from page slug
  const surgeonSlug = pageSlug.split('/').pop() || pageSlug;

  // Load surgeon details when component mounts or surgeonSlug changes
  React.useEffect(() => {
    async function loadSurgeonDetails() {
      if (!surgeonSlug) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/surgeon-details?slug=${surgeonSlug}`);
        
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
  }, [surgeonSlug]);

  // Function to add a new item to the current section
  const addItem = () => {
    if (!newItem.trim()) return;
    
    const updatedItems = [...(sectionData[activeTab] || []), newItem.trim()];
    setSectionData({
      ...sectionData,
      [activeTab]: updatedItems
    });
    setNewItem('');
    setHasChanges(true);
  };

  // Function to remove an item from the current section
  const removeItem = (index: number) => {
    const updatedItems = [...(sectionData[activeTab] || [])];
    updatedItems.splice(index, 1);
    setSectionData({
      ...sectionData,
      [activeTab]: updatedItems
    });
    setHasChanges(true);
  };

  // Function to save changes to the current section
  const saveSection = async () => {
    if (!surgeonSlug) return;
    
    setSavingSection(activeTab);
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/surgeon-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: surgeonSlug,
          sectionKey: activeTab,
          items: sectionData[activeTab] || []
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save surgeon details');
      }
      
      toast.success(`${EDITABLE_SECTIONS.find(s => s.key === activeTab)?.label} updated successfully`);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving surgeon details:', error);
      toast.error('Failed to save surgeon details');
    } finally {
      setIsSaving(false);
      setSavingSection(null);
    }
  };

  // Function to save all changes at once
  const saveAllSections = async () => {
    if (!surgeonSlug) return;
    
    setIsSaving(true);
    try {
      // Save each section one by one
      for (const section of EDITABLE_SECTIONS) {
        const response = await fetch('/api/admin/surgeon-details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slug: surgeonSlug,
            sectionKey: section.key,
            items: sectionData[section.key] || []
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to save ${section.label}`);
        }
      }
      
      toast.success('All surgeon details saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving all surgeon details:', error);
      toast.error('Failed to save all surgeon details');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="mt-8 shadow-md border-gray-200">
        <CardHeader className="bg-gradient-to-r from-[#8B5C9E]/10 to-transparent pb-3">
          <CardTitle className="text-xl font-bold text-[#8B5C9E]">Surgeon Details</CardTitle>
          <CardDescription className="text-gray-600">Manage detailed information for this surgeon</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#8B5C9E]" />
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="mt-8 shadow-md border border-gray-200 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-white pb-4 border-b">
        <CardTitle className="text-xl font-bold text-purple-800">Surgeon Details</CardTitle>
        <CardDescription className="text-gray-600">Manage detailed information for this surgeon</CardDescription>
      </CardHeader>
      
      {isLoading ? (
        <CardContent className="flex justify-center items-center py-16">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-700 mx-auto mb-4" />
            <p className="text-gray-500">Loading surgeon details...</p>
          </div>
        </CardContent>
      ) : (
        <CardContent className="p-0">
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="container mx-auto px-4 overflow-x-auto">
                <TabsList className="flex bg-transparent h-auto p-0 mb-0 gap-1 justify-start">
                  {EDITABLE_SECTIONS.map((section) => (
                    <TabsTrigger 
                      key={section.key} 
                      value={section.key}
                      className="rounded-t-lg rounded-b-none px-4 py-3 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-purple-800 data-[state=active]:border-b-2 data-[state=active]:border-purple-700 transition-all"
                    >
                      {section.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="p-6">
              {EDITABLE_SECTIONS.map((section) => (
                <TabsContent key={section.key} value={section.key} className="focus:outline-none">
                  {/* Add New Item Section */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                      <h3 className="font-medium text-gray-800">Add New {section.label}</h3>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-end gap-3">
                        <div className="flex-1">
                          <Label htmlFor={`new-${section.key}`} className="text-sm font-medium text-gray-700 mb-1.5 block">
                            Item Details
                          </Label>
                          <Input
                            id={`new-${section.key}`}
                            value={activeTab === section.key ? newItem : ''}
                            onChange={(e) => setNewItem(e.target.value)}
                            placeholder={`Enter new ${section.label.toLowerCase()} item`}
                            className="h-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-colors"
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
                          className="bg-purple-700 hover:bg-purple-800 h-10 transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Items List Section */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                      <h3 className="font-medium text-gray-800">{section.label} List</h3>
                      <span className="text-xs font-medium bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full">
                        {sectionData[section.key]?.length || 0} items
                      </span>
                    </div>
                    
                    <div className="divide-y max-h-[350px] overflow-y-auto bg-white">
                      {sectionData[section.key]?.length ? (
                        sectionData[section.key].map((item: string, index: number) => (
                          <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
                            <span className="text-sm text-gray-700 flex-1">{item}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 px-4 text-center">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <Plus className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 mb-1">No items added yet</p>
                          <p className="text-sm text-gray-400">Add your first {section.label.toLowerCase()} item using the form above</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                      <Button
                        onClick={saveSection}
                        disabled={isSaving}
                        variant="outline"
                        className="border-purple-700 text-purple-700 hover:bg-purple-50 transition-colors"
                      >
                        {savingSection === section.key ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        Save {section.label}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              ))}
              
              {/* Global Save Button */}
              <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end">
                <Button
                  onClick={saveAllSections}
                  disabled={isSaving || !hasChanges}
                  className="bg-purple-800 hover:bg-purple-900 transition-colors px-6"
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save All Changes
                </Button>
              </div>
            </div>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
}
