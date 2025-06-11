import { getBlogPostsAction } from '@/app/actions/blog';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight, BookOpen, Search, Tag } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - Medical Insights & Health Articles | Sports Orthopedics',
  description: 'Discover expert medical insights, health tips, and the latest research in orthopedic care from our team of specialists.',
  openGraph: {
    title: 'Blog - Medical Insights & Health Articles',
    description: 'Expert medical insights and health articles from orthopedic specialists',
    images: ['/images/default-blog.jpg'],
  }
};

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Helper function to generate category colors
function getCategoryColor(category: string) {
  const colors = [
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-green-100 text-green-800 border-green-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-pink-100 text-pink-800 border-pink-200',
    'bg-indigo-100 text-indigo-800 border-indigo-200',
    'bg-teal-100 text-teal-800 border-teal-200',
    'bg-orange-100 text-orange-800 border-orange-200',
    'bg-red-100 text-red-800 border-red-200'
  ];
  
  const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

// Blog Card Component
function BlogCard({ post, featured = false }: { post: any; featured?: boolean }) {
  const categoryColor = getCategoryColor(post.category || 'General');
  
  if (featured) {
    return (
      <Link href={`/blogs/${post.slug}`} className="block group">
        <article className="relative overflow-hidden bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_50px_rgba(0,0,0,0.12)] transition-all duration-700 hover:-translate-y-3">
          <div className="flex flex-col lg:flex-row min-h-[500px]">
            {/* Featured Image */}
            <div className="relative h-80 lg:h-auto lg:w-3/5 overflow-hidden">
              <Image
                src={post.featured_image_url || '/images/default-blog.jpg'}
                alt={post.title}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-transparent" />
              
              {/* Category Badge */}
              <div className={`absolute top-8 left-8 px-4 py-2 rounded-full text-sm font-semibold border backdrop-blur-sm ${categoryColor}`}>
                <Tag className="w-4 h-4 mr-2 inline" />
                {post.category || 'General'}
              </div>
              
              {/* Featured Badge */}
              <div className="absolute bottom-8 left-8">
                <span className="inline-flex items-center text-sm font-medium bg-gradient-to-r from-[#8B5C9E] to-purple-600 text-white px-4 py-2 rounded-full shadow-lg">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Featured Article
                </span>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-10 lg:w-2/5 lg:p-12 flex flex-col justify-center">
              <div className="flex items-center text-sm text-gray-500 mb-6">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="mr-6">{formatDate(post.date_created)}</span>
                {post.reading_time && (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{post.reading_time} min read</span>
                  </>
                )}
              </div>
              
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-6 group-hover:text-[#8B5C9E] transition-colors leading-tight">
                {post.title}
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed line-clamp-4">
                {post.excerpt || post.content_text?.substring(0, 200) + '...'}
              </p>
              
              <div className="inline-flex items-center font-semibold text-[#8B5C9E] group-hover:text-[#7a4f8a] transition-colors">
                <span className="text-lg">Read Full Article</span>
                <ArrowRight className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-2" />
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/blogs/${post.slug}`} className="block h-full group">
      <article className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 flex flex-col h-full">
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <Image
            src={post.featured_image_url || '/images/default-blog.jpg'}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Category Badge */}
          <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${categoryColor}`}>
            {post.category || 'General'}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center text-xs text-gray-500 mb-4">
            <Calendar className="w-3 h-3 mr-1" />
            <span className="mr-4">{formatDate(post.date_created)}</span>
            {post.reading_time && (
              <>
                <Clock className="w-3 h-3 mr-1" />
                <span>{post.reading_time} min read</span>
              </>
            )}
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#8B5C9E] transition-colors leading-tight line-clamp-2">
            {post.title}
          </h2>
          
          <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3 leading-relaxed">
            {post.excerpt || post.content_text?.substring(0, 150) + '...'}
          </p>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="inline-flex items-center text-sm font-semibold text-[#8B5C9E] group-hover:text-[#7a4f8a] transition-colors">
              <span>Read More</span>
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

// Stats Component
function BlogStats({ total }: { total: number }) {
  return (
    <div className="bg-gradient-to-r from-[#8B5C9E] to-purple-600 rounded-2xl p-8 text-white mb-16">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">{total}+</h2>
          <p className="text-lg opacity-90">Expert Articles Published</p>
        </div>
        <div className="flex items-center space-x-8 text-center">
          <div>
            <div className="text-2xl font-bold">100+</div>
            <div className="text-sm opacity-80">Medical Topics</div>
          </div>
          <div>
            <div className="text-2xl font-bold">50+</div>
            <div className="text-sm opacity-80">Specialists</div>
          </div>
          <div>
            <div className="text-2xl font-bold">5K+</div>
            <div className="text-sm opacity-80">Readers Monthly</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function BlogsMainPage() {
  const { posts: blogPosts, total } = await getBlogPostsAction();

  const featuredPost = blogPosts.find(post => post.is_featured) || blogPosts[0];
  const regularPosts = blogPosts.filter(post => post.id !== featuredPost?.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#2E3A59] via-[#3d4f73] to-[#8B5C9E] py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-block bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium mb-6 backdrop-blur-sm border border-white/30">
              MEDICAL INSIGHTS & EXPERTISE
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6 leading-tight">
              Health & Medical
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Blog
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed mb-8">
              Discover evidence-based medical insights, treatment approaches, and health guidance 
              from our team of orthopedic specialists and healthcare professionals.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="pl-12 pr-4 py-3 w-80 rounded-full border-0 bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                />
              </div>
              <button className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-8 py-3 rounded-full font-semibold hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 shadow-lg">
                Explore Articles
              </button>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Blog Stats */}
          <BlogStats total={total} />

          {blogPosts.length > 0 ? (
            <>
              {/* Featured Article */}
              {featuredPost && (
                <section className="mb-20">
                  <div className="flex items-center mb-8">
                    <div className="flex-grow">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Article</h2>
                      <div className="w-24 h-1 bg-gradient-to-r from-[#8B5C9E] to-purple-600 rounded-full"></div>
                    </div>
                  </div>
                  <BlogCard post={featuredPost} featured />
                </section>
              )}

              {/* Recent Articles */}
              {regularPosts.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-12">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Latest Articles</h2>
                      <div className="w-24 h-1 bg-gradient-to-r from-[#8B5C9E] to-purple-600 rounded-full"></div>
                    </div>
                    <Link 
                      href="/blogs" 
                      className="inline-flex items-center text-[#8B5C9E] hover:text-[#7a4f8a] font-semibold transition-colors"
                    >
                      View All Articles
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {regularPosts.slice(0, 6).map(post => (
                      <BlogCard key={post.id} post={post} />
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            /* Empty State */
            <section className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-[#8B5C9E] to-purple-600 rounded-full flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Our medical experts are preparing insightful articles to help you understand 
                  orthopedic conditions and treatments. Check back soon for valuable health content.
                </p>
                <Link 
                  href="/contact" 
                  className="inline-flex items-center bg-gradient-to-r from-[#8B5C9E] to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-[#7a4f8a] hover:to-purple-700 transition-all duration-300 shadow-lg"
                >
                  Contact Us
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </section>
          )}
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
} 