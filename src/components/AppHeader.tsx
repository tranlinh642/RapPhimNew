// AppHeader.tsx
import * as React from 'react';
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
// import CustomIcon from './CustomIcon'; // Bạn đang dùng CustomIcon ở MovieDetailsScreen, đảm bảo import ở đây nếu dùng
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  BORDERRADIUS,
  COLORS,
  FONTFAMILY,
  FONTSIZE,
  SPACING,
} from '../theme/theme';
import CustomIcon from './CustomIcon'; // Giả sử bạn muốn dùng CustomIcon cho đồng hồ

interface AppHeaderProps {
  name: string;
  header?: string;
  action: () => void;
  showClock?: boolean; // Prop mới để hiển thị đồng hồ
  runtime?: number;    // Prop mới để truyền thời lượng phim (phút)
  customIconStyle?: object; // Prop để tùy chỉnh style của icon (ví dụ: nền mờ)
  customTextStyle?: object;  // Prop để tùy chỉnh style của text (nếu cần)
}

const AppHeader = (props: AppHeaderProps) => {
  const formatTime = (totalMinutes: number | undefined) => {
    if (totalMinutes === undefined || totalMinutes === null || totalMinutes <=0) return '';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.iconBG, props.customIconStyle]} 
        onPress={() => props.action()}>
        <Ionicons name={props.name} style={styles.iconStyle} />
      </TouchableOpacity>

      {props.header ? (
        <Text style={[styles.headerText, props.customTextStyle]}>{props.header}</Text>
      ) : (
        <View style={styles.emptySpaceInHeader} /> // Giữ không gian nếu không có header text
      )}

      {props.showClock && props.runtime ? (
        <View style={styles.timeContainerHeader}>
          <CustomIcon name="clock" style={styles.clockIconHeader} />
          <Text style={styles.runtimeTextHeader}>{formatTime(props.runtime)}</Text>
        </View>
      ) : (
        <View style={styles.emptyContainer} /> // Giữ không gian nếu không có đồng hồ
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Thay đổi để các item phân bố đều
    paddingHorizontal: SPACING.space_10, // Giảm padding nếu cần để vừa với màn hình
    // width: '100%', // Đảm bảo chiếm full width
  },
  iconBG: {
    // Mặc định không có background, để MovieDetailsScreen tự quyết định
    padding: SPACING.space_8, // Thêm padding cho dễ nhấn
    borderRadius: BORDERRADIUS.radius_20,
  },
  iconStyle: {
    color: COLORS.White,
    fontSize: FONTSIZE.size_24, // Giảm kích thước icon một chút
  },
  headerText: {
    flex: 1, // Cho phép co giãn nếu có tiêu đề
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_20,
    textAlign: 'center',
    color: COLORS.White,
    marginHorizontal: SPACING.space_10, // Thêm margin nếu có header text
  },
  emptySpaceInHeader: { // Nếu không có header text, nó sẽ co lại
    flex: 1,
  },
  emptyContainer: { // Dùng để cân bằng nếu không có đồng hồ
    width: SPACING.space_20 * 2, // Kích thước tương tự iconBG để cân đối
    height: SPACING.space_20 * 2,
  },
  timeContainerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)', // Nền mờ mặc định
    paddingHorizontal: SPACING.space_10,
    paddingVertical: SPACING.space_4,
    borderRadius: BORDERRADIUS.radius_15,
  },
  clockIconHeader: {
    fontSize: FONTSIZE.size_14,
    color: COLORS.WhiteRGBA75,
    marginRight: SPACING.space_4,
  },
  runtimeTextHeader: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_12,
    color: COLORS.White,
  },
});
export default AppHeader;