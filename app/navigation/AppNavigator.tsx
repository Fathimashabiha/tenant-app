import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Welcome from '../screens/WelcomeScreen';
import Login from '../screens/LoginScreen';
import TabNavigator from './TabNavigator';
import Tenancy from '../screens/TenancyScreen';
import Bills from '../screens/BillsScreen';
import Maintenance from '../screens/MaintenanceScreen';
import Notifications from '../screens/NotificationsScreen';
import MoveIn from '../screens/MoveInScreen';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isLoggedIn } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={isLoggedIn ? 'Main' : 'Welcome'}
    >
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="Tenancy" component={Tenancy} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Bills" component={Bills} />
      <Stack.Screen name="Maintenance" component={Maintenance} />
      <Stack.Screen name="Notifications" component={Notifications} options={{ presentation: 'modal' }} />
      <Stack.Screen name="MoveIn" component={MoveIn} />
    </Stack.Navigator>
  );
}
