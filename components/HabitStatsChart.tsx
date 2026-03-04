import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

interface HabitStat {
  habitName: string;
  streak: number;
  completionRate: number;
}

interface StatsProps {
  stats: HabitStat[];
}

export const HabitStatsChart: React.FC<StatsProps> = ({ stats }) => {
  const screenWidth = Dimensions.get('window').width;
  const barWidth = 80;
  const chartWidth = Math.max(screenWidth - 32, stats.length * barWidth);

  const maxStreak = Math.max(1, ...stats.map((s) => s.streak));

  const shortLabel = (name: string) =>
    name.length > 10 ? name.slice(0, 10) + '…' : name;

  const streakData = {
    labels: stats.map((s) => shortLabel(s.habitName)),
    datasets: [{ data: stats.map((s) => s.streak) }],
  };

  const completionData = {
    labels: stats.map((s) => shortLabel(s.habitName)),
    datasets: [{ data: stats.map((s) => s.completionRate) }],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vanor – Streaks</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <BarChart
          data={streakData}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          fromZero
          segments={maxStreak}
          showValuesOnTopOfBars
          yAxisLabel=""
          yAxisSuffix=" dagar"
        />
      </ScrollView>
      <Text style={styles.title}>Vanor – Completion Rate (%)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <BarChart
          data={completionData}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          fromZero
          showValuesOnTopOfBars
          yAxisLabel=""
          yAxisSuffix=" %"
        />
      </ScrollView>
    </View>
  );
};

const chartConfig = {
  backgroundColor: '#fff',
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: { borderRadius: 16 },
  propsForLabels: { fontSize: 12 },
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
  },
});
