import React, {useState} from 'react';
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
  // Image, // Image component không được sử dụng trực tiếp, có thể bỏ nếu CustomIcon không dùng
} from 'react-native';
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
import EncryptedStorage from 'react-native-encrypted-storage';

const timeArray: string[] = [
  '10:30',
  '12:30',
  '14:30',
  '15:00',
  '19:30',
  '21:00',
];

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
        const seatObject = {
          number: seatNumber++,
          taken: Math.random() < 0.3,
          selected: false,
          type: 'seat',
        };
        columnArray.push(seatObject);
      } else {
        const seatObject = {
          number: 'empty' + i + '-' + j,
          type: 'empty',
        };
        columnArray.push(seatObject);
      }
    }
    rowArray.push(columnArray);
  }
  return rowArray;
};

const SeatBookingScreen = ({navigation, route}: any) => {
  const [dateArray, setDateArray] = useState<any[]>(generateDate());
  const [selectedDateIndex, setSelectedDateIndex] = useState<any>();
  const [price, setPrice] = useState<number>(0);
  const [twoDSeatArray, setTwoDSeatArray] = useState<any[][]>(generateSeats());
  const [selectedSeatArray, setSelectedSeatArray] = useState<number[]>([]);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState<any>();

  const selectSeat = (rowIndex: number, seatIndex: number, seatNumber: number) => {
    if (!twoDSeatArray[rowIndex][seatIndex].taken) {
      let currentSelectedSeats: number[] = [...selectedSeatArray];
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
      setSelectedSeatArray(currentSelectedSeats);
      setPrice(currentSelectedSeats.length * 75000);
      setTwoDSeatArray(tempSeatArray);
    }
  };

  const BookSeats = async () => {
    if (
      selectedSeatArray.length !== 0 &&
      selectedTimeIndex !== undefined &&
      selectedDateIndex !== undefined
    ) {
      try {
        await EncryptedStorage.setItem(
          'ticket',
          JSON.stringify({
            seatArray: selectedSeatArray,
            time: timeArray[selectedTimeIndex],
            date: dateArray[selectedDateIndex],
            ticketImage: route.params.PosterImage,
          }),
        );
        navigation.navigate('Ticket', {
          seatArray: selectedSeatArray,
          time: timeArray[selectedTimeIndex],
          date: dateArray[selectedDateIndex],
          ticketImage: route.params.PosterImage,
        });
      } catch (error) {
        console.error('Lỗi khi lưu vé:', error);
        ToastAndroid.show('Đã có lỗi xảy ra khi lưu vé.', ToastAndroid.SHORT);
      }
    } else {
      ToastAndroid.showWithGravity(
        'Vui lòng chọn Ghế, Ngày và Giờ xem phim',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    }
  };

  return (
    // BAO BỌC TẤT CẢ TRONG MỘT VIEW CHA CÓ flex: 1
    <View style={styles.rootContainer}>
      <StatusBar hidden />
      <ScrollView
        style={styles.scrollView} // Style riêng cho ScrollView
        contentContainerStyle={styles.scrollViewContent} // Thêm paddingBottom ở đây
        bounces={false}
        showsVerticalScrollIndicator={false}>
        {/* Phần Header với ImageBackground */}
        <View style={styles.imageBackgroundContainer}>
          <ImageBackground
            source={{uri: route.params?.bgImage}}
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
        </View>

        {/* Phần chọn ghế */}
        <View style={styles.seatSectionContainer}>
          <View style={styles.seatLayoutContainer}>
            {twoDSeatArray?.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.seatRow}>
                {row?.map((seat, seatIndex) =>
                  seat.type === 'empty' ? (
                    <View key={seat.number} style={styles.emptySeatIcon} />
                  ) : (
                    <TouchableOpacity
                      key={seat.number}
                      onPress={() =>
                        selectSeat(rowIndex, seatIndex, seat.number)
                      }>
                      <CustomIcon
                        name="seat"
                        style={[
                          styles.seatIcon,
                          seat.taken ? {color: COLORS.Grey} : {},
                          seat.selected ? {color: COLORS.NetflixRed} : {},
                        ]}
                      />
                    </TouchableOpacity>
                  ),
                )}
              </View>
            ))}
          </View>
          <View style={styles.seatRadioContainer}>
            <View style={styles.radioContainer}>
              <CustomIcon name="radio" style={[styles.radioIcon, {color: COLORS.White}]} />
              <Text style={styles.radioText}>Còn trống</Text>
            </View>
            <View style={styles.radioContainer}>
              <CustomIcon name="radio" style={[styles.radioIcon, {color: COLORS.Grey}]} />
              <Text style={styles.radioText}>Đã bán</Text>
            </View>
            <View style={styles.radioContainer}>
              <CustomIcon name="radio" style={[styles.radioIcon, {color: COLORS.NetflixRed}]} />
              <Text style={styles.radioText}>Đang chọn</Text>
            </View>
          </View>
        </View>

        {/* Phần chọn ngày */}
        <View style={styles.dateSelectionContainer}>
          <FlatList
            data={dateArray}
            keyExtractor={item => item.date.toString()}
            horizontal
            bounces={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContainer}
            renderItem={({item, index}) => (
              <TouchableOpacity onPress={() => setSelectedDateIndex(index)}>
                <View
                  style={[
                    styles.dateContainer,
                    index === 0 ? {marginLeft: SPACING.space_24} : {},
                    index === dateArray.length - 1 ? {marginRight: SPACING.space_24} : {},
                    index === selectedDateIndex ? {backgroundColor: COLORS.NetflixRed} : {},
                  ]}>
                  <Text style={styles.dateText}>{item.date}</Text>
                  <Text style={styles.dayText}>{item.day}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Phần chọn giờ */}
        <View style={styles.timeSelectionContainer}>
          <FlatList
            data={timeArray}
            keyExtractor={item => item}
            horizontal
            bounces={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContainer}
            renderItem={({item, index}) => (
              <TouchableOpacity onPress={() => setSelectedTimeIndex(index)}>
                <View
                  style={[
                    styles.timeContainer,
                    index === 0 ? {marginLeft: SPACING.space_24} : {},
                    index === timeArray.length - 1 ? {marginRight: SPACING.space_24} : {},
                    index === selectedTimeIndex ? {backgroundColor: COLORS.NetflixRed} : {},
                  ]}>
                  <Text style={styles.timeText}>{item}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </ScrollView> {/* Kết thúc ScrollView ở đây */}

      {/* Phần giá và nút đặt vé - NẰM NGOÀI SCROLLVIEW */}
      <View style={styles.buttonPriceContainer}>
        <View style={styles.priceContainer}>
          <Text style={styles.totalPriceText}>Tổng cộng</Text>
          <Text style={styles.price}>{price.toLocaleString('vi-VN')} VND</Text>
        </View>
        <TouchableOpacity onPress={BookSeats} style={styles.bookButton}>
          <Text style={styles.buttonText}>Đặt Mua Vé</Text>
        </TouchableOpacity>
      </View>
    </View> // Kết thúc View cha (rootContainer)
  );
};

const styles = StyleSheet.create({
  rootContainer: { // Style cho View cha mới
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  scrollView: { // Style cho ScrollView
    flex: 1, // Để ScrollView chiếm không gian còn lại phía trên nút đặt vé
  },
  scrollViewContent: { // Thêm paddingBottom cho nội dung cuộn
    paddingBottom: SPACING.space_20 * 5, // Điều chỉnh giá trị này cho phù hợp với chiều cao của buttonPriceContainer
                                        // (Ví dụ: chiều cao buttonPriceContainer khoảng 80-100)
  },
  // container đã được đổi tên thành rootContainer
  // container: {
  // display: 'flex',
  // flex: 1,
  // backgroundColor: COLORS.Black,
  // },
  imageBackgroundContainer: {},
  ImageBG: {
    width: '100%',
    aspectRatio: 3072 / 1727,
  },
  linearGradient: {
    height: '100%',
    justifyContent: 'flex-start',
  },
  appHeaderContainer: {
    paddingHorizontal: SPACING.space_20,
    paddingTop: (StatusBar.currentHeight || 0) + SPACING.space_10,
  },
  screenText: {
    textAlign: 'center',
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_10,
    color: COLORS.WhiteRGBA75 || 'rgba(255,255,255,0.75)',
    paddingVertical: SPACING.space_10,
    backgroundColor: COLORS.Black,
  },
  seatSectionContainer: {
    marginVertical: SPACING.space_36,
  },
  seatLayoutContainer: {
    gap: SPACING.space_10,
    alignItems: 'center',
  },
  seatRow: {
    flexDirection: 'row',
    gap: SPACING.space_12,
    justifyContent: 'center',
  },
  seatIcon: {
    fontSize: FONTSIZE.size_24,
    color: COLORS.White,
  },
  emptySeatIcon: {
    width: FONTSIZE.size_24,
    height: FONTSIZE.size_24,
  },
  seatRadioContainer: {
    flexDirection: 'row',
    marginTop: SPACING.space_20,
    marginBottom: SPACING.space_10,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  radioContainer: {
    flexDirection: 'row',
    gap: SPACING.space_8,
    alignItems: 'center',
  },
  radioIcon: {
    fontSize: FONTSIZE.size_18,
    color: COLORS.White,
  },
  radioText: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_10,
    color: COLORS.White,
  },
  dateSelectionContainer: {
    marginVertical: SPACING.space_36,
  },
  timeSelectionContainer: {
    marginVertical: SPACING.space_36,
  },
  flatListContainer: {
    gap: SPACING.space_12,
    paddingHorizontal: SPACING.space_12,
  },
  dateContainer: {
    width: SPACING.space_10 * 6,
    height: SPACING.space_10 * 8,
    borderRadius: BORDERRADIUS.radius_15,
    backgroundColor: COLORS.DarkGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_20,
    color: COLORS.White,
  },
  dayText: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_10,
    color: COLORS.White,
  },
  timeContainer: {
    paddingVertical: SPACING.space_8,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA50 || 'rgba(255,255,255,0.5)',
    paddingHorizontal: SPACING.space_15,
    borderRadius: BORDERRADIUS.radius_20,
    backgroundColor: COLORS.DarkGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_12,
    color: COLORS.White,
  },
  buttonPriceContainer: { // Style cho phần nút và giá ở cuối màn hình
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.space_20,
    paddingVertical: SPACING.space_15,
    // borderTopWidth: 1, // Bỏ đường kẻ nếu không muốn
    // borderTopColor: COLORS.Grey, // Bỏ đường kẻ nếu không muốn
    backgroundColor: COLORS.Black, // Để nó có nền giống màn hình
    position: 'absolute', // Định vị tuyệt đối
    bottom: 0,
    left: 0,
    right: 0,
  },
  priceContainer: {
    alignItems: 'flex-start',
  },
  totalPriceText: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_12,
    color: COLORS.Grey,
  },
  price: {
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_20,
    color: COLORS.White,
  },
  bookButton: {
    borderRadius: BORDERRADIUS.radius_20,
    paddingHorizontal: SPACING.space_20,
    paddingVertical: SPACING.space_10,
    backgroundColor: COLORS.NetflixRed,
  },
  buttonText: {
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_14,
    color: COLORS.White,
  },
});

export default SeatBookingScreen;