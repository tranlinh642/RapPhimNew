// src/screens/RegisterScreen.tsx
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
  StatusBar, 
} from 'react-native';
import { COLORS, FONTFAMILY, FONTSIZE, SPACING, BORDERRADIUS } from '../theme/theme';
import { registerLocalUser } from '../hooks/database'; 
import AppHeader from '../components/AppHeader';

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp!');
      return;
    }
    setIsLoading(true);
    try {
      // Gọi hàm đăng ký cục bộ từ database.ts
      await registerLocalUser(name.trim(), email.trim().toLowerCase(), password);

      Alert.alert(
        'Đăng ký thành công', // Bỏ chữ "giả lập"
        'Tài khoản của bạn đã được tạo. Vui lòng đăng nhập.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      // Lỗi có thể là do email đã tồn tại (nếu bạn đã implement kiểm tra đó trong registerLocalUser)
      // Hoặc lỗi SQLite khác.
      Alert.alert('Đăng ký thất bại', error.message || 'Đã có lỗi xảy ra trong quá trình đăng ký.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar hidden={false} backgroundColor={COLORS.Black} barStyle={'light-content'} />
      <View style={styles.appHeaderContainer}>
        <AppHeader
          name="arrow-back-outline"
          header="Tạo Tài Khoản"
          action={() => navigation.goBack()}
          // customIconStyle nếu bạn muốn tùy chỉnh thêm style cho icon/background của icon AppHeader
          // customIconStyle={{ backgroundColor: COLORS.BlackRGB10 }} // Ví dụ
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Tên hiển thị"
            value={name}
            onChangeText={setName}
            placeholderTextColor={COLORS.WhiteRGBA50}
            autoCapitalize="words"
          />
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
            placeholder="Mật khẩu (ít nhất 6 ký tự)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={COLORS.WhiteRGBA50}
          />
          <TextInput
            style={styles.input}
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholderTextColor={COLORS.WhiteRGBA50}
          />
          {isLoading ? (
            <ActivityIndicator size="large" color={COLORS.NetflixRed} style={styles.loader} />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Đăng Ký</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.loginLinkContainer}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Đã có tài khoản? </Text>
            <Text style={[styles.loginText, styles.loginLink]}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  appHeaderContainer: {
    position: 'absolute', // Đảm bảo AppHeader nằm trên backdrop
    top: (StatusBar.currentHeight || 0) + SPACING.space_10,
    left: SPACING.space_10,
    right: SPACING.space_10,
    zIndex: 10, // Đảm bảo AppHeader nổi trên
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    paddingHorizontal: SPACING.space_24,
    paddingBottom: SPACING.space_20,
 
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
  button: {
    backgroundColor: COLORS.NetflixRed,
    paddingVertical: SPACING.space_16,
    borderRadius: BORDERRADIUS.radius_8,
    alignItems: 'center',
    marginBottom: SPACING.space_20,
  },
  buttonText: {
    color: COLORS.White,
    fontSize: FONTSIZE.size_16,
    fontFamily: FONTFAMILY.poppins_semibold,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.space_10,
  },
  loginText: {
    color: COLORS.WhiteRGBA75,
    fontSize: FONTSIZE.size_14,
    fontFamily: FONTFAMILY.poppins_regular,
    textAlign: 'center',
  },
  loginLink: {
    color: COLORS.White,
    fontFamily: FONTFAMILY.poppins_semibold,
  },
  loader: {
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.space_20,
  }
});

export default RegisterScreen;