import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../types/navigation';
import Dashboard from '../screens/DashboardScreen';
import Amenities from '../screens/AmenitiesScreen';
import Community from '../screens/CommunityScreen';
import Profile from '../screens/ProfileScreen';
import { useFeatures } from '../context/FeatureContext';

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  const { config } = useFeatures();

  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Amenities" component={Amenities} />
      {config.communityEnabled && <Tab.Screen name="Community" component={Community} />}
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
