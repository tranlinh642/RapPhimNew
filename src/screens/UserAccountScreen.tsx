// src/screens/UserAccountScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  StatusBar,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
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
import { updateLocalUserName } from '../hooks/database';
import Ionicons from 'react-native-vector-icons/Ionicons';

const UserAccountScreen = ({ navigation }: any) => {
  const { user, logout, updateCurrentUsername } = useAuth();

  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name);
    } else if (user?.email) {
      setDisplayName(user.email);
    } else {
      setDisplayName('Người dùng');
    }
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          onPress: async () => {
            await logout();
          },
          style: 'destructive',
        },
      ],
    );
  };

  const navigateToChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleEditName = () => {
    setDisplayName(user?.name || user?.email || '');
    setIsEditingName(true);
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setDisplayName(user?.name || user?.email || 'Người dùng');
  };

  const handleSaveName = async () => {
    if (!user || !user.email) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng.');
      return;
    }
    if (displayName.trim() === (user.name || '')) {
      setIsEditingName(false);
      return;
    }

    setIsSavingName(true);
    try {
      await updateLocalUserName(user.email, displayName.trim());
      updateCurrentUsername(displayName.trim());
      Alert.alert('Thành công', 'Tên hiển thị đã được cập nhật.');
      setIsEditingName(false);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật tên hiển thị.');
    } finally {
      setIsSavingName(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={false} barStyle="light-content" backgroundColor={COLORS.Black} />
      <View style={styles.appHeaderContainer}>
        <AppHeader
          name="arrow-back-outline"
          header={'Tài Khoản'}
          action={() => navigation.goBack()}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Phần nội dung chính phía trên */}
        <View style={styles.topContent}>
          <View style={styles.profileContainer}>
            <Image
              source={require('../assets/image/avatar.png')}
              style={styles.avatarImage}
            />
            
            {!isEditingName ? (
              <View style={styles.displayNameContainer}>
                <Text style={styles.displayNameText}>
                  {user?.name || (user?.email ? user.email : 'Người dùng')}
                </Text>
                <TouchableOpacity onPress={handleEditName} style={styles.editIcon}>
                  <Ionicons name="pencil-outline" size={FONTSIZE.size_20} color={COLORS.WhiteRGBA75} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.editNameContainer}>
                <TextInput
                  style={styles.nameInput}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Nhập tên hiển thị mới"
                  placeholderTextColor={COLORS.WhiteRGBA50}
                  autoFocus={true}
                />
                {isSavingName ? (
                  <ActivityIndicator size="small" color={COLORS.NetflixRed} style={{marginLeft: SPACING.space_10}}/>
                ) : (
                  <View style={styles.editNameActions}>
                    <TouchableOpacity onPress={handleSaveName} style={[styles.actionButton, styles.saveButton]}>
                      <Ionicons name="checkmark-outline" size={FONTSIZE.size_24} color={COLORS.White} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleCancelEditName} style={[styles.actionButton, styles.cancelButton]}>
                       <Ionicons name="close-outline" size={FONTSIZE.size_24} color={COLORS.White} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {user?.email && !isEditingName && (
              <Text style={styles.emailText}>{user.email}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButtonFullWidth} onPress={navigateToChangePassword}>
            <Ionicons name="lock-closed-outline" size={FONTSIZE.size_20} color={COLORS.WhiteRGBA75} style={styles.actionIcon} />
            <Text style={styles.actionButtonText}>Đổi mật khẩu</Text>
            <Ionicons name="chevron-forward-outline" size={FONTSIZE.size_20} color={COLORS.WhiteRGBA50} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButtonFullWidth, styles.logoutButton]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={FONTSIZE.size_20} color={COLORS.White} style={styles.actionIcon} />
            <Text style={[styles.actionButtonText, styles.logoutButtonText]}>Đăng Xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  appHeaderContainer: {
    marginHorizontal: SPACING.space_36,
    marginTop: SPACING.space_20 * 2,
    marginBottom: SPACING.space_10,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: SPACING.space_24, 
    justifyContent: 'space-between',
  },
  topContent: {
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.space_20, 
  },
  avatarImage: {
    height: 300, 
    width: 300,  
    borderRadius: 75, 
    marginBottom: SPACING.space_20,
    borderColor: COLORS.Blue,
    borderWidth: 2,
  },
  displayNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.space_4,
  },
  displayNameText: {
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_24,
    color: COLORS.White,
    marginRight: SPACING.space_10,
  },
  editIcon: {
    padding: SPACING.space_4,
  },
  editNameContainer: {
    width: '90%', 
    alignItems: 'center',
    marginBottom: SPACING.space_10,
  },
  nameInput: {
    width: '100%',
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_18,
    color: COLORS.White,
    backgroundColor: COLORS.DarkGrey,
    paddingVertical: SPACING.space_10,
    paddingHorizontal: SPACING.space_15,
    borderRadius: BORDERRADIUS.radius_8,
    textAlign: 'center',
    marginBottom: SPACING.space_15,
  },
  editNameActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: SPACING.space_10,
    borderRadius: BORDERRADIUS.radius_25,
    marginHorizontal: SPACING.space_10,
  },
  saveButton: {
    backgroundColor: COLORS.NetflixRed,
  },
  cancelButton: {
    backgroundColor: COLORS.Grey,
  },
  emailText: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_14,
    color: COLORS.WhiteRGBA75,
    textAlign: 'center',
  },
  actionsSection: {
    marginTop: SPACING.space_20,
    paddingBottom: SPACING.space_20, 
  },
  actionButtonFullWidth: {
    backgroundColor: COLORS.DarkGrey,
    paddingVertical: SPACING.space_18,
    paddingHorizontal: SPACING.space_15,
    borderRadius: BORDERRADIUS.radius_10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.space_15,
  },
  actionIcon: {
    marginRight: SPACING.space_15,
  },
  actionButtonText: {
    flex: 1,
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_16,
    color: COLORS.White,
  },
  logoutButton: {
    backgroundColor: COLORS.NetflixRed,
  },
  logoutButtonText: {
    color: COLORS.White,
    fontFamily: FONTFAMILY.poppins_semibold,
  },
});

export default UserAccountScreen;