import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowUpRight } from 'lucide-react';

// Define BlogPost interface
export interface BlogPost {
  slug: string;
  pageType: string;
  title: string;
  originalUrl: string;
  featuredImageUrl: string;
  summary: string;
  category: string;
  publishedAt: string;
  readTime: number;
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// PostCard component for blog listings
export const PostCard = ({ post, priority = false }: { post: BlogPost; priority?: boolean }) => {
  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={post.featuredImageUrl}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-all duration-500 group-hover:scale-105"
          priority={priority}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <span className="absolute top-3 left-3 bg-[#8B5C9E] text-white text-xs font-bold px-2 py-1 rounded-full">
          {post.category}
        </span>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <Calendar className="w-3 h-3 mr-1" />
          <span className="mr-3">{formatDate(post.publishedAt)}</span>
          <Clock className="w-3 h-3 mr-1" />
          <span>{post.readTime} min read</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#8B5C9E] transition-colors">
          {post.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 flex-grow">
          {post.summary}
        </p>
        <Link 
          href={`/${post.slug}`} 
          className="inline-flex items-center text-sm font-semibold text-[#8B5C9E] hover:text-[#6b4578] transition-colors mt-auto"
        >
          Read Article <ArrowUpRight className="w-3 h-3 ml-1" />
        </Link>
      </div>
    </div>
  );
};

// FeaturedPost component for highlighted post with larger display
export const FeaturedPost = ({ post }: { post: BlogPost }) => {
  return (
    <div className="relative overflow-hidden bg-white rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex flex-col lg:flex-row">
        <div className="relative h-64 lg:h-auto lg:w-1/2 overflow-hidden">
          <Image
            src={post.featuredImageUrl}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-all duration-500 hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <span className="absolute top-4 left-4 bg-[#8B5C9E] text-white text-xs font-bold px-3 py-1 rounded-full">
            {post.category}
          </span>
        </div>
        <div className="p-6 lg:w-1/2 lg:p-8 flex flex-col">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Calendar className="w-4 h-4 mr-1" />
            <span className="mr-4">{formatDate(post.publishedAt)}</span>
            <Clock className="w-4 h-4 mr-1" />
            <span>{post.readTime} min read</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-[#8B5C9E] transition-colors">
            {post.title}
          </h2>
          <p className="text-gray-600 mb-4 flex-grow">
            {post.summary}
          </p>
          <Link 
            href={`/${post.slug}`} 
            className="inline-flex items-center font-semibold text-[#8B5C9E] hover:text-[#6b4578] transition-colors"
          >
            Read Article <ArrowUpRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

// RelatedPostCard for smaller cards in sidebars or related posts sections
export const RelatedPostCard = ({ post }: { post: BlogPost }) => {
  return (
    <div className="group flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
        <Image
          src={post.featuredImageUrl}
          alt={post.title}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
      <div className="flex-grow min-w-0">
        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-[#8B5C9E] transition-colors">
          {post.title}
        </h4>
        <div className="flex items-center mt-1 text-xs text-gray-500">
          <Calendar className="w-3 h-3 mr-1" />
          <span>{formatDate(post.publishedAt)}</span>
        </div>
      </div>
    </div>
  );
}; 