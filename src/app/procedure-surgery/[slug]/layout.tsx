import { Metadata, ResolvingMetadata } from 'next';
import { getProcedureSurgeryBySlug } from '@/lib/directus';

interface ProcedureLayoutProps {
  children: React.ReactNode;
  params: { slug: string };
}

export async function generateMetadata(
  { params }: ProcedureLayoutProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const procedure = await getProcedureSurgeryBySlug(params.slug);
  
  if (!procedure) {
    return {
      title: 'Procedure Not Found',
      description: 'The requested procedure could not be found.'
    };
  }
  
  const title = procedure.meta_title || `${procedure.title} | Surgical Procedure`;
  const description = procedure.meta_description || procedure.description || 'Learn about this surgical procedure from our expert orthopedic team.';
  
  return {
    title,
    description
  };
}

export default function ProcedureLayout({ children }: ProcedureLayoutProps) {
  return children;
} 