import { Metadata } from 'next';
import ClientPage from './client-page';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'Job Tinda - View Profile',
    description: 'View profile on Job Tinda mobile app',
    openGraph: {
      title: 'Job Tinda - View Profile',
      description: 'Please open this link on your mobile device to view the profile.',
      type: 'website',
      url: `https://jobtinda.de/shared-profile/${params.id}`,
    },
  };
}

export default function SharedProfilePage({ params }: Props) {
  return <ClientPage profileId={params.id} />;
}
