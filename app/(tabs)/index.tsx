import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { logoutUser } from '../../services/authService';
import ParallaxScrollView from '../../app-example/components/parallax-scroll-view';

export default function HomeScreen() {
  const handleLogout = async () => {
    await logoutUser();
    router.replace('/(auth)/login' as any);
  };

  return (
    <ParallaxScrollView
      headerImage={
        <Image
          source={require('../../assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
      headerBackgroundColor={{ light: '#eeeeee', dark: '#222222' }}>
      <View style={styles.container}>
        <Text style={styles.title}>Välkommen till {"\n"}Daily Intent!</Text>
        <Text style={styles.text}>
          Din personliga assistent för att skapa och upprätthålla goda vanor. {"\n\n"}
          Använd flikarna nedan för att lägga till vanor, se din utveckling och få insikter baserade på dina data.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logga ut</Text>
        </TouchableOpacity>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' },
  headerImage: { width: '100%', height: 120, backgroundColor: '#3d96f6' },
  title: { fontSize: 34, fontWeight: 'bold', color: '#0077aa', marginBottom: 32, textAlign: 'center' },
  text: { textAlign: 'center', margin: 32, padding: 32, fontSize: 16, color: '#333' },
  button: { backgroundColor: '#0077aa', borderRadius: 8, padding: 16, alignItems: 'center', width: '50%' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  reactLogo: { width: 310, height: 190, position: 'absolute', bottom: 0, left: 0, },
});