import { Metadata } from 'next';
import PerfilClient from './PerfilClient';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username}`,
  };
}

export default async function Perfil({ params }: Props) {
  return <PerfilClient params={params} />;
}
