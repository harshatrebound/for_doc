import { Metadata } from 'next';
import { getProcedureBySlug } from '../utils/csvParser';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const procedure = await getProcedureBySlug(params.slug);
  
  if (!procedure) {
    return {
      title: 'Procedure Not Found',
      description: 'The requested procedure could not be found.',
    };
  }

  return {
    title: `${procedure.title} | Orthopaedic Surgery`,
    description: procedure.summary,
    openGraph: {
      title: `${procedure.title} | Orthopaedic Surgery`,
      description: procedure.summary,
      images: procedure.imageUrl ? [procedure.imageUrl] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${procedure.title} | Orthopaedic Surgery`,
      description: procedure.summary,
      images: procedure.imageUrl ? [procedure.imageUrl] : [],
    },
  };
} 