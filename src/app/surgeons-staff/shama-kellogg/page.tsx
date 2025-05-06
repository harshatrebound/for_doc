import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { ArrowLeft, Award, BookOpen, Briefcase, GraduationCap, FileText, Globe, Users, Heart, Stethoscope } from 'lucide-react';
import BookingButton from '@/components/BookingButton';

export default function ShamaKelloggPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <SiteHeader theme="light" />
      
      <Container className="pt-24 pb-16">
        <div className="flex items-center mb-8">
          <Link 
            href="/surgeons-staff" 
            className="inline-flex items-center text-[#8B5C9E] hover:text-[#7A4F8C] font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Team
          </Link>
        </div>
        
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center rounded-xl overflow-hidden bg-white shadow-md p-6 md:p-8 mb-10">
          <div className="md:w-1/4 flex justify-center mb-6 md:mb-0">
            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-[#f8f5fe]">
              <Image 
                src="/images/shama-kellogg.webp" 
                alt="Shama Kellogg" 
                width={192} 
                height={192} 
                className="object-cover"
              />
            </div>
          </div>
          <div className="md:w-3/4 md:pl-8 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Shama Kellogg</h1>
            <div className="flex flex-col md:flex-row items-center md:items-start">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 mb-4 md:mb-0 md:mr-4">
                <Stethoscope className="w-4 h-4 mr-1" />
                Sports Psychologist
              </span>
            </div>
            <p className="text-lg text-gray-600 mt-2 italic">
              MSc (Sports Psychology), MA (Clinical Psychology)<br />
              Sterling University, Scotland, UK
            </p>
            <div className="mt-6">
              <BookingButton className="px-6 py-3 bg-[#8B5C9E] hover:bg-[#7A4F8C] text-white rounded-lg shadow-md transition-colors" />
            </div>
          </div>
        </div>
        
        {/* Content Sections */}
        <div className="space-y-6">
          {/* Professional Biography Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 text-[#8B5C9E] mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Professional Biography</h2>
            </div>
            <div className="prose max-w-none">
              <p>Shama Kellogg has a vast experience in Sports Psychology with her well rounded training from UK and India.</p>
            </div>
          </div>
          
          {/* Qualifications/Education Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6">
            <div className="flex items-center mb-4">
              <GraduationCap className="h-5 w-5 text-[#8B5C9E] mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Education</h2>
            </div>
            <div className="prose max-w-none">
              <ul className="list-disc pl-5 space-y-2">
                <li>M.Sc. in Psychology of Sport University of Stirling, Stirling, Scotland, UK 2021-2022</li>
                <li>M.A. in Clinical Psychology St. Xavier's College, Ahmedabad 2019-2021</li>
                <li>B.A. (Hons.) in Psychology PDPU, Ahmedabad 2013-2017</li>
              </ul>
            </div>
          </div>
          
          {/* Work Experience Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6">
            <div className="flex items-center mb-4">
              <Briefcase className="h-5 w-5 text-[#8B5C9E] mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Work Experience</h2>
            </div>
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold">1. Consulting as a Sport Psychologist at Manipal Hospital- April 2024 onwards</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Administer psychological assessments to athletes to identify strengths, weaknesses, and areas for improvement. Analyze assessment results and develop personalized mental training programs.</li>
                <li>Implement mental skills training techniques to improve performance under pressure, enhance focus and concentration, manage stress, and develop pre-competition routines.</li>
                <li>Provide support and counseling to athletes during times of crisis, such as significant injuries, performance slumps, or personal challenges.</li>
              </ul>
              
              <h3 className="text-lg font-semibold mt-4">2. Employed as a Mental Health Support Worker at Cosgrove Care, Glasgow- 2022-2023</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Working with adults and children with learning disabilities, epilepsy, autism and physical support needs</li>
                <li>Using person-centered planning techniques in addition to delivering excellent support practices</li>
              </ul>
              
              <h3 className="text-lg font-semibold mt-4">3. Worked as an HR Trainee at Indifoss Analytical Pvt. Ltd., Ahmedabad- 2018-19</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Worked in the recruitment department wherein I screened the potential candidates according to the job requirements and processed their interviews with the organization</li>
                <li>Maintaining the employee records</li>
                <li>Conducting the employee engagement activities, especially workshops for technical and language proficiency.</li>
              </ul>
            </div>
          </div>
          
          {/* Research Projects Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 text-[#8B5C9E] mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Research</h2>
            </div>
            <div className="prose max-w-none">
              <ul className="list-disc pl-5 space-y-2">
                <li>The Difference in the Stress Levels: A study of 12th Grade Students of the Science and Humanities Stream Students before their Board Exams</li>
                <li>Stress Management in Hospitality: A study of students in the field of hospitality and their stress management depending on gender and locality</li>
                <li>Social Status of Female Athletes: A qualitative study to determine the social status of renowned female athletes amongst sports fans when considering gender-appropriate and gender-inappropriate sport</li>
              </ul>
              
              <h3 className="text-lg font-semibold mt-4">Internships</h3>
              <ul className="list-disc pl-5 space-y-3">
                <li>
                  <strong>1. Worked with Rossvale Football Club – 2023</strong>
                  <p>Collaborated with David Caldwell, head of Rossvale FC, to work with select footballers training for the elite route by applying Flow theory.</p>
                </li>
                <li>
                  <strong>2. Volunteered at Hospital for Mental Health (government hospital in India) – 2020</strong>
                  <p>Conducted art-based activities with the chronic ward patients with an intent to improve their well-being.</p>
                </li>
                <li>
                  <strong>3. Internship at Calorx Prerna School – 2016</strong>
                  <p>Worked with children who were intellectually challenged and volunteered to help with effective learning interventions which helped them cope better.</p>
                </li>
                <li>
                  <strong>4. Psychology Trainee while interning with Energia Wellbeing Pvt. Ltd.- 2015</strong>
                </li>
                <li>
                  <strong>5. Research Assistant for the Slum Rehabilitation in Ahmedabad: Impact Assessment – 2015</strong>
                  <p>Helped conduct surveys of people who were moved from slums into government apartments built across the city for 6 months. Tried to measure the social and psychological impact that the move had on the people and note their level of satisfaction with their improved living conditions.</p>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Extra Curricular Section */}
          <div className="rounded-xl overflow-hidden bg-white shadow-md p-6">
            <div className="flex items-center mb-4">
              <Heart className="h-5 w-5 text-[#8B5C9E] mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Extra Curricular</h2>
            </div>
            <div className="prose max-w-none">
              <ul className="list-disc pl-5 space-y-2">
                <li>Presented a paper at the 2nd Academic International Conference on Multi-Disciplinary studies and Education at the Cambridge University, Cambridge, United Kingdom- March 2017</li>
                <li>Basic Mountaineering Course at Nehru Institute of Mountaineering- June 2016</li>
                <li>Participated in All-India level Air-Pistol Shooting for 3 consecutive years- 2010, 2011, 2012</li>
              </ul>
            </div>
          </div>
        </div>
      </Container>

      <SiteFooter />
    </main>
  );
}
