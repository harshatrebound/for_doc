import { Metadata } from 'next';
import { getProcedureSurgeryBySlug } from '@/lib/directus';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const procedure = await getProcedureSurgeryBySlug(params.slug);
  
  if (!procedure) {
    return {
      title: 'Procedure Not Found',
      description: 'The requested procedure could not be found.',
    };
  }

  const title = procedure.meta_title || `${procedure.title} | Orthopaedic Surgery`;
  const description = procedure.meta_description || procedure.description || 'Learn about this surgical procedure from our expert orthopedic team.';
  const imageUrl = procedure.featured_image_url || '/images/default-procedure.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [imageUrl],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
} 