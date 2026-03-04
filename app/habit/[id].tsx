import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import {
  calculateStreak,
  getCompletions,
} from '../../services/completionService';
import { HabitCompletion } from '../../types';

const SCREEN_WIDTH = Dimensions.get('window').width;

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function formatDate(date: string): string {
  const d = new Date(date);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export default function HabitDetailScreen() {
  const { id, name, category } = useLocalSearchParams<{
    id: string;
    name: string;
    category: string;
  }>();
  const router = useRouter();
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCompletions()
      .then((all) => setCompletions(all.filter((c) => c.habitId === id)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const dateSet = new Set(completions.map((c) => c.date));
  const streak = calculateStreak(completions);

  const countInRange = (days: number) => {
    let count = 0;
    for (let i = 0; i < days; i++) {
      if (dateSet.has(daysAgo(i))) count++;
    }
    return count;
  };

  // Last 7 days chart
  const last7: string[] = Array.from({ length: 7 }, (_, i) => daysAgo(6 - i));
  const chartLabels = last7.map((d) => formatDate(d));
  const chartData = last7.map((d) => (dateSet.has(d) ? 1 : 0));

  const periods = [
    { label: 'Idag', days: 1 },
    { label: '3 dagar', days: 3 },
    { label: '1 vecka', days: 7 },
    { label: '1 månad', days: 30 },
  ];

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Laddar...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity
        onPress={() => router.dismiss()}
        style={styles.backButton}
      >
        <Text style={styles.backText}>← Tillbaka</Text>
      </TouchableOpacity>

      <Text style={styles.habitName}>{name}</Text>
      <Text style={styles.habitCategory}>{category}</Text>

      {/* Streak */}
      <View style={styles.streakCard}>
        <Text style={styles.streakLabel}>🔥 Nuvarande streak</Text>
        <Text style={styles.streakNumber}>{streak}</Text>
        <Text style={styles.streakUnit}>dagar i rad</Text>
      </View>

      {/* Period summary cards */}
      <View style={styles.periodsRow}>
        {periods.map(({ label, days }) => {
          const count = countInRange(days);
          const pct = Math.round((count / days) * 100);
          return (
            <View key={label} style={styles.periodCard}>
              <Text style={styles.periodLabel}>{label}</Text>
              <Text style={styles.periodPct}>{pct}%</Text>
              <Text style={styles.periodSub}>
                {count}/{days}
              </Text>
            </View>
          );
        })}
      </View>

      {/* 7-day bar chart */}
      <Text style={styles.sectionTitle}>Senaste 7 dagarna</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <BarChart
          data={{ labels: chartLabels, datasets: [{ data: chartData }] }}
          width={Math.max(SCREEN_WIDTH - 32, 7 * 50)}
          height={180}
          fromZero
          segments={1}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            propsForLabels: { fontSize: 10 },
          }}
          yAxisLabel=""
          yAxisSuffix=""
          showValuesOnTopOfBars={false}
        />
      </ScrollView>

      {/* Total completions */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Totalt genomförda</Text>
        <Text style={styles.totalNumber}>{completions.length}</Text>
        <Text style={styles.totalUnit}>gånger</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: { color: '#999', fontSize: 16 },
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingBottom: 48 },
  backButton: { marginBottom: 16, marginTop: 56 },
  backText: { color: '#6C63FF', fontSize: 16, fontWeight: '600' },
  habitName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  habitCategory: { fontSize: 15, color: '#999', marginBottom: 24 },
  streakCard: {
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  streakLabel: { color: '#fff', fontSize: 14, opacity: 0.85, marginBottom: 4 },
  streakNumber: {
    color: '#fff',
    fontSize: 64,
    fontWeight: 'bold',
    lineHeight: 72,
  },
  streakUnit: { color: '#fff', fontSize: 14, opacity: 0.85 },
  periodsRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  periodCard: {
    flex: 1,
    backgroundColor: '#f0eeff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  periodLabel: { fontSize: 11, color: '#666', marginBottom: 4 },
  periodPct: { fontSize: 20, fontWeight: 'bold', color: '#6C63FF' },
  periodSub: { fontSize: 11, color: '#999', marginTop: 2 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  totalCard: {
    backgroundColor: '#f0eeff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 24,
  },
  totalLabel: { fontSize: 14, color: '#666', marginBottom: 4 },
  totalNumber: { fontSize: 48, fontWeight: 'bold', color: '#6C63FF' },
  totalUnit: { fontSize: 14, color: '#999' },
});
