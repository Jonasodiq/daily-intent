import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { HabitStatsChart } from '../../components/HabitStatsChart';
import {
  calculateStreak,
  getCompletions,
} from '../../services/completionService';
import { getHabits } from '../../services/habitService';
import { Habit, HabitCompletion } from '../../types';

export default function StatsScreen() {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    try {
      const habitsData = await getHabits();
      const completionsData = await getCompletions();
      setHabits(habitsData);
      setCompletions(completionsData);
    } catch (error) {
      Alert.alert('Fel', 'Kunde inte hämta statistik');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const completedToday = completions.filter((c) => c.date === today).length;
  const totalHabits = habits.length;
  const percentage =
    habits.length > 0
      ? Math.round(
          (completions.filter((c) => c.date === today).length / habits.length) *
            100,
        )
      : 0;

  const getHabitStreak = (habitId: string) => {
    const habitCompletions = completions.filter((c) => c.habitId === habitId);
    return calculateStreak(habitCompletions);
  };

  const chartStats = habits.map((habit) => ({
    habitName: habit.name,
    streak: getHabitStreak(habit.id),
    completionRate: Math.round(
      (completions.filter((c) => c.habitId === habit.id).length / totalHabits) *
        100,
    ),
  }));

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Laddar statistik...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Statistik</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Idag</Text>
        <Text style={styles.percentage}>{percentage}%</Text>
        <Text style={styles.summaryText}>
          {completedToday} av {totalHabits} vanor genomförda
        </Text>
      </View>

      <HabitStatsChart stats={chartStats} />

      <Text style={styles.sectionTitle}>Streaks</Text>
      {habits.length === 0 ? (
        <Text style={styles.empty}>Inga vanor än! 🌱</Text>
      ) : (
        habits.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.habitCard}
            onPress={() =>
              router.push({
                pathname: '/habit/[id]',
                params: {
                  id: item.id,
                  name: item.name,
                  category: item.category,
                },
              })
            }
            activeOpacity={0.7}
          >
            <View>
              <Text style={styles.habitName}>{item.name}</Text>
              <Text style={styles.habitCategory}>{item.category}</Text>
            </View>
            <View style={styles.rightSide}>
              <View style={styles.streakContainer}>
                <Text style={styles.streakNumber}>
                  {getHabitStreak(item.id)}
                </Text>
                <Text style={styles.streakLabel}>dagar</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contentContainer: { padding: 24, paddingBottom: 48 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6C63FF',
    marginBottom: 24,
    marginTop: 48,
  },
  loading: { textAlign: 'center', marginTop: 48, color: '#999' },
  summaryCard: {
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  percentage: { color: '#fff', fontSize: 64, fontWeight: 'bold' },
  summaryText: { color: '#fff', fontSize: 14, opacity: 0.8 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  habitCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 12,
  },
  habitName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  habitCategory: { fontSize: 14, color: '#999', marginTop: 4 },
  streakContainer: { alignItems: 'center' },
  rightSide: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  streakNumber: { fontSize: 28, fontWeight: 'bold', color: '#6C63FF' },
  streakLabel: { fontSize: 12, color: '#999' },
  chevron: { fontSize: 24, color: '#ccc', marginLeft: 8 },
  empty: { textAlign: 'center', color: '#999', marginTop: 48, fontSize: 16 },
});
