// src/screens/SeatBookingScreen.tsx
import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  ToastAndroid,
  Alert,
  Platform,
} from 'react-native';
import { CommonActions, RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  BORDERRADIUS,
  COLORS,
  FONTFAMILY,
  FONTSIZE,
  SPACING,
} from '../theme/theme';
import LinearGradient from 'react-native-linear-gradient';
import AppHeader from '../components/AppHeader';
import CustomIcon from '../components/CustomIcon';
import { useAuth } from '../context/AuthContext';
import { saveUserTicketsToCache, Ticket as TicketData } from '../hooks/database';
import { RootStackParamList } from '../../App';
import { getDBInstance } from '../hooks/database';

const timeArray: string[] = ['10:30', '12:30', '14:30', '15:00', '19:30', '21:00'];

const generateDate = () => {
  const date = new Date();
  let weekday = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  let weekdays = [];
  for (let i = 0; i < 7; i++) {
    let tempDate = {
      date: new Date(date.getTime() + i * 24 * 60 * 60 * 1000).getDate(),
      day: weekday[new Date(date.getTime() + i * 24 * 60 * 60 * 1000).getDay()],
    };
    weekdays.push(tempDate);
  }
  return weekdays;
};

const generateSeats = () => {
  const seatLayout = [
    ['s', 's', 'e', 's', 's', 'e', 's', 's'],
    ['s', 's', 'e', 's', 's', 'e', 's', 's'],
    ['s', 's', 'e', 's', 's', 'e', 's', 's'],
    ['s', 's', 'e', 's', 's', 'e', 's', 's'],
    ['e', 'e', 'e', 's', 's', 'e', 'e', 'e'],
  ];
  let seatNumber = 1;
  const rowArray = [];
  for (let i = 0; i < seatLayout.length; i++) {
    const columnArray = [];
    for (let j = 0; j < seatLayout[i].length; j++) {
      if (seatLayout[i][j] === 's') {
        columnArray.push({
          number: seatNumber++,
          taken: Math.random() < 0.3,
          selected: false,
          type: 'seat',
        });
      } else {
        columnArray.push({ number: 'empty' + i + '-' + j, type: 'empty' });
      }
    }
    rowArray.push(columnArray);
  }
  return rowArray;
};

type SeatBookingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SeatBooking'>;
type SeatBookingScreenRouteProp = RouteProp<RootStackParamList, 'SeatBooking'>;

interface SeatBookingScreenProps {
  navigation: SeatBookingScreenNavigationProp;
  route: SeatBookingScreenRouteProp;
}

const SeatBookingScreen: React.FC<SeatBookingScreenProps> = ({ navigation, route }) => {
  const { user } = useAuth();
  const [dateArray, setDateArray] = useState<any[]>(generateDate());
  const [selectedDateIndex, setSelectedDateIndex] = useState<number | undefined>();
  const [price, setPrice] = useState<number>(0);
  const [twoDSeatArray, setTwoDSeatArray] = useState<any[][]>(generateSeats());
  const [selectedSeatArray, setSelectedSeatArray] = useState<number[]>([]);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState<number | undefined>();
  const movieTitleFromParams = route.params?.movieTitle || "Tên Phim Mặc Định";

  const selectSeat = (rowIndex: number, seatIndex: number, seatNumber: number) => {
    if (!twoDSeatArray[rowIndex][seatIndex].taken) {
      let currentSelectedSeats = [...selectedSeatArray];
      let tempSeatArray = JSON.parse(JSON.stringify(twoDSeatArray));
      tempSeatArray[rowIndex][seatIndex].selected = !tempSeatArray[rowIndex][seatIndex].selected;

      if (!currentSelectedSeats.includes(seatNumber)) {
        currentSelectedSeats.push(seatNumber);
      } else {
        const indexInSelected = currentSelectedSeats.indexOf(seatNumber);
        if (indexInSelected > -1) {
          currentSelectedSeats.splice(indexInSelected, 1);
        }
      }
      currentSelectedSeats.sort((a, b) => a - b);
      setSelectedSeatArray(currentSelectedSeats);
      setPrice(currentSelectedSeats.length * 75000);
      setTwoDSeatArray(tempSeatArray);
    }
  };

  const processBooking = async () => {
    if (!user || !user.email) {
      Alert.alert("Yêu cầu đăng nhập", "Bạn cần đăng nhập để thực hiện chức năng đặt vé.");
      return;
    }

    if (
      selectedSeatArray.length === 0 ||
      selectedTimeIndex === undefined ||
      selectedDateIndex === undefined
    ) {
      ToastAndroid.showWithGravity(
        'Vui lòng chọn Ghế, Ngày và Giờ xem phim',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
      return;
    }

    // Kiểm tra email người dùng trong LocalCredentials
    const db = await getDBInstance();
    const userExists = await new Promise<boolean>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT email FROM LocalCredentials WHERE email = ?',
          [user.email],
          (_, results) => resolve(results.rows.length > 0),
          (_, error) => {
            console.error('[SeatBookingScreen] Lỗi khi kiểm tra người dùng trong LocalCredentials:', error);
            reject(error);
            return true;
          }
        );
      });
    });

    if (!userExists) {
      Alert.alert("Lỗi", "Tài khoản của bạn không tồn tại trong hệ thống. Vui lòng đăng ký lại.");
      return;
    }

    const newTicketDataForDisplay = {
      movieTitle: movieTitleFromParams,
      posterImage: route.params.PosterImage,
      seatArray: selectedSeatArray,
      showTime: timeArray[selectedTimeIndex],
      showDate: dateArray[selectedDateIndex],
    };

    const localBookingId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const ticketToCache: TicketData = {
      booking_id_from_backend: localBookingId,
      user_id_from_backend: user.email, // Lưu email người dùng thay vì ID dạng số
      movie_title: newTicketDataForDisplay.movieTitle,
      poster_image_url: newTicketDataForDisplay.posterImage,
      seat_array_json: JSON.stringify(selectedSeatArray),
      show_time: newTicketDataForDisplay.showTime,
      show_date: `${newTicketDataForDisplay.showDate.day}, ${newTicketDataForDisplay.showDate.date}`, // Format lại ngày hiển thị
    };

    try {
      await saveUserTicketsToCache([ticketToCache]);
      console.log("[SeatBookingScreen] Vé đã được lưu vào cache SQLite:", ticketToCache);
      ToastAndroid.show('Đặt vé thành công!', ToastAndroid.SHORT);

      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            {
              name: 'Tab',
              params: {
                screen: 'Ticket', // Chuyển đến tab Ticket
                params: { refreshTimestamp: Date.now() }, // Gửi timestamp để trigger refresh
              },
            },
            {
              name: 'TicketDetail', // Sau đó push màn hình TicketDetail lên trên
              params: newTicketDataForDisplay,
            },
          ],
        })
      );
    } catch (error) {
      console.error('[SeatBookingScreen] Lỗi khi lưu vé hoặc điều hướng:', error);
      ToastAndroid.show('Lỗi khi lưu vé. Vui lòng thử lại.', ToastAndroid.LONG);
    }
  };

  return (
    <View style={styles.rootContainer}>
      <StatusBar hidden={false} barStyle="light-content" backgroundColor={COLORS.Black} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        bounces={false}
        showsVerticalScrollIndicator={false}>
        {/* Phần Header với ảnh nền phim và tên phim */}
        <View style={styles.imageBackgroundContainer}>
          <ImageBackground
            source={{ uri: route.params?.bgImage }}
            style={styles.ImageBG}>
            <LinearGradient
              colors={[COLORS.BlackRGB10 || 'rgba(0,0,0,0.1)', COLORS.Black]}
              style={styles.linearGradient}>
              <View style={styles.appHeaderContainer}>
                <AppHeader
                  name="arrow-back-outline"
                  action={() => navigation.goBack()}
                  showClock={false}
                  customIconStyle={{
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    borderRadius: BORDERRADIUS.radius_20,
                  }}
                />
              </View>
            </LinearGradient>
          </ImageBackground>
          <Text style={styles.screenText}>Màn hình ở phía này</Text>
          {movieTitleFromParams && <Text style={styles.movieTitleText}>{movieTitleFromParams}</Text>}
        </View>

        {/* Khu vực chọn ghế và chú thích trạng thái ghế */}
        <View style={styles.seatSectionContainer}>
          <View style={styles.seatLayoutContainer}>
            {twoDSeatArray?.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.seatRow}>
                {row?.map((seat, seatIndex) =>
                  seat.type === 'empty' ? (
                    <View key={seat.number.toString()} style={styles.emptySeatIcon} />
                  ) : (
                    <TouchableOpacity
                      key={seat.number.toString()}
                      onPress={() => selectSeat(rowIndex, seatIndex, seat.number)}>
                      <CustomIcon
                        name="seat"
                        style={[
                          styles.seatIcon,
                          seat.taken ? { color: COLORS.Grey } : {},
                          seat.selected ? { color: COLORS.NetflixRed } : {},
                        ]}
                      />
                    </TouchableOpacity>
                  )
                )}
              </View>
            ))}
          </View>
          <View style={styles.seatRadioContainer}>
            <View style={styles.radioContainer}>
              <CustomIcon name="radio" style={[styles.radioIcon, { color: COLORS.White }]} />
              <Text style={styles.radioText}>Còn trống</Text>
            </View>
            <View style={styles.radioContainer}>
              <CustomIcon name="radio" style={[styles.radioIcon, { color: COLORS.Grey }]} />
              <Text style={styles.radioText}>Đã bán</Text>
            </View>
            <View style={styles.radioContainer}>
              <CustomIcon name="radio" style={[styles.radioIcon, { color: COLORS.NetflixRed }]} />
              <Text style={styles.radioText}>Đang chọn</Text>
            </View>
          </View>
        </View>

        {/* Khu vực chọn ngày xem phim */}
        <View style={styles.dateSelectionContainer}>
          <FlatList
            data={dateArray}
            keyExtractor={item => item.date.toString()}
            horizontal
            bounces={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContainer}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => setSelectedDateIndex(index)}>
                <View
                  style={[
                    styles.dateContainer,
                    index === 0 ? { marginLeft: SPACING.space_24 } : {},
                    index === dateArray.length - 1 ? { marginRight: SPACING.space_24 } : {},
                    index === selectedDateIndex ? { backgroundColor: COLORS.NetflixRed } : {},
                  ]}>
                  <Text style={styles.dateText}>{item.date}</Text>
                  <Text style={styles.dayText}>{item.day}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Khu vực chọn giờ xem phim */}
        <View style={styles.timeSelectionContainer}>
          <FlatList
            data={timeArray}
            keyExtractor={item => item}
            horizontal
            bounces={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContainer}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => setSelectedTimeIndex(index)}>
                <View
                  style={[
                    styles.timeContainer,
                    index === 0 ? { marginLeft: SPACING.space_24 } : {},
                    index === timeArray.length - 1 ? { marginRight: SPACING.space_24 } : {},
                    index === selectedTimeIndex ? { backgroundColor: COLORS.NetflixRed } : {},
                  ]}>
                  <Text style={styles.timeText}>{item}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </ScrollView>

      {/* Phần hiển thị giá và nút đặt vé */}
      <View style={styles.buttonPriceContainer}>
        <View style={styles.priceContainer}>
          <Text style={styles.totalPriceText}>Tổng cộng</Text>
          <Text style={styles.price}>{price.toLocaleString('vi-VN')} VND</Text>
        </View>
        <TouchableOpacity onPress={processBooking} style={styles.bookButton}>
          <Text style={styles.buttonText}>Xác Nhận Đặt Vé</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: SPACING.space_20 * 6, // Đảm bảo có đủ không gian cho nút bấm ở cuối
  },
  imageBackgroundContainer: {
    // không cần style cụ thể ở đây nếu các phần tử con đã định vị tốt
  },
  ImageBG: {
    width: '100%',
    aspectRatio: 16 / 9, // Giữ tỷ lệ khung hình cho ảnh nền
  },
  linearGradient: {
    height: '100%',
    justifyContent: 'space-between', // Đẩy AppHeader lên trên
  },
  appHeaderContainer: {
    paddingHorizontal: SPACING.space_12, // Giảm padding để icon không quá sát mép
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : SPACING.space_10, // Xử lý chiều cao StatusBar
  },
  screenText: {
    textAlign: 'center',
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_10,
    color: COLORS.WhiteRGBA75,
    paddingVertical: SPACING.space_4, // Giảm padding nếu không cần thiết
    backgroundColor: COLORS.Black, // Để chữ nổi bật hơn nếu ảnh nền sáng
  },
  movieTitleText: {
    textAlign: 'center',
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_18,
    color: COLORS.White,
    paddingVertical: SPACING.space_8,
    backgroundColor: COLORS.Black, // Để chữ nổi bật hơn
  },
  seatSectionContainer: {
    marginVertical: SPACING.space_20,
  },
  seatLayoutContainer: {
    gap: SPACING.space_10, // Khoảng cách giữa các hàng ghế
    alignItems: 'center', // Căn giữa các hàng ghế
  },
  seatRow: {
    flexDirection: 'row',
    gap: SPACING.space_12, // Khoảng cách giữa các ghế trong một hàng
    justifyContent: 'center',
  },
  seatIcon: {
    fontSize: FONTSIZE.size_24, // Kích thước ghế
    color: COLORS.White, // Màu ghế mặc định
  },
  emptySeatIcon: { // Placeholder cho lối đi
    width: FONTSIZE.size_24,
    height: FONTSIZE.size_24,
  },
  seatRadioContainer: {
    flexDirection: 'row',
    marginTop: SPACING.space_20,
    marginBottom: SPACING.space_10,
    alignItems: 'center',
    justifyContent: 'space-evenly', // Phân bổ đều các mục chú thích
  },
  radioContainer: {
    flexDirection: 'row',
    gap: SPACING.space_8,
    alignItems: 'center',
  },
  radioIcon: {
    fontSize: FONTSIZE.size_18,
  },
  radioText: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_10,
    color: COLORS.White,
  },
  dateSelectionContainer: {
    marginVertical: SPACING.space_20, // Khoảng cách trên dưới cho phần chọn ngày
  },
  timeSelectionContainer: {
    marginBottom: SPACING.space_20, // Khoảng cách dưới cho phần chọn giờ
  },
  flatListContainer: { // Style cho contentContainer của FlatList ngày và giờ
    gap: SPACING.space_12,
    paddingHorizontal: SPACING.space_12, // Tránh item đầu/cuối bị cắt nếu có marginLeft/Right
  },
  dateContainer: {
    width: SPACING.space_10 * 7,
    height: SPACING.space_10 * 9,
    borderRadius: BORDERRADIUS.radius_10,
    backgroundColor: COLORS.DarkGrey,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent', // Mặc định không có border
  },
  dayText: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_12,
    color: COLORS.WhiteRGBA75,
  },
  dateText: {
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_24,
    color: COLORS.White,
  },
  timeContainer: {
    paddingVertical: SPACING.space_10,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA50,
    paddingHorizontal: SPACING.space_18,
    borderRadius: BORDERRADIUS.radius_25,
    backgroundColor: COLORS.DarkGrey, // Nền cho các ô thời gian
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_14,
    color: COLORS.White,
  },
  buttonPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.space_20,
    paddingVertical: SPACING.space_12,
    paddingBottom: Platform.OS === 'ios' ? SPACING.space_28 : SPACING.space_12, // Thêm padding cho "tai thỏ" iOS
    backgroundColor: COLORS.Black,
    position: 'absolute', // Đặt ở cuối màn hình
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1, // Thêm đường kẻ phân cách
    borderColor: COLORS.Grey,
  },
  priceContainer: {
    alignItems: 'flex-start',
  },
  totalPriceText: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_14,
    color: COLORS.WhiteRGBA75,
  },
  price: {
    fontFamily: FONTFAMILY.poppins_bold,
    fontSize: FONTSIZE.size_20,
    color: COLORS.White,
  },
  bookButton: {
    borderRadius: BORDERRADIUS.radius_25,
    paddingHorizontal: SPACING.space_28,
    paddingVertical: SPACING.space_14,
    backgroundColor: COLORS.NetflixRed,
  },
  buttonText: {
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_16,
    color: COLORS.White,
  },
});

export default SeatBookingScreen;