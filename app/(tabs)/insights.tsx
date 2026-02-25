import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { getHabits } from '../../services/habitService';
import { getCompletions } from '../../services/completionService';
import { generateInsights, clearInsightsCache } from '../../services/aiService';
import { Habit, HabitCompletion } from '../../types';

export default function InsightsScreen() {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      
      // Hämta data
      const habitsData = await getHabits();
      const completionsData = await getCompletions();
      
      setHabits(habitsData);
      setCompletions(completionsData);

      // Generera insikter
      const aiInsights = await generateInsights(habitsData, completionsData);
      setInsights(aiInsights);
    } catch (error) {
      console.error('Fel vid laddning av insikter:', error);
      setInsights('⚠️ Kunde inte ladda insikter. Försök igen senare.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await clearInsightsCache(); // Rensa cache för att få nya insikter
    await loadInsights();
    setRefreshing(false);
  };

  const today = new Date().toISOString().split('T')[0];
  const completedToday = completions.filter(c => c.date === today).length;
  const totalHabits = habits.length;
  const percentage = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Analyserar dina vanor...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <Text style={styles.title}>AI-Insikter 🤖</Text>

      {/* Progress Card */}
      <View style={styles.progressCard}>
        <Text style={styles.progressLabel}>Dagens framsteg</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {completedToday} av {totalHabits} vanor ({percentage}%)
        </Text>
      </View>

      {/* Insights Card */}
      <View style={styles.insightsCard}>
        <Text style={styles.insightsTitle}>Dina personliga insikter</Text>
        <Text style={styles.insightsText}>{insights}</Text>
        
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>
            🔄 Uppdatera insikter
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tips Card */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Visste du att?</Text>
        <Text style={styles.tipsText}>
          Det tar i genomsnitt 66 dagar att forma en ny vana. Var tålmodig med dig själv och fira små framsteg!
        </Text>
      </View>

      <Text style={styles.footer}>
        AI-insikterna uppdateras automatiskt en gång per dag
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6C63FF',
    marginBottom: 24,
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  insightsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  insightsText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#555',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tipsCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  footer: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
});
