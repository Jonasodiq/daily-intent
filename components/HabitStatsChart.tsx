
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
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

  const streakData = {
    labels: stats.map(s => s.habitName),
    datasets: [{ data: stats.map(s => s.streak) }]
  };

  const completionData = {
    labels: stats.map(s => s.habitName),
    datasets: [{ data: stats.map(s => s.completionRate) }]
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vanor – Streaks</Text>
      <BarChart
        data={streakData}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        fromZero
        showValuesOnTopOfBars
        yAxisLabel=""
        yAxisSuffix=" dagar"
      />
      <Text style={styles.title}>Vanor – Completion Rate (%)</Text>
      <BarChart
        data={completionData}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        fromZero
        showValuesOnTopOfBars
        yAxisLabel=""
        yAxisSuffix=" %"
      />
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
  propsForLabels: { fontSize: 12 }
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