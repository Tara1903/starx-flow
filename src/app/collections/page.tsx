import { Metadata } from 'next';
import { CollectionPage } from '@/components/collection/CollectionPage';

export const metadata: Metadata = {
  title: 'Premium Ayurvedic Collection',
  description: 'Discover our premium range of authentic Ayurvedic formulations crafted to strengthen daily wellness.',
};

export default function CollectionsRoute() {
  return <CollectionPage />;
}
