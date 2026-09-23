import { useLocalSearchParams } from 'expo-router';
import { ScenarioDetailScreen } from '@/features/scenarios/screens/ScenarioDetailScreen';

export default function ScenarioDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ScenarioDetailScreen scenarioId={id} />;
}
