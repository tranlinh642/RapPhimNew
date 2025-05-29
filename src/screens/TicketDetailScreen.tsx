import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  ImageBackground,
  TouchableOpacity, // Bạn không dùng TouchableOpacity ở đây, có thể bỏ
  FlatList,       // Bạn không dùng FlatList ở đây, có thể bỏ
  ToastAndroid,   // Bạn không dùng ToastAndroid ở đây, có thể bỏ
  Image,
  ActivityIndicator, // Thêm để hiển thị loading
} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import AppHeader from '../components/AppHeader';
import {
  BORDERRADIUS,
  COLORS,
  FONTFAMILY,
  FONTSIZE,
  SPACING,
} from '../theme/theme';
import LinearGradient from 'react-native-linear-gradient';
import CustomIcon from '../components/CustomIcon';

const TicketDetailScreen = ({navigation, route}: any) => {
  // Ưu tiên lấy dữ liệu từ route.params nếu có, nếu không thì là undefined để useEffect xử lý
  const [ticketData, setTicketData] = useState<any>(route.params?.seatArray ? route.params : undefined);

  useEffect(() => {
    // Nếu ticketData chưa được set từ route.params (ví dụ: người dùng vào từ tab My Tickets)
    // thì mới cố gắng đọc từ EncryptedStorage
    if (!ticketData?.seatArray) { // Kiểm tra một thuộc tính cụ thể của vé mới, ví dụ seatArray
      (async () => {
        try {
          const ticketString = await EncryptedStorage.getItem('ticket');
          if (ticketString !== undefined && ticketString !== null) {
            setTicketData(JSON.parse(ticketString));
          } else {
            // Nếu không có vé trong storage và cũng không có từ params -> không có vé
            setTicketData(null);
          }
        } catch (error) {
          console.error('Something went wrong while getting Data from Storage', error);
          setTicketData(null); // Lỗi khi đọc, coi như không có vé
        }
      })();
    }
  }, []); // Chỉ chạy một lần khi component mount, hoặc khi route.params thay đổi nếu bạn muốn (thêm route.params vào dependency array)

  // Trạng thái loading: khi ticketData là undefined (chưa có dữ liệu từ params và chưa đọc xong từ storage)
  if (ticketData === undefined) {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <View style={styles.appHeaderContainer}>
          <AppHeader
            name="close-outline" // Hoặc icon phù hợp
            header={'Vé của tôi'}
            action={() => navigation.goBack()}
          />
        </View>
        <View style={styles.loadingView}>
          <ActivityIndicator size="large" color={COLORS.Orange} />
        </View>
      </View>
    );
  }

  // Trạng thái không có vé (sau khi đã kiểm tra params và storage)
  if (ticketData === null) {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <View style={styles.appHeaderContainer}>
          <AppHeader
            name="close-outline"
            header={'Vé của tôi'}
            action={() => navigation.goBack()}
          />
        </View>
        <View style={styles.loadingView}>
          <Text style={styles.errorText}>Không có thông tin vé.</Text>
        </View>
      </View>
    );
  }

  // Nếu có ticketData, hiển thị vé
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.appHeaderContainer}>
        <AppHeader
          name="close-outline"
          header={'Vé của tôi'}
          action={() => navigation.goBack()}
           customIconStyle={{ // Thêm style cho icon AppHeader nếu cần
             backgroundColor: 'rgba(0,0,0,0.3)',
             borderRadius: BORDERRADIUS.radius_20,
           }}
        />
      </View>

      {/* ScrollView sẽ bao quanh toàn bộ nội dung vé để có thể cuộn nếu vé quá dài */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.ticketContainer}>
          <ImageBackground
            source={{uri: ticketData?.posterImage}}
            style={styles.ticketBGImage}>
            <LinearGradient
              colors={[COLORS.NetflixRedRGB0, COLORS.NetflixRedRGB10]} 
              style={styles.linearGradient}>
              <View
                style={[
                  styles.blackCircle,
                  {position: 'absolute', bottom: -40, left: -40},
                ]}></View>
              <View
                style={[
                  styles.blackCircle,
                  {position: 'absolute', bottom: -40, right: -40},
                ]}></View>
            </LinearGradient>
          </ImageBackground>
          <View style={styles.linear}></View>

          <View style={styles.ticketFooter}>
            <View
              style={[
                styles.blackCircle,
                {position: 'absolute', top: -40, left: -40},
              ]}></View>
            <View
              style={[
                styles.blackCircle,
                {position: 'absolute', top: -40, right: -40},
              ]}></View>
            <View style={styles.ticketDateContainer}>
              <View style={styles.subtitleContainer}>
                <Text style={styles.dateTitle}>{ticketData?.showDate?.date}</Text>
                <Text style={styles.subtitle}>{ticketData?.showDate?.day}</Text>
              </View>
              <View style={styles.subtitleContainer}>
                <CustomIcon name="clock" style={styles.clockIcon} />
                <Text style={styles.subtitle}>{ticketData?.showTime}</Text>
              </View>
            </View>
            <View style={styles.ticketSeatContainer}>
              <View style={styles.subtitleContainer}>
                <Text style={styles.subheading}>Rạp</Text>
                <Text style={styles.subtitle}>02</Text>
              </View>
              <View style={styles.subtitleContainer}>
                <Text style={styles.subheading}>Dãy</Text>
                <Text style={styles.subtitle}>04</Text>
              </View>
              <View style={styles.subtitleContainer}>
                <Text style={styles.subheading}>Ghế</Text>
                <Text style={styles.subtitle}>
                  {ticketData?.seatArray
                    ?.slice(0, 3) // Hiển thị tối đa 3 ghế, bạn có thể bỏ slice nếu muốn hiển thị hết
                    .map((item: any, index: number, arr: any) => {
                      return item + (index === arr.length - 1 ? '' : ', ');
                    })}
                  {ticketData?.seatArray?.length > 3 ? '...' : ''} 
                </Text>
              </View>
            </View>
            <Image
              source={require('../assets/image/barcode.png')} // Đảm bảo đường dẫn này đúng
              style={styles.barcodeImage}
            />
          </View>
        </View>
      </ScrollView>
      {/* Phần nút "Total Price" và "Buy Tickets" không có ở màn hình này, nên tôi đã bỏ đi */}
      {/* Nếu bạn muốn giữ lại, hãy đặt nó bên ngoài ScrollView hoặc cố định ở cuối màn hình */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  appHeaderContainer: {
    paddingHorizontal: 40, // Giảm padding cho AppHeader
    paddingTop: 40,      // Giảm padding cho AppHeader
  },
  loadingView: { // Dùng cho cả ActivityIndicator và Text lỗi
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_14,
    color: COLORS.WhiteRGBA75,
  },
  scrollViewContent: { // Style cho contentContainer của ScrollView
    flexGrow: 1, // Quan trọng để ScrollView có thể cuộn khi nội dung dài
    justifyContent: 'center', // Căn giữa nội dung vé nếu nó không đủ dài để cuộn
    alignItems: 'center', // Căn giữa ticketContainer theo chiều ngang
    paddingVertical: SPACING.space_20, // Thêm padding trên dưới cho ScrollView
  },
  ticketContainer: {
    // flex: 1, // Bỏ flex: 1 ở đây
    // justifyContent: 'center', // Bỏ justifyContent ở đây
    alignItems: 'center', // Để các thành phần con (ticketBGImage, linear, ticketFooter) tự căn giữa
    width: 300, // Giữ chiều rộng cố định cho vé
  },
  ticketBGImage: {
    alignSelf: 'center', // Đảm bảo nó căn giữa trong ticketContainer (dù ticketContainer đã có alignItems: 'center')
    width: '100%', // Chiếm full width của ticketContainer (300px)
    aspectRatio: 200 / 300,
    borderTopLeftRadius: BORDERRADIUS.radius_25,
    borderTopRightRadius: BORDERRADIUS.radius_25,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  linearGradient: {
    height: '70%', // Độ cao của gradient màu cam
    // Thêm màu trong suốt cho Orange nếu bạn có trong theme
    // Ví dụ: colors: [COLORS.OrangeTransparent || 'rgba(255,165,0,0)', COLORS.Orange]
  },
  linear: {
    borderTopColor: COLORS.Black,
    borderTopWidth: 2, // Giảm độ dày đường dash
    width: '100%', // Chiếm full width của ticketContainer (300px)
    alignSelf: 'center',
    backgroundColor: COLORS.NetflixRed, // Nền của đường dash là Orange
    borderStyle: 'dashed',
  },
  ticketFooter: {
    backgroundColor: COLORS.NetflixRedRGB10,
    width: '100%', // Chiếm full width của ticketContainer (300px)
    alignItems: 'center',
    paddingBottom: SPACING.space_20, // Giảm padding bottom
    alignSelf: 'center',
    borderBottomLeftRadius: BORDERRADIUS.radius_25,
    borderBottomRightRadius: BORDERRADIUS.radius_25,
    paddingTop: SPACING.space_10, // Thêm padding top nhỏ
  },
  ticketDateContainer: {
    flexDirection: 'row',
    gap: SPACING.space_36,
    alignItems: 'center',
    justifyContent: 'space-around', // Phân bố đều hơn
    marginVertical: SPACING.space_10,
    width: '90%', // Giới hạn chiều rộng để không bị sát lề quá
  },
  ticketSeatContainer: {
    flexDirection: 'row',
    gap: SPACING.space_20, // Giảm gap
    alignItems: 'flex-start', // Căn trên cho các mục
    justifyContent: 'space-around', // Phân bố đều hơn
    marginVertical: SPACING.space_10,
    width: '90%', // Giới hạn chiều rộng
  },
  dateTitle: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_24,
    color: COLORS.White,
  },
  subtitle: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_12, // Giảm kích thước chữ phụ
    color: COLORS.White,
    marginTop: SPACING.space_4,
  },
  subheading: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_14, // Giảm kích thước chữ
    color: COLORS.White,
  },
  subtitleContainer: {
    alignItems: 'center',
    flex: 1, // Để các container này chia sẻ không gian đều nhau
    paddingHorizontal: SPACING.space_4, // Thêm padding nhỏ
  },
  clockIcon: {
    fontSize: FONTSIZE.size_20, // Giảm kích thước icon
    color: COLORS.White,
    marginBottom: SPACING.space_4, // Giảm margin
  },
  barcodeImage: {
    height: 40, // Giảm chiều cao barcode
    aspectRatio: 158 / 52,
    marginTop: SPACING.space_15, // Thêm margin top
  },
  blackCircle: {
    height: 80,
    width: 80,
    borderRadius: 40, // Sửa lại thành 40
    backgroundColor: COLORS.Black,
    zIndex: 1, // Đảm bảo nó nổi lên trên để cắt
  },
});

export default TicketDetailScreen;