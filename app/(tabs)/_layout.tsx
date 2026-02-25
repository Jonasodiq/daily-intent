
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Hem',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="habits" 
        options={{ 
          title: 'Vanor',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-circle" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="stats" 
        options={{ 
          title: 'Statistik',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="insights" 
        options={{ 
          title: 'Insikter',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bulb" size={size} color={color} />
          ),
        }} 
      />
    </Tabs>
  );
}
