import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { createHabit, getHabits, deleteHabit } from '../../services/habitService';
import { completeHabit, isCompletedToday } from '../../services/completionService';
import { Habit } from '../../types';

export default function HabitsScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedToday, setCompletedToday] = useState<{[key: string]: boolean}>({});
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const data = await getHabits();
      setHabits(data);
      
      // Kolla vilka vanor är genomförda idag
      const completedMap: {[key: string]: boolean} = {};
      for (const habit of data) {
        completedMap[habit.id] = await isCompletedToday(habit.id);
      }
      setCompletedToday(completedMap);
    } catch (error) {
      Alert.alert('Fel', 'Kunde inte hämta vanor');
    }
  };

  const handleCreate = async () => {
    if (!name || !category) {
      Alert.alert('Fel', 'Fyll i namn och kategori');
      return;
    }
    try {
      setLoading(true);
      await createHabit(name, category);
      setName('');
      setCategory('');
      loadHabits();
    } catch (error) {
      Alert.alert('Fel', 'Kunde inte skapa vana');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (habitId: string) => {
    try {
      await deleteHabit(habitId);
      loadHabits();
    } catch (error) {
      Alert.alert('Fel', 'Kunde inte ta bort vana');
    }
  };

  const handleComplete = async (habitId: string) => {
    if (completedToday[habitId]) {
      Alert.alert('Info', 'Du har redan genomfört denna vana idag! 🎉');
      return;
    }
    try {
      await completeHabit(habitId);
      setCompletedToday(prev => ({ ...prev, [habitId]: true }));
    } catch (error) {
      Alert.alert('Fel', 'Kunde inte markera vana');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mina Vanor</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Namn på vana t.ex. Träna"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Kategori t.ex. Hälsa"
        value={category}
        onChangeText={setCategory}
      />
      <TouchableOpacity style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>
          {loading ? 'Skapar...' : '+ Skapa vana'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={habits}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.habitCard}>
            <View style={styles.habitInfo}>
              <Text style={styles.habitName}>{item.name}</Text>
              <Text style={styles.habitCategory}>{item.category}</Text>
            </View>
            <View style={styles.habitActions}>
              <TouchableOpacity 
                style={[styles.completeButton, completedToday[item.id] && styles.completedButton]}
                onPress={() => handleComplete(item.id)}
              >
                <Text style={styles.completeText}>
                  {completedToday[item.id] ? '✅' : '⬜'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteButton}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Inga vanor än – skapa din första! 🌱</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#6C63FF', marginBottom: 24, marginTop: 48 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },
  button: { backgroundColor: '#6C63FF', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 24 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  habitCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 12 },
  habitInfo: { flex: 1 },
  habitName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  habitCategory: { fontSize: 14, color: '#999', marginTop: 4 },
  habitActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  completeButton: { padding: 4 },
  completedButton: { opacity: 0.7 },
  completeText: { fontSize: 24 },
  deleteButton: { fontSize: 20 },
  empty: { textAlign: 'center', color: '#999', marginTop: 48, fontSize: 16 },
});