import Link from 'next/link';
import Image from 'next/image';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { Metadata } from 'next';
import { BookOpen, Calendar, User, ArrowRight, GraduationCap, FileText, Search, Filter } from 'lucide-react';
import ClientImage from '@/app/components/ClientImage';
import { getPublicationsAction } from '@/app/actions/publications';
import type { Publication } from '@/types/publications';

export const metadata: Metadata = {
  title: 'Academic Publications & Research | Sports Orthopedics',
  description: 'Explore our comprehensive collection of academic publications, research articles, and scientific contributions by our orthopedic specialists.',
  openGraph: {
    title: 'Academic Publications & Research | Sports Orthopedics',
    description: 'Scholarly articles and research publications by our orthopedic specialists',
    images: ['/images/default-procedure.jpg'],
  }
};

// Default fallback image
const DEFAULT_IMAGE = '/images/default-procedure.jpg';

// Helper function to format date
function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Helper function to get publication type color
function getPublicationTypeColor(type: string) {
  const colors = {
    'Research Article': 'bg-blue-100 text-blue-800 border-blue-200',
    'Case Study': 'bg-green-100 text-green-800 border-green-200',
    'Review Article': 'bg-purple-100 text-purple-800 border-purple-200',
    'Clinical Trial': 'bg-red-100 text-red-800 border-red-200',
    'Editorial': 'bg-orange-100 text-orange-800 border-orange-200',
    'Conference Paper': 'bg-teal-100 text-teal-800 border-teal-200',
    'Book Chapter': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'default': 'bg-gray-100 text-gray-800 border-gray-200'
  };
  
  return colors[type as keyof typeof colors] || colors.default;
}

// Publication Card Component
function PublicationCard({ publication, featured = false }: { publication: Publication; featured?: boolean }) {
  const { title, featured_image_url, authors, publication_date, slug, publication_type, category } = publication;
  
  const imageUrl = featured_image_url || DEFAULT_IMAGE;
  const displayTitle = title.replace(' | Sports Orthopedics', '').trim();
  const formattedDate = formatDate(publication_date);
  const typeColor = getPublicationTypeColor(publication_type || 'default');
  
  if (featured) {
    return (
      <Link href={`/publications/${slug}`} className="block group">
        <article className="relative overflow-hidden bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_50px_rgba(0,0,0,0.12)] transition-all duration-700 hover:-translate-y-3">
          <div className="flex flex-col lg:flex-row min-h-[500px]">
            {/* Featured Image */}
            <div className="relative h-80 lg:h-auto lg:w-3/5 overflow-hidden">
              <ClientImage
                src={imageUrl}
                alt={displayTitle}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                unoptimized={true}
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-transparent" />
              
              {/* Publication Type Badge */}
              <div className={`absolute top-8 left-8 px-4 py-2 rounded-full text-sm font-semibold border backdrop-blur-sm ${typeColor}`}>
                <FileText className="w-4 h-4 mr-2 inline" />
                {publication_type || 'Publication'}
              </div>
              
              {/* Featured Badge */}
              <div className="absolute bottom-8 left-8">
                <span className="inline-flex items-center text-sm font-medium bg-gradient-to-r from-[#8B5C9E] to-purple-600 text-white px-4 py-2 rounded-full shadow-lg">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Featured Research
                </span>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-10 lg:w-2/5 lg:p-12 flex flex-col justify-center">
              <div className="flex flex-col space-y-3 text-sm text-gray-500 mb-6">
                {authors && (
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="line-clamp-2">{authors}</span>
                  </div>
                )}
                {formattedDate && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{formattedDate}</span>
                  </div>
                )}
              </div>
              
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-6 group-hover:text-[#8B5C9E] transition-colors leading-tight">
                {displayTitle}
              </h1>
              
              {category && (
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  <span className="font-semibold">Category:</span> {category}
                </p>
              )}
              
              <div className="inline-flex items-center font-semibold text-[#8B5C9E] group-hover:text-[#7a4f8a] transition-colors">
                <span className="text-lg">Read Publication</span>
                <ArrowRight className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-2" />
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/publications/${slug}`} className="block h-full group">
      <article className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 flex flex-col h-full">
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <ClientImage
            src={imageUrl}
            alt={displayTitle}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            unoptimized={true}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Publication Type Badge */}
          <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${typeColor}`}>
            {publication_type || 'Publication'}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 flex flex-col flex-grow">
          <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#8B5C9E] transition-colors leading-tight line-clamp-2">
            {displayTitle}
          </h2>
          
          <div className="flex flex-col space-y-2 text-sm text-gray-600 mb-4">
            {authors && (
              <div className="flex items-center min-w-0">
                <User className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="line-clamp-1 truncate">{authors}</span>
              </div>
            )}
            
            {formattedDate && (
              <div className="flex items-center min-w-0">
                <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{formattedDate}</span>
              </div>
            )}
            
            {category && (
              <div className="flex items-center min-w-0">
                <BookOpen className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="line-clamp-1 truncate">{category}</span>
              </div>
            )}
          </div>
          
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

// Research Stats Component
function ResearchStats({ total }: { total: number }) {
  return (
    <div className="bg-gradient-to-r from-[#8B5C9E] to-purple-600 rounded-2xl p-8 text-white mb-16">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">{total}+</h2>
          <p className="text-lg opacity-90">Academic Publications</p>
        </div>
        <div className="flex items-center space-x-8 text-center">
          <div>
            <div className="text-2xl font-bold">25+</div>
            <div className="text-sm opacity-80">Research Areas</div>
          </div>
          <div>
            <div className="text-2xl font-bold">15+</div>
            <div className="text-sm opacity-80">Contributing Authors</div>
          </div>
          <div>
            <div className="text-2xl font-bold">500+</div>
            <div className="text-sm opacity-80">Citations</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Filter Section Component
function FilterSection() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg mb-12">
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <div className="flex items-center">
          <Filter className="w-5 h-5 text-gray-500 mr-2" />
          <span className="text-gray-700 font-medium">Filter by:</span>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#8B5C9E] focus:border-transparent">
            <option>All Types</option>
            <option>Research Article</option>
            <option>Case Study</option>
            <option>Review Article</option>
            <option>Clinical Trial</option>
          </select>
          
          <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#8B5C9E] focus:border-transparent">
            <option>All Categories</option>
            <option>Sports Medicine</option>
            <option>Orthopedic Surgery</option>
            <option>Rehabilitation</option>
            <option>Joint Replacement</option>
          </select>
          
          <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#8B5C9E] focus:border-transparent">
            <option>All Years</option>
            <option>2024</option>
            <option>2023</option>
            <option>2022</option>
            <option>2021</option>
          </select>
        </div>
        
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search publications..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#8B5C9E] focus:border-transparent w-64"
          />
        </div>
      </div>
    </div>
  );
}

export default async function PublicationsMainPage() {
  const { publications, total } = await getPublicationsAction({
    limit: 50,
    page: 1
  });
  
  const featuredPublication = publications.length > 0 ? publications[0] : null;
  const regularPublications = publications.length > 0 ? publications.slice(1) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#2E3A59] via-[#3d4f73] to-[#8B5C9E] py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-block bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium mb-6 backdrop-blur-sm border border-white/30">
              ACADEMIC RESEARCH & PUBLICATIONS
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6 leading-tight">
              Research &
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Publications
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed mb-8">
              Explore cutting-edge research, clinical studies, and academic contributions from our team of 
              orthopedic specialists and researchers advancing the field of sports medicine.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="#publications"
                className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-8 py-3 rounded-full font-semibold hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 shadow-lg"
              >
                Browse Publications
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white/30 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              >
                Collaborate with Us
              </Link>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="publications">
          {/* Research Stats */}
          <ResearchStats total={total} />

          {/* Filter Section */}
          <FilterSection />

          {publications.length > 0 ? (
            <>
              {/* Featured Publication */}
              {featuredPublication && (
                <section className="mb-20">
                  <div className="flex items-center mb-8">
                    <div className="flex-grow">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Research</h2>
                      <div className="w-24 h-1 bg-gradient-to-r from-[#8B5C9E] to-purple-600 rounded-full"></div>
                    </div>
                  </div>
                  <PublicationCard publication={featuredPublication} featured />
                </section>
              )}

              {/* Recent Publications */}
              {regularPublications.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-12">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Latest Publications</h2>
                      <div className="w-24 h-1 bg-gradient-to-r from-[#8B5C9E] to-purple-600 rounded-full"></div>
                    </div>
                    <Link 
                      href="/publications" 
                      className="inline-flex items-center text-[#8B5C9E] hover:text-[#7a4f8a] font-semibold transition-colors"
                    >
                      View All Publications
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {regularPublications.slice(0, 6).map(publication => (
                      <PublicationCard key={publication.id} publication={publication} />
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
                  <GraduationCap className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Research in Progress</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Our research team is actively working on groundbreaking studies in orthopedic medicine. 
                  Publications will be available soon as we contribute to advancing medical knowledge.
                </p>
                <Link 
                  href="/contact" 
                  className="inline-flex items-center bg-gradient-to-r from-[#8B5C9E] to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-[#7a4f8a] hover:to-purple-700 transition-all duration-300 shadow-lg"
                >
                  Contact Research Team
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </section>
          )}

          {/* Call to Action Section */}
          <section className="mt-20 bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-12 text-center">
            <div className="max-w-3xl mx-auto">
              <GraduationCap className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Collaborate on Research
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Interested in collaborating on research projects or have questions about our publications? 
                We welcome partnerships with fellow researchers and academic institutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-8 py-3 rounded-full font-semibold hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 shadow-lg"
                >
                  Get In Touch
                </Link>
                <Link
                  href="/publications"
                  className="border-2 border-gray-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-700 transition-all duration-300"
                >
                  View All Research
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
}
