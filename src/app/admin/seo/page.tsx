'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2, Refresh, AlertCircle, Globe, FileCode, Share2, Search } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

interface GlobalSEOSettings {
  siteName: string;
  siteDescription: string;
  defaultOgImage: string;
  siteKeywords: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  generateSitemapAutomatically: boolean;
  sitemapExcludePaths: string;
  indexingEnabled: boolean;
}

interface TemplateSEOSettings {
  [key: string]: {
    metaTitleTemplate: string;
    metaDescriptionTemplate: string;
    ogTitleTemplate: string;
    ogDescriptionTemplate: string;
  };
}

interface SocialMediaSettings {
  twitterUsername: string;
  facebookAppId: string;
  facebookPageUrl: string;
  linkedInCompanyPage: string;
}

export default function SEOPage() {
  const [activeTab, setActiveTab] = useState('global');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Global SEO settings
  const [globalSettings, setGlobalSettings] = useState<GlobalSEOSettings>({
    siteName: 'Sports Orthopedics Institute',
    siteDescription: 'Excellence in orthopedic care for sports injuries, joint reconstruction, and comprehensive treatment of musculoskeletal conditions.',
    defaultOgImage: '/images/og-image.jpg',
    siteKeywords: 'orthopedics, sports medicine, joint reconstruction, bone, joint, surgery, knee, shoulder, hip, treatment',
    googleAnalyticsId: '',
    googleTagManagerId: '',
    generateSitemapAutomatically: true,
    sitemapExcludePaths: '/admin/*, /api/*, /private/*',
    indexingEnabled: true
  });

  // Template SEO settings for different page types
  const [templateSettings, setTemplateSettings] = useState<TemplateSEOSettings>({
    'homepage': {
      metaTitleTemplate: '{siteName} | Excellence in Motion',
      metaDescriptionTemplate: '{siteDescription}',
      ogTitleTemplate: '{siteName} | Excellence in Motion',
      ogDescriptionTemplate: '{siteDescription}'
    },
    'bone-joint-school': {
      metaTitleTemplate: '{title} | {siteName}',
      metaDescriptionTemplate: 'Learn about {title} from the experts at {siteName}. {excerpt}',
      ogTitleTemplate: '{title} | {siteName}',
      ogDescriptionTemplate: '{excerpt}'
    },
    'procedure-surgery': {
      metaTitleTemplate: '{title} | Procedures at {siteName}',
      metaDescriptionTemplate: '{title} procedure details and recovery information from specialists at {siteName}.',
      ogTitleTemplate: '{title} Procedure | {siteName}',
      ogDescriptionTemplate: 'Expert {title} treatment at {siteName}. {excerpt}'
    },
    'publication': {
      metaTitleTemplate: '{title} | Publications | {siteName}',
      metaDescriptionTemplate: 'Read "{title}" - an academic publication by specialists at {siteName}.',
      ogTitleTemplate: '{title} | {siteName} Research',
      ogDescriptionTemplate: 'Research publication: {title}'
    },
    'surgeon-staff': {
      metaTitleTemplate: 'Dr. {title} | Staff | {siteName}',
      metaDescriptionTemplate: 'Meet Dr. {title}, specialized in {specialty} at {siteName}.',
      ogTitleTemplate: 'Dr. {title} | {siteName}',
      ogDescriptionTemplate: 'Dr. {title} - {specialty} specialist at {siteName}.'
    }
  });

  // Social media settings
  const [socialSettings, setSocialSettings] = useState<SocialMediaSettings>({
    twitterUsername: '@sportsortho',
    facebookAppId: '',
    facebookPageUrl: 'https://facebook.com/sportsorthoinstitute',
    linkedInCompanyPage: 'https://linkedin.com/company/sportsorthoinstitute'
  });

  // Load settings from API on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/admin/seo-settings');
        if (response.ok) {
          const data = await response.json();
          
          if (data.global) {
            setGlobalSettings(data.global);
          }
          
          if (data.templates) {
            setTemplateSettings(data.templates);
          }
          
          if (data.social) {
            setSocialSettings(data.social);
          }
        }
      } catch (error) {
        console.error('Failed to load SEO settings:', error);
      }
    };
    
    loadSettings();
  }, []);

  // Save settings to API
  const handleSave = async () => {
    setLoading(true);
    setSaveStatus('saving');
    
    try {
      const response = await fetch('/api/admin/seo-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          global: globalSettings,
          templates: templateSettings,
          social: socialSettings
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save SEO settings');
      }
      
      setSaveStatus('saved');
      toast.success('SEO settings saved successfully');
      
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Error saving SEO settings:', error);
      setSaveStatus('error');
      toast.error('Failed to save SEO settings');
    } finally {
      setLoading(false);
    }
  };

  // Regenerate sitemap
  const handleRegenerateSitemap = async () => {
    try {
      toast.promise(
        fetch('/api/admin/regenerate-sitemap', { method: 'POST' }),
        {
          loading: 'Regenerating sitemap...',
          success: 'Sitemap regenerated successfully',
          error: 'Failed to regenerate sitemap'
        }
      );
    } catch (error) {
      console.error('Error regenerating sitemap:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/40">
      <Toaster position="top-right" />
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold text-[--text-primary]">SEO Management</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRegenerateSitemap}
              disabled={loading}
            >
              <Refresh className="w-4 h-4 mr-2" />
              Regenerate Sitemap
            </Button>
            <Button 
              onClick={handleSave}
              disabled={loading}
              size="sm"
            >
              {saveStatus === 'saving' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Saved
                </>
              ) : saveStatus === 'error' ? (
                <>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Error
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <Tabs 
          defaultValue="global" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="global" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Global SEO
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileCode className="w-4 h-4" />
              Page Templates
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Social Media
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search Engines
            </TabsTrigger>
          </TabsList>

          {/* Global SEO Tab Content */}
          <TabsContent value="global" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Global SEO Settings</CardTitle>
                <CardDescription>
                  Configure site-wide SEO settings that affect all pages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Site Name</label>
                    <Input
                      value={globalSettings.siteName}
                      onChange={(e) => setGlobalSettings({...globalSettings, siteName: e.target.value})}
                      placeholder="Your site name"
                    />
                    <p className="text-xs text-gray-500 mt-1">Used in title tags and meta data</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Site Description</label>
                    <Textarea
                      value={globalSettings.siteDescription}
                      onChange={(e) => setGlobalSettings({...globalSettings, siteDescription: e.target.value})}
                      placeholder="Brief description of your site"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">Used as default meta description</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Default Open Graph Image</label>
                    <Input
                      value={globalSettings.defaultOgImage}
                      onChange={(e) => setGlobalSettings({...globalSettings, defaultOgImage: e.target.value})}
                      placeholder="/images/og-image.jpg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Default image for social sharing (1200×630px recommended)</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Site Keywords</label>
                    <Input
                      value={globalSettings.siteKeywords}
                      onChange={(e) => setGlobalSettings({...globalSettings, siteKeywords: e.target.value})}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                    <p className="text-xs text-gray-500 mt-1">Comma-separated global keywords</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Sitemap Settings</CardTitle>
                <CardDescription>
                  Configure how your sitemap is generated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Automatic Sitemap Generation</h3>
                    <p className="text-xs text-gray-500">Generate sitemap.xml automatically on content changes</p>
                  </div>
                  <Switch
                    checked={globalSettings.generateSitemapAutomatically}
                    onCheckedChange={(checked) => setGlobalSettings({...globalSettings, generateSitemapAutomatically: checked})}
                    className="data-[state=checked]:bg-[#8B5C9E]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Exclude Paths</label>
                  <Textarea
                    value={globalSettings.sitemapExcludePaths}
                    onChange={(e) => setGlobalSettings({...globalSettings, sitemapExcludePaths: e.target.value})}
                    placeholder="/admin/*, /api/*, /private/*"
                    rows={2}
                  />
                  <p className="text-xs text-gray-500 mt-1">Comma or newline separated paths to exclude from sitemap (supports * wildcard)</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Website Indexing</h3>
                    <p className="text-xs text-gray-500">Allow search engines to index your site</p>
                  </div>
                  <Switch
                    checked={globalSettings.indexingEnabled}
                    onCheckedChange={(checked) => setGlobalSettings({...globalSettings, indexingEnabled: checked})}
                    className="data-[state=checked]:bg-[#8B5C9E]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab Content */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO Templates</CardTitle>
                <CardDescription>
                  Configure SEO templates for different page types. Use variables like {'{title}'}, {'{siteName}'}, {'{excerpt}'}, etc.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="homepage" className="w-full">
                  <TabsList className="mb-4">
                    {Object.keys(templateSettings).map((pageType) => (
                      <TabsTrigger key={pageType} value={pageType}>
                        {pageType.charAt(0).toUpperCase() + pageType.slice(1).replace(/-/g, ' ')}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {Object.entries(templateSettings).map(([pageType, settings]) => (
                    <TabsContent key={pageType} value={pageType} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Meta Title Template</label>
                        <Input
                          value={settings.metaTitleTemplate}
                          onChange={(e) => {
                            const updated = {...templateSettings};
                            updated[pageType].metaTitleTemplate = e.target.value;
                            setTemplateSettings(updated);
                          }}
                          placeholder="Page Title | Site Name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Meta Description Template</label>
                        <Textarea
                          value={settings.metaDescriptionTemplate}
                          onChange={(e) => {
                            const updated = {...templateSettings};
                            updated[pageType].metaDescriptionTemplate = e.target.value;
                            setTemplateSettings(updated);
                          }}
                          placeholder="Description about {title} from {siteName}"
                          rows={2}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Open Graph Title Template</label>
                        <Input
                          value={settings.ogTitleTemplate}
                          onChange={(e) => {
                            const updated = {...templateSettings};
                            updated[pageType].ogTitleTemplate = e.target.value;
                            setTemplateSettings(updated);
                          }}
                          placeholder="Page Title | Site Name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Open Graph Description Template</label>
                        <Textarea
                          value={settings.ogDescriptionTemplate}
                          onChange={(e) => {
                            const updated = {...templateSettings};
                            updated[pageType].ogDescriptionTemplate = e.target.value;
                            setTemplateSettings(updated);
                          }}
                          placeholder="Description about {title} from {siteName}"
                          rows={2}
                        />
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Media Tab Content */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Settings</CardTitle>
                <CardDescription>
                  Configure social media integrations and profiles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Twitter Username</label>
                  <Input
                    value={socialSettings.twitterUsername}
                    onChange={(e) => setSocialSettings({...socialSettings, twitterUsername: e.target.value})}
                    placeholder="@yourusername"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Facebook App ID</label>
                  <Input
                    value={socialSettings.facebookAppId}
                    onChange={(e) => setSocialSettings({...socialSettings, facebookAppId: e.target.value})}
                    placeholder="123456789012345"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Facebook Page URL</label>
                  <Input
                    value={socialSettings.facebookPageUrl}
                    onChange={(e) => setSocialSettings({...socialSettings, facebookPageUrl: e.target.value})}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">LinkedIn Company Page</label>
                  <Input
                    value={socialSettings.linkedInCompanyPage}
                    onChange={(e) => setSocialSettings({...socialSettings, linkedInCompanyPage: e.target.value})}
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Engines Tab Content */}
          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Search Engine Verification</CardTitle>
                <CardDescription>
                  Configure analytics and search engine verification codes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Google Analytics ID</label>
                  <Input
                    value={globalSettings.googleAnalyticsId}
                    onChange={(e) => setGlobalSettings({...globalSettings, googleAnalyticsId: e.target.value})}
                    placeholder="G-XXXXXXXXXX"
                  />
                  <p className="text-xs text-gray-500 mt-1">Your Google Analytics 4 measurement ID</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Google Tag Manager ID</label>
                  <Input
                    value={globalSettings.googleTagManagerId}
                    onChange={(e) => setGlobalSettings({...globalSettings, googleTagManagerId: e.target.value})}
                    placeholder="GTM-XXXXXXX"
                  />
                  <p className="text-xs text-gray-500 mt-1">Your Google Tag Manager container ID</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Custom robots.txt Content</label>
                  <Textarea
                    placeholder={`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${process.env.NEXT_PUBLIC_DOMAIN || 'https://your-domain.com'}/sitemap.xml`}
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Custom robots.txt content (leave empty to use auto-generated)</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}