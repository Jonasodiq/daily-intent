import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { createHabit, getHabits, deleteHabit } from '../../services/habitService';
import { Habit } from '../../types';

export default function HabitsScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
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
            <View>
              <Text style={styles.habitName}>{item.name}</Text>
              <Text style={styles.habitCategory}>{item.category}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={styles.deleteButton}>🗑️</Text>
            </TouchableOpacity>
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
  habitName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  habitCategory: { fontSize: 14, color: '#999', marginTop: 4 },
  deleteButton: { fontSize: 20 },
  empty: { textAlign: 'center', color: '#999', marginTop: 48, fontSize: 16 },
});