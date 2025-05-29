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
import { loginLocalUser, storeLocalSession, UserProfile } from '../hooks/database'; // Import UserProfile

interface LoginScreenProps {
  navigation: any;
  onLoginSuccess: (user: UserProfile) => void; // Hàm callback để App.tsx cập nhật state
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu.');
      return;
    }
    setIsLoading(true);
    try {
      const userProfile = await loginLocalUser(email.trim(), password);

      if (userProfile) {
        // Kiểm tra userProfile.email có giá trị không trước khi lưu session
        if (userProfile.email) {
          await storeLocalSession(userProfile.email); // Lưu email làm "session"
          Alert.alert('Đăng nhập thành công', `Chào mừng ${userProfile.name || userProfile.email}!`);
          onLoginSuccess(userProfile); // Gọi callback để App.tsx cập nhật trạng thái
        } else {
          // Trường hợp này không nên xảy ra nếu loginLocalUser trả về UserProfile hợp lệ với email
          Alert.alert('Đăng nhập thất bại', 'Thông tin người dùng không hợp lệ (thiếu email).');
        }
      } else {
        Alert.alert('Đăng nhập thất bại', 'Email hoặc mật khẩu không đúng.');
      }
    } catch (error: any) {
      console.error('Lỗi trong quá trình đăng nhập:', error);
      Alert.alert('Đăng nhập thất bại', error.message || 'Đã có lỗi không mong muốn xảy ra.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Quên mật khẩu pressed');
    Alert.alert('Thông báo', 'Chức năng Quên mật khẩu chưa được cài đặt.');
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

        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.NetflixRed} style={styles.loader} />
        ) : (
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Đăng Nhập</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.registerLinkContainer}
          onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>Chưa có tài khoản? </Text>
          <Text style={[styles.registerText, styles.registerLink]}>Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Styles (giữ nguyên như trước, đảm bảo có BORDERRADIUS từ theme)
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
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.space_36,
  }
});

export default LoginScreen;