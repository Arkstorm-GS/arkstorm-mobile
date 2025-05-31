
import React from 'react'
import { Tabs } from 'expo-router'
import { COLORS } from '@/constants/theme';
import { BarChart2, MapPin, Clock, AlertTriangle, House, ClipboardCheck } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarStyle: {
          //position: 'absolute',
          elevation: 0,
          height: 60,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'overview': return <House color={color} size={size} />;
            case 'locations': return <MapPin color={color} size={size} />;
            case 'duration': return <Clock color={color} size={size} />;
            case 'damages': return <AlertTriangle color={color} size={size} />;
            case 'recommendations': return <ClipboardCheck color={color} size={size} />;
            default: return <BarChart2 color={color} size={size} />;
          }
        },
      })}
    >
      <Tabs.Screen name="overview" options={{ title: 'Panorama' }} />
      <Tabs.Screen name="locations" options={{ title: 'Locais' }} />
      <Tabs.Screen name="duration" options={{ title: 'Duração' }} />
      <Tabs.Screen name="damages" options={{ title: 'Prejuízos' }} />
      <Tabs.Screen name="recommendations" options={{ title: 'Recomendações' }} />
    </Tabs>
  );
}