import { useLocalSearchParams } from 'expo-router';
import { ScenarioCategoryScreen } from '@/features/scenarios/screens/ScenarioCategoryScreen';

export default function ScenarioCategoryRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <ScenarioCategoryScreen categorySlug={slug} />;
}
