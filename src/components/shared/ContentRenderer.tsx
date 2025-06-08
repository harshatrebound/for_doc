'use client';

import React from 'react';

interface ContentRendererProps {
  html: string;
}

const ContentRenderer = ({ html }: ContentRendererProps) => {
  const processHtml = (rawHtml: string): string => {
    if (!rawHtml) {
      return '';
    }

    const youtubeRegex = /<a href="(https?:\/\/(www\.youtube\.com\/watch\?v=|youtu\.be\/)([^"]+))">.*?<\/a>/g;

    return rawHtml.replace(youtubeRegex, (match, url, shortUrl, videoId) => {
        // For youtu.be links, the videoId is the path. For watch links, it's a param.
        const finalVideoId = shortUrl.startsWith('youtu.be') ? new URL(url).pathname.substring(1) : new URL(url).searchParams.get('v');

        if (finalVideoId) {
            return `<div class="aspect-w-16 aspect-h-9"><iframe src="https://www.youtube.com/embed/${finalVideoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full h-full"></iframe></div>`;
        }
        return match; // Return original link if ID extraction fails
    });
  };

  const processedHtml = processHtml(html);

  return <div className="prose prose-lg max-w-none mb-8" dangerouslySetInnerHTML={{ __html: processedHtml }} />;
};

export default ContentRenderer; 