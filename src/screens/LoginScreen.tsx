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
import { RootStackParamList } from '../../App';
import { useAuth } from '../context/AuthContext';
import Fontisto from 'react-native-vector-icons/Fontisto';

type LoginScreenNavigationProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

interface LoginScreenProps extends LoginScreenNavigationProps {}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login, isLoading: authIsLoading } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu.');
      return;
    }
    try {
      const success = await login(email.trim(), password);
      if (success) {
        console.log('Đăng nhập thành công thông qua AuthContext!');
      } else {
      }
    } catch (error: any) {
      Alert.alert('Đăng nhập thất bại', error.message || 'Đã có lỗi không mong muốn xảy ra.');
    }
  };

  const handleForgotPassword = () => {
    console.log('Quên mật khẩu pressed');
    Alert.alert('Thông báo', 'Chức năng Quên mật khẩu hiện không được hỗ trợ trong phiên bản này.');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Fontisto name="film" style={styles.logoIcon} />
          <Text style={styles.logoText}>CVL Cinema</Text>
        </View>

        <Text style={styles.welcomeTitle}>Welcome Back</Text>
        <Text style={styles.subtitle}>Please sign in to continue</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
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

        {authIsLoading ? (
          <ActivityIndicator size="large" color={COLORS.NetflixRed} style={styles.loader} />
        ) : (
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Đăng Nhập</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.registerLinkContainer}
          onPress={() => navigation.navigate('Register')}
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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.space_28, 
  },
  logoIcon: {
    fontSize: FONTSIZE.size_30 * 2,
    color: COLORS.NetflixRed,
    marginRight: SPACING.space_10,
  },
  logoText: {
    fontSize: FONTSIZE.size_30 * 1.5,
    color: COLORS.NetflixRed,
    fontFamily: FONTFAMILY.poppins_bold,
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
    borderWidth: 1, 
    borderColor: COLORS.Grey, 
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