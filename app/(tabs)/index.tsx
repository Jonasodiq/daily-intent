import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { logoutUser } from '../../services/authService';

export default function HomeScreen() {
  const handleLogout = async () => {
    await logoutUser();
    router.replace('/(auth)/login' as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Välkommen till Daily Intent! 🎉</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logga ut</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#6C63FF', marginBottom: 32 },
  button: { backgroundColor: '#FF6B6B', borderRadius: 8, padding: 16, alignItems: 'center', width: '80%' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});