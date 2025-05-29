// App.tsx
import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ActivityIndicator, View, StyleSheet} from 'react-native';

import TabNavigator from './src/navigator/TabNavigator';
import MovieDetailsScreen from './src/screens/MovieDetailsScreen';
import SeatBookingScreen from './src/screens/SeatBookingScreen';
import TicketScreen from './src/screens/TicketScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

import {
  initDB,
  retrieveLocalSession,
  clearLocalSession,
  getLoggedInUserCache,
  UserProfile, // Import UserProfile để sử dụng kiểu
  // clearUserTicketsCacheForUser, // Bỏ comment nếu bạn cần dùng trong handleLogout
} from './src/hooks/database';
import {COLORS} from './src/theme/theme';

// Định nghĩa kiểu cho Stack Navigator Params (quan trọng cho type safety)
export type RootStackParamList = {
  Login: {onLoginSuccess: (user: UserProfile) => void}; // LoginScreen nhận hàm callback
  Register: undefined;
  Tab: {screen?: string; params?: any; handleLogout?: () => Promise<void>}; // Cho phép truyền params và hàm logout vào TabNavigator
  MovieDetails: {movieid: number; isNowPlaying?: boolean};
  SeatBooking: {bgImage: string; PosterImage: string; movieId?: number}; // Thêm movieId nếu cần thiết
  TicketDetail: {
    // Giả sử TicketScreen được gọi là TicketDetail trong Stack này
    seatArray: number[];
    time: string;
    date: any; // Hoặc kiểu cụ thể hơn cho date
    ticketImage: string;
    // Thêm các params khác nếu TicketScreen của bạn cần
  };
  // Thêm các màn hình khác nếu có
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        await initDB();
        console.log('[App.tsx] DB Initialized');
        const userEmailFromSession = await retrieveLocalSession();
        console.log('[App.tsx] Retrieved session email:', userEmailFromSession);
        if (userEmailFromSession) {
          const cachedUser = await getLoggedInUserCache();
          console.log('[App.tsx] Retrieved cached user:', cachedUser);
          if (cachedUser && cachedUser.email === userEmailFromSession) {
            setCurrentUser(cachedUser);
            setIsLoggedIn(true);
            console.log(
              '[App.tsx] User is logged in from session:',
              cachedUser.email,
            );
          } else {
            console.log(
              '[App.tsx] Session email found, but no valid cached user. Clearing session.',
            );
            await clearLocalSession(); // Xóa session không hợp lệ
          }
        } else {
          console.log('[App.tsx] No local session found.');
        }
      } catch (e) {
        console.error('[App.tsx] Lỗi khi kiểm tra session cục bộ:', e);
      } finally {
        setIsCheckingAuth(false);
        console.log('[App.tsx] Auth check finished. isLoggedIn:', isLoggedIn);
      }
    };

    bootstrapAsync();
  }, []); // Chỉ chạy một lần khi app mount

  const handleLoginSuccess = (user: UserProfile) => {
    console.log('[App.tsx] Login successful for user:', user.email);
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    console.log('[App.tsx] Handling logout...');
    if (currentUser && currentUser.email) {
      // await clearUserTicketsCacheForUser(currentUser.email); // Xóa cache vé nếu cần
      console.log(
        `[App.tsx] Tickets cache would be cleared for ${currentUser.email} if function was active.`,
      );
    }
    await clearLocalSession(); // Bao gồm cả clearLoggedInUserCache()
    setCurrentUser(null);
    setIsLoggedIn(false);
    console.log('[App.tsx] User logged out.');
  };

  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.NetflixRed} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {isLoggedIn && currentUser ? (
            // Luồng khi đã đăng nhập
            <>
              <Stack.Screen
                name="Tab"
                component={TabNavigator}
                options={{animation: 'default'}}
              />
              <Stack.Screen
                name="MovieDetails"
                component={MovieDetailsScreen}
                options={{animation: 'slide_from_right'}}
              />
              <Stack.Screen
                name="SeatBooking"
                component={SeatBookingScreen}
                options={{animation: 'slide_from_bottom'}}
              />
              <Stack.Screen
                name="TicketDetail" // Đảm bảo key này là duy nhất nếu bạn có TicketScreen khác trong Tab
                component={TicketScreen}
                options={{animation: 'slide_from_bottom'}}
              />
            </>
          ) : (
            // Luồng khi chưa đăng nhập
            <>
              <Stack.Screen
                name="Login"
                options={{animation: 'slide_from_bottom'}}>
                {props => (
                  <LoginScreen {...props} onLoginSuccess={handleLoginSuccess} />
                )}
              </Stack.Screen>
              <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{animation: 'slide_from_bottom'}}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.Black, // Giả sử bạn có COLORS.Black trong theme
  },
});

export default App;
