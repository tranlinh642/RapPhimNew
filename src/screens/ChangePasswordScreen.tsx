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
import {
  COLORS,
  FONTFAMILY,
  FONTSIZE,
  SPACING,
  BORDERRADIUS,
} from '../theme/theme';
import AppHeader from '../components/AppHeader';
import { useAuth } from '../context/AuthContext';
import { updateLocalUserPassword } from '../hooks/database';

interface ChangePasswordScreenProps {
  navigation: any;
}

const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async () => {
    if (!user || !user.email) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      return;
    }
    if (!oldPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (oldPassword === newPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới không được trùng với mật khẩu cũ.');
      return;
    }

    setIsLoading(true);
    try {
      await updateLocalUserPassword(user.email, oldPassword, newPassword);
      Alert.alert(
        'Thành công',
        'Đổi mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới nếu được yêu cầu.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Đổi mật khẩu thất bại', error.message || 'Đã có lỗi xảy ra.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar hidden={false} barStyle="light-content" backgroundColor={COLORS.Black} />
      <View style={styles.appHeaderContainer}>
        <AppHeader
          name="arrow-back-outline"
          header="Đổi Mật Khẩu"
          action={() => navigation.goBack()}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          <Text style={styles.label}>Mật khẩu cũ</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu cũ"
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry
            placeholderTextColor={COLORS.WhiteRGBA50}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Mật khẩu mới</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholderTextColor={COLORS.WhiteRGBA50}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập lại mật khẩu mới"
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            secureTextEntry
            placeholderTextColor={COLORS.WhiteRGBA50}
            autoCapitalize="none"
          />

          {isLoading ? (
            <ActivityIndicator size="large" color={COLORS.NetflixRed} style={styles.loader} />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handlePasswordChange}>
              <Text style={styles.buttonText}>Lưu Thay Đổi</Text>
            </TouchableOpacity>
          )}
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
    paddingHorizontal: SPACING.space_20,
    paddingTop: (StatusBar.currentHeight || 0) + SPACING.space_10,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    paddingHorizontal: SPACING.space_24,
    paddingVertical: SPACING.space_20,
  },
  label: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_14,
    color: COLORS.WhiteRGBA75,
    marginBottom: SPACING.space_8,
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
  button: {
    backgroundColor: COLORS.NetflixRed,
    paddingVertical: SPACING.space_16,
    borderRadius: BORDERRADIUS.radius_8,
    alignItems: 'center',
    marginTop: SPACING.space_10,
  },
  buttonText: {
    color: COLORS.White,
    fontSize: FONTSIZE.size_16,
    fontFamily: FONTFAMILY.poppins_semibold,
  },
  loader: {
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.space_10,
  },
});

export default ChangePasswordScreen;