import { Metadata } from "next";
import ClientPage from "./client-page";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: "Job Tinda - View Profile",
    description: "View profile on Job Tinda mobile app",
    openGraph: {
      title: "Job Tinda - View Profile",
      description: "Please open this link on your mobile device to view the profile.",
      type: "website",
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/shared-profile/${resolvedParams.id}`,
    },
  };
}

export default async function SharedProfilePage({ params }: Props) {
  const resolvedParams = await params;
  return <ClientPage profileId={resolvedParams.id} />;
}
