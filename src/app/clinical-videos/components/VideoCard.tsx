'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

interface VideoCardProps {
  youtubeId: string;
  title: string;
  category?: string;
}

export function VideoCard({ youtubeId, title, category }: VideoCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const handleThumbnailClick = () => {
    setIsPlaying(true);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md transition-all hover:shadow-lg">
      <div className="relative aspect-video">
        {!isPlaying ? (
          // Thumbnail with play button
          <div 
            className="cursor-pointer relative w-full h-full overflow-hidden"
            onClick={handleThumbnailClick}
          >
            <img 
              src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
              alt={title}
              className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center group">
              <div className="bg-black/20 absolute inset-0 group-hover:bg-black/40 transition-colors duration-300"></div>
              <div className="w-16 h-16 bg-[#8B5C9E] rounded-full flex items-center justify-center z-10 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Play className="w-6 h-6 text-white fill-white ml-1" />
              </div>
            </div>
            
            {/* Category label */}
            {category && (
              <div className="absolute top-2 right-2 bg-[#8B5C9E] text-white text-xs font-medium px-2 py-1 rounded-md shadow-md">
                {category}
              </div>
            )}
          </div>
        ) : (
          // Embedded YouTube player
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className={`absolute top-0 left-0 w-full h-full ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setIsLoaded(true)}
          ></iframe>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 text-lg line-clamp-2">{title}</h3>
      </div>
    </div>
  );
} 