import { Metadata, ResolvingMetadata } from 'next';
import { getProcedureBySlug } from '../utils/csvParser';

interface ProcedureLayoutProps {
  children: React.ReactNode;
  params: { slug: string };
}

export async function generateMetadata(
  { params }: ProcedureLayoutProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const procedure = await getProcedureBySlug(params.slug);
  
  if (!procedure) {
    return {
      title: 'Procedure Not Found',
      description: 'The requested procedure could not be found.'
    };
  }
  
  return {
    title: `${procedure.title} | Surgical Procedure`,
    description: procedure.summary
  };
}

export default function ProcedureLayout({ children }: ProcedureLayoutProps) {
  return children;
} 