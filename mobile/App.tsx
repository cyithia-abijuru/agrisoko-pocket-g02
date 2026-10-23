import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AboutScreen from './src/screens/AboutScreen';
import AskScreen from './src/screens/AskScreen';
import DirectoryScreen from './src/screens/DirectoryScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ResultScreen from './src/screens/ResultScreen';
import { colors } from './src/theme';
import { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff', contentStyle: { backgroundColor: colors.bg } }}>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'AgriSoko Pocket' }} />
          <Stack.Screen name="Ask" component={AskScreen} options={{ title: 'Ask the team' }} />
          <Stack.Screen name="Result" component={ResultScreen} />
          <Stack.Screen name="Directory" component={DirectoryScreen} options={{ title: 'Directory' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
