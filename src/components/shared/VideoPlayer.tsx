import React from 'react';

interface VideoPlayerProps {
  src: string;
}

const VideoPlayer = ({ src }: VideoPlayerProps) => {
  // Check if the src is a YouTube URL
  const isYouTube = src.includes('youtube.com') || src.includes('youtu.be');

  if (isYouTube) {
    // Extract video ID from URL
    let videoId = '';
    if (src.includes('youtube.com/watch')) {
      const url = new URL(src);
      videoId = url.searchParams.get('v') || '';
    } else if (src.includes('youtu.be')) {
      const url = new URL(src);
      videoId = url.pathname.substring(1);
    } else if (src.includes('youtube.com/embed')) {
        const url = new URL(src);
        videoId = url.pathname.substring(7);
    }


    if (videoId) {
      return (
        <div className="aspect-w-16 aspect-h-9">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      );
    }
  }

  // Fallback for other video sources or if ID extraction fails
  return (
    <div>
      <p>Invalid or unsupported video URL.</p>
    </div>
  );
};

export default VideoPlayer; 