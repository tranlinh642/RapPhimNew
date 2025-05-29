// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { COLORS, FONTFAMILY, FONTSIZE, SPACING, BORDERRADIUS } from '../theme/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Giả sử App.tsx ở thư mục gốc và export RootStackParamList
import { useAuth } from '../context/AuthContext'; // Import useAuth để gọi hàm login

// Định nghĩa kiểu props cho LoginScreen sử dụng NativeStackScreenProps
type LoginScreenNavigationProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

// LoginScreenProps giờ đây nhận navigation và route từ kiểu trên
interface LoginScreenProps extends LoginScreenNavigationProps {}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [isLoading, setIsLoading] = useState(false); // Sẽ dùng isLoading từ useAuth

  const { login, isLoading: authIsLoading } = useAuth(); // Lấy hàm login và trạng thái loading từ AuthContext

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu.');
      return;
    }
    // Không cần setIsLoading(true) ở đây nữa vì useAuth().login() sẽ quản lý
    try {
      const success = await login(email.trim(), password); // Gọi hàm login từ context
      if (success) {
        // Đăng nhập thành công, AuthContext sẽ cập nhật trạng thái isLoggedIn,
        // và AppNavigator sẽ tự động chuyển màn hình.
        // Không cần điều hướng thủ công hay gọi onLoginSuccess ở đây.
        console.log('Đăng nhập thành công thông qua AuthContext!');
        // Alert.alert('Thông báo', 'Đăng nhập thành công!'); // Có thể bỏ Alert này nếu chuyển màn hình ngay
      } else {
        // Hàm login trong AuthContext đã return false (ví dụ: thông tin không đúng nhưng không phải lỗi kỹ thuật)
        Alert.alert('Đăng nhập thất bại', 'Email hoặc mật khẩu không đúng.');
      }
    } catch (error: any) {
      // Hàm login trong AuthContext đã throw error (ví dụ: lỗi mạng, lỗi server)
      Alert.alert('Đăng nhập thất bại', error.message || 'Đã có lỗi không mong muốn xảy ra.');
    }
    // Không cần setIsLoading(false) ở đây nữa
  };

  const handleForgotPassword = () => {
    console.log('Quên mật khẩu pressed');
    Alert.alert('Thông báo', 'Chức năng Quên mật khẩu hiện không được hỗ trợ trong phiên bản này.');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.welcomeTitle}>Welcome Back</Text>
        <Text style={styles.subtitle}>Please sign in to continue</Text>

        <TextInput
          style={styles.input}
          placeholder="Email hoặc Tên đăng nhập"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={COLORS.WhiteRGBA50}
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={COLORS.WhiteRGBA50}
        />

        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        {authIsLoading ? ( // Sử dụng authIsLoading từ useAuth()
          <ActivityIndicator size="large" color={COLORS.NetflixRed} style={styles.loader} />
        ) : (
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Đăng Nhập</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.registerLinkContainer}
          onPress={() => navigation.navigate('Register')} // Điều hướng đến màn hình Register
        >
          <Text style={styles.registerText}>Chưa có tài khoản? </Text>
          <Text style={[styles.registerText, styles.registerLink]}>Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: COLORS.Black,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.space_24,
    paddingBottom: SPACING.space_20,
  },
  welcomeTitle: {
    fontSize: FONTSIZE.size_30,
    color: COLORS.White,
    fontFamily: FONTFAMILY.poppins_bold,
    textAlign: 'center',
    marginBottom: SPACING.space_10,
  },
  subtitle: {
    fontSize: FONTSIZE.size_16,
    color: COLORS.WhiteRGBA75,
    fontFamily: FONTFAMILY.poppins_regular,
    textAlign: 'center',
    marginBottom: SPACING.space_36,
  },
  input: {
    backgroundColor: COLORS.DarkGrey,
    color: COLORS.White,
    borderRadius: BORDERRADIUS.radius_8,
    paddingVertical: SPACING.space_15,
    paddingHorizontal: SPACING.space_16,
    marginBottom: SPACING.space_18,
    fontSize: FONTSIZE.size_14,
    fontFamily: FONTFAMILY.poppins_regular,
  },
  forgotPasswordText: {
    color: COLORS.NetflixRed,
    fontSize: FONTSIZE.size_12,
    fontFamily: FONTFAMILY.poppins_medium,
    textAlign: 'right',
    marginBottom: SPACING.space_24,
    paddingHorizontal: SPACING.space_4,
  },
  loginButton: {
    backgroundColor: COLORS.NetflixRed,
    paddingVertical: SPACING.space_16,
    borderRadius: BORDERRADIUS.radius_8,
    alignItems: 'center',
    marginBottom: SPACING.space_36,
  },
  loginButtonText: {
    color: COLORS.White,
    fontSize: FONTSIZE.size_16,
    fontFamily: FONTFAMILY.poppins_semibold,
  },
  registerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: COLORS.WhiteRGBA75,
    fontSize: FONTSIZE.size_14,
    fontFamily: FONTFAMILY.poppins_regular,
    textAlign: 'center',
  },
  registerLink: {
    color: COLORS.White,
    fontFamily: FONTFAMILY.poppins_semibold,
  },
  loader: {
    height: 58, // Giữ chiều cao tương đương nút LoginButton
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.space_36, // Giữ margin tương đương LoginButton
  }
});

export default LoginScreen;