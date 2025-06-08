'use client';

import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { HeroSection } from './components/HeroSection';
import { VideoCard } from './components/VideoCard';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { ClinicalVideo } from '@/types/clinical-videos';
import { getClinicalVideosAction, getVideoCategoriesAction } from './actions';

// Fallback videos data for development
const fallbackVideos = [
  {
    id: 'qVDqcy8wwUg',
    title: 'Rotator Cuff Tear I Dr. Naveen Kumar L V I Manipal Hospital Sarjapur Road',
    category: 'Shoulder'
  },
  {
    id: 'hxs2YjO1Zq0',
    title: 'Arthroscopy I Dr. Naveen Kumar L V I MHSR',
    category: 'General'
  },
  {
    id: 'E-VpOLEQpcQ',
    title: 'Ganglion Cysts I Dr. Naveen Kumar LV I Manipal Hospitals Sarjapur Road',
    category: 'Hand & Wrist'
  },
  {
    id: 'TktJOoSjlPk',
    title: 'ELBOW OATS - CARTILAGE RECONSTRUCTION | Dr. Naveen Kumar LV | Sports Orthopedics Institute',
    category: 'Elbow'
  },
  {
    id: 'iW29YPvDM-4',
    title: 'Hamstring tear repair | Dr. Naveen Kumar LV | Sports Orthopedics Institute',
    category: 'Hip'
  },
  {
    id: 'yJPpSeOmW2Y',
    title: 'Carpal Tunnel Syndrome I Dr. Naveen Kumar LV I MHSR',
    category: 'Hand & Wrist'
  },
  {
    id: 'GVjXjGC4kjU',
    title: 'Tennis Elbow I Dr. Naveen Kumar LV I MHSR',
    category: 'Elbow'
  },
  {
    id: 'YOkCRz1Sgxo',
    title: 'Shoulder Impingement I Dr. Naveen Kumar LV I Manipal Hospital Sarjapur Road',
    category: 'Shoulder'
  },
  {
    id: 'U8MdByb5rGg',
    title: 'MPFL RECONSTRUCTION + RE ALIGNMENT SURGERY | Dr. Naveen Kumar LV | Sports Orthopedics Institute',
    category: 'Knee'
  },
  {
    id: 'aw4vGSYdUbE',
    title: 'Patellar Chondromalacia Surgery | Dr. Naveen Kumar LV | Sports Orthopedics Institute',
    category: 'Knee'
  },
  {
    id: 'Iaa4oyruQ8Y',
    title: 'Ankle ligament injuries Surgery | Dr. Naveen Kumar LV | Sports Orthopedics Institute',
    category: 'Foot & Ankle'
  },
  {
    id: 'yOhuYkeSbd4',
    title: 'What is Sports Orthopedics? - RadioCity Talk! | Dr. Naveen Kumar LV | Sports Orthopedics Institute',
    category: 'General'
  },
  {
    id: '1l5WYQJfAXQ',
    title: 'Pectoralis Major Repair Surgery | Dr. Naveen Kumar LV | Sports Orthopedics Institute',
    category: 'Shoulder'
  },
  {
    id: '2_RRRSKjmxY',
    title: 'All About Knee Arthritis! | Dr. Naveen Kumar LV | Sports Orthopedics Institute',
    category: 'Knee'
  },
  {
    id: 'yY1xKJeHUVs',
    title: 'All You need to know about Rotator Cuff Injury | Dr. Naveen Kumar L.V. | Manipal Hospital Sarjapur',
    category: 'Shoulder'
  },
  {
    id: 'Cq4tunXNTA4',
    title: 'MCL ligament Surgery | Dr. Naveen Kumar LV | Sports Orthopedics Institute',
    category: 'Knee'
  },
  {
    id: 'DDBD-3zz8sw',
    title: 'De Quervain\'s Tenosynovitis I Dr. Naveen Kumar LV I MHSR',
    category: 'Hand & Wrist'
  },
  {
    id: 'gMDWt5v8Rs0',
    title: 'All you need to know about ACL Ligament | Dr. Naveen Kumar L.V. | Manipal Hospitals Sarjapur Road',
    category: 'Knee'
  },
  {
    id: 'n_gbHg_luvo',
    title: 'Hallux Valgus I Dr. Naveen Kumar I Manipal Hospital Sarjapur Road',
    category: 'Foot & Ankle'
  },
  {
    id: 'aLGCgpIx9u8',
    title: 'ACL Injury I Dr. Naveen Kumar L V I Manipal Hospitals Sarjapur Road',
    category: 'Knee'
  },
  {
    id: 'EKygpau56ns',
    title: 'Ankle Ligament Injuries I Dr. Naveen Kumar I Manipal Hospital Sarjapur Road',
    category: 'Foot & Ankle'
  },
  {
    id: 'Kday79L99Ng',
    title: 'Sports Injury I Dr. Naveen Kumar L V I Manipal Hospital Sarjapur Road',
    category: 'General'
  },
  {
    id: '1QXm_wu5BL8',
    title: 'UCL Ligament Thumb Surgery | Dr. Naveen Kumar LV | Sports Orthopedics Institute',
    category: 'Hand & Wrist'
  },
  {
    id: 'rK93Md5B7ag',
    title: 'Thumb Arthritis I Dr. Naveen Kumar L V I MHSR',
    category: 'Hand & Wrist'
  },
  {
    id: 'l9QrZNcZOq4',
    title: 'Patellar Tendinopathy I Dr. Naveen Kumar LV I MHSR',
    category: 'Knee'
  },
  {
    id: 'tkRy_PZLNXo',
    title: 'Knee Replacement Surgery I Dr. Naveen Kumar L V I Manipal Hospital Sarjapur Road',
    category: 'Knee'
  }
];

// Video grid component with filtering
function VideoGrid() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [videos, setVideos] = useState<ClinicalVideo[]>([]);
  const [categories, setCategories] = useState<string[]>(['All Videos']);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Load initial data
  useEffect(() => {
    loadVideosData();
    loadCategories();
  }, []);

  // Load data when filters change
  useEffect(() => {
    loadVideosData();
  }, [activeCategory, page]);

  const loadVideosData = async () => {
    setLoading(true);
    try {
      const result = await getClinicalVideosAction(
        page,
        activeCategory || undefined
      );
      setVideos(result.data);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (error) {
      console.error('Error loading clinical videos:', error);
      // Fallback to static data
      setVideos(fallbackVideos as any);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await getVideoCategoriesAction();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleCategoryChange = (category: string | null) => {
    setActiveCategory(category);
    setPage(1);
  };
    
      return (
      <>
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#8B5C9E]" />
          </div>
        )}

        {/* Category filter buttons */}
        {!loading && (
          <div className="mb-8 flex flex-wrap gap-2">
            <button 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors 
                ${!activeCategory 
                  ? 'bg-[#8B5C9E] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-[#8B5C9E]/10 hover:text-[#8B5C9E]'
                }`}
              onClick={() => handleCategoryChange(null)}
            >
              All Videos
            </button>
            
            {(categories || []).filter((cat: string) => cat !== 'All Videos').map((category: string) => (
              <button 
                key={category} 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors 
                  ${activeCategory === category 
                    ? 'bg-[#8B5C9E] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-[#8B5C9E]/10 hover:text-[#8B5C9E]'
                  }`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}
        
        {/* Video count */}
        {!loading && (
          <p className="text-sm text-gray-500 mb-6">
            Showing {videos.length} of {total} videos
            {activeCategory ? ` in "${activeCategory}"` : ''}
          </p>
        )}
        
        {/* Video Grid */}
        {!loading && videos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {videos.map((video: ClinicalVideo) => (
              <VideoCard
                key={video.id}
                youtubeId={video.video_id || video.id}
                title={video.title}
                category={video.category}
                thumbnailUrl={(video as any).thumbnailUrl || video.thumbnail_url}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && videos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No videos found.</p>
            <button
              onClick={() => handleCategoryChange(null)}
              className="px-4 py-2 bg-[#8B5C9E] text-white rounded-full text-sm hover:bg-[#7A4B8D] transition-colors"
            >
              Show All Videos
            </button>
          </div>
        )}

        {/* Pagination */}
        {!loading && videos.length > 0 && totalPages > 1 && (
          <div className="flex justify-center mt-12 gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-4 py-2 rounded-lg border ${
                    page === pageNum
                      ? 'bg-[#8B5C9E] text-white border-[#8B5C9E]'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </>
    );
}

// Main page component
export default function ClinicalVideosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader theme="light" />
      
      {/* Hero Section */}
      <HeroSection
        title="Clinical Videos"
        description="Watch educational videos on orthopedic conditions, treatments, and surgical procedures by Dr. Naveen Kumar L V."
        imageSrc="/images/team-hero.jpg"
      />
      
      {/* Main Content with Video Grid */}
      <main id="videos" className="container mx-auto px-4 py-12 md:py-16">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Educational Video Library</h2>
          <p className="text-gray-600 max-w-3xl">
            Browse our collection of informative videos on various orthopedic procedures, conditions, and treatment options. These videos are designed to help patients understand their conditions better.
          </p>
        </div>
        
        {/* Video Grid with filtering */}
        <VideoGrid />
        
        {/* Additional Information */}
        <div className="mt-16 bg-white p-8 rounded-lg shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-4">About Our Clinical Videos</h3>
          <p className="text-gray-600 mb-4">
            These educational videos are created by Dr. Naveen Kumar L V from Sports Orthopedics Institute to help patients understand various orthopedic conditions and treatments. The videos cover a wide range of topics including joint replacements, sports injuries, arthroscopic procedures, and more.
          </p>
          <p className="text-gray-600">
            Please note that these videos are for informational purposes only and should not replace professional medical advice. If you have specific questions about your condition or treatment options, please schedule a consultation with our specialists.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
} 