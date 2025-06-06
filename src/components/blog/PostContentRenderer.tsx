import React from 'react';
// Image and Link imports might not be directly needed here anymore if HTML handles them.

// Props for the component
interface PostContentRendererProps {
  htmlContent: string;
}

const PostContentRenderer: React.FC<PostContentRendererProps> = ({ htmlContent }) => {
  if (!htmlContent) {
    return <p className="text-gray-500 italic">No content available.</p>;
  }

  // Render the HTML string from Directus.
  // Ensure that the HTML content from Directus is trusted and sanitized if necessary
  // before being stored in Directus, or use a sanitization library here if it's from user input.
  // For CMS-managed content, dangerouslySetInnerHTML is a common approach.
  return (
    <div
      className="prose lg:prose-xl max-w-none" // Example Tailwind CSS prose classes for styling
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default PostContentRenderer;