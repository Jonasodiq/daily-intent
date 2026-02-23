import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { getHabits } from '../../services/habitService';
import { getCompletions, calculateStreak } from '../../services/completionService';
import { Habit, HabitCompletion } from '../../types';

export default function StatsScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

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
  const completedToday = completions.filter(c => c.date === today).length;
  const totalHabits = habits.length;
  const percentage = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  const getHabitStreak = (habitId: string) => {
    const habitCompletions = completions.filter(c => c.habitId === habitId);
    return calculateStreak(habitCompletions);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Laddar statistik...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Statistik 📊</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Idag</Text>
        <Text style={styles.percentage}>{percentage}%</Text>
        <Text style={styles.summaryText}>
          {completedToday} av {totalHabits} vanor genomförda
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Streaks 🔥</Text>

      <FlatList
        data={habits}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.habitCard}>
            <View>
              <Text style={styles.habitName}>{item.name}</Text>
              <Text style={styles.habitCategory}>{item.category}</Text>
            </View>
            <View style={styles.streakContainer}>
              <Text style={styles.streakNumber}>{getHabitStreak(item.id)}</Text>
              <Text style={styles.streakLabel}>dagar</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Inga vanor än! 🌱</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#6C63FF', marginBottom: 24, marginTop: 48 },
  loading: { textAlign: 'center', marginTop: 48, color: '#999' },
  summaryCard: { backgroundColor: '#6C63FF', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 24 },
  summaryTitle: { color: '#fff', fontSize: 16, opacity: 0.8 },
  percentage: { color: '#fff', fontSize: 64, fontWeight: 'bold' },
  summaryText: { color: '#fff', fontSize: 14, opacity: 0.8 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  habitCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 12 },
  habitName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  habitCategory: { fontSize: 14, color: '#999', marginTop: 4 },
  streakContainer: { alignItems: 'center' },
  streakNumber: { fontSize: 28, fontWeight: 'bold', color: '#6C63FF' },
  streakLabel: { fontSize: 12, color: '#999' },
  empty: { textAlign: 'center', color: '#999', marginTop: 48, fontSize: 16 },
});