import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Hem' }} />
      <Tabs.Screen name="habits" options={{ title: 'Vanor' }} />
    </Tabs>
  );
}