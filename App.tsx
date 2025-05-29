// App.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { initDB, debugDatabaseTables, resetDatabase } from './src/hooks/database';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import TabNavigator from './src/navigator/TabNavigator';
import MovieDetailsScreen from './src/screens/MovieDetailsScreen';
import SeatBookingScreen from './src/screens/SeatBookingScreen';
import TicketDetailScreen from './src/screens/TicketDetailScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import { COLORS } from './src/theme/theme';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Tab: { screen?: string; params?: any };
  MovieDetails: { movieid: number; isNowPlaying?: boolean };
  SeatBooking: { bgImage: string; PosterImage: string; movieId?: number; movieTitle?: string };
  TicketDetail: { movieTitle: string; seatArray: number[]; showTime: string; showDate: any; posterImage: string };
  ChangePassword: undefined; 
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { isLoggedIn, isLoading: authIsLoading } = useAuth();

  if (authIsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.NetflixRed} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="Tab" component={TabNavigator} options={{ animation: 'default' }} />
          <Stack.Screen name="MovieDetails" component={MovieDetailsScreen} options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="SeatBooking" component={SeatBookingScreen} options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="TicketDetail" component={TicketDetailScreen} options={{ animation: 'slide_from_bottom' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ animation: 'slide_from_bottom' }} />
        </>
      )}
    </Stack.Navigator>
  );
};

const App = () => {
  useEffect(() => {
    initDB()
      .then(() => debugDatabaseTables())
      .catch(error => console.error('[App] Lỗi khi reset hoặc kiểm tra cơ sở dữ liệu:', error));
  }, []);

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.Black,
  },
});

export default App;