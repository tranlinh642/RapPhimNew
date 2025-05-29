// src/screens/TicketScreen.tsx (Màn hình danh sách vé trong TabNavigator)
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl, // Thêm để làm mới danh sách
  Alert,
  StatusBar, // Thêm Alert
} from 'react-native';
import { useFocusEffect, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AppHeader from '../components/AppHeader'; // Header cho màn hình này
import { useAuth } from '../context/AuthContext';
import { getUserTicketsFromCache, Ticket as TicketData } from '../hooks/database'; // Đổi tên Ticket thành TicketData
import { COLORS, FONTFAMILY, FONTSIZE, SPACING, BORDERRADIUS } from '../theme/theme';
import { RootStackParamList } from '../../App'; // Import RootStackParamList
import CategoryHeader from '../components/CategoryHeader';

// Định nghĩa kiểu cho navigation prop của màn hình này
type TicketScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Định nghĩa kiểu cho route prop để nhận refreshTimestamp
type TicketScreenRouteProp = RouteProp<RootStackParamList, 'Tab'>; // Giả sử 'Ticket' là một screen trong 'Tab'

interface TicketScreenProps {
  route: TicketScreenRouteProp; // route sẽ chứa params từ navigation
}

const TicketScreen: React.FC<TicketScreenProps> = ({ route }) => {
  const { user } = useAuth(); // Lấy thông tin người dùng đang đăng nhập
  const navigation = useNavigation<TicketScreenNavigationProp>();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // State cho RefreshControl

  const loadTickets = useCallback(async () => {
    if (!user || !user.email) {
      console.log('[TicketScreen] Không có người dùng hoặc email, không tải vé.');
      setTickets([]);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    console.log(`[TicketScreen] Đang tải vé cho người dùng: ${user.email}`);
    if (!isRefreshing) setIsLoading(true); // Chỉ set isLoading nếu không phải là đang refresh

    try {
      const cachedTickets = await getUserTicketsFromCache(user.email);
      setTickets(cachedTickets);
      console.log(`[TicketScreen] Đã tải ${cachedTickets.length} vé từ cache.`);
    } catch (error) {
      console.error("[TicketScreen] Lỗi khi tải vé từ cache:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách vé đã mua.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, isRefreshing]); // Thêm isRefreshing vào dependency

  // Sử dụng useFocusEffect để tải lại vé mỗi khi màn hình được focus
  // và khi có param refreshTimestamp (từ việc đặt vé mới)
  useFocusEffect(
    useCallback(() => {
      // Kiểm tra xem có param refreshTimestamp không, nếu có nghĩa là vừa có vé mới
      // Hoặc bạn có thể kiểm tra một param cụ thể hơn nếu muốn
      const shouldRefresh = route.params?.params?.refreshTimestamp; // Truy cập sâu hơn vào params của screen 'Ticket' trong 'Tab'

      if (shouldRefresh) {
        console.log('[TicketScreen] Nhận được tín hiệu làm mới (refreshTimestamp), đang tải lại vé...');
        // Xóa param để không bị refresh liên tục nếu không cần
        navigation.setParams({ params: { ...route.params?.params, refreshTimestamp: null } } as any);
      }
      loadTickets();
    }, [loadTickets, navigation, route.params?.params?.refreshTimestamp]) // Thêm navigation và route.params vào dependencies
  );

  const onRefresh = useCallback(() => {
    console.log('[TicketScreen] Đang làm mới danh sách vé...');
    setIsRefreshing(true); // Kích hoạt trạng thái refresh
    // loadTickets sẽ được gọi lại vì isRefreshing thay đổi (nếu bạn thêm isRefreshing vào dependency của loadTickets)
    // hoặc gọi trực tiếp loadTickets() nếu không muốn thêm isRefreshing vào dependency của loadTickets
    // loadTickets(); // Nếu không, useFocusEffect sẽ tự xử lý khi isRefreshing là dependency của loadTickets
  }, []);


  const renderTicketItem = ({ item }: { item: TicketData }) => {
    let displayDate = item.show_date; // Giả sử show_date đã là string "Thứ X, DD"
    let parsedSeats = [];
    try {
      parsedSeats = JSON.parse(item.seat_array_json || '[]');
    } catch (e) {
      console.error("Lỗi parse seat_array_json:", e);
    }
    const seatsString = parsedSeats.join(', ');

    return (
      <TouchableOpacity
        style={styles.ticketItemContainer}
        onPress={() => {
          // Tạo lại đối tượng date cho TicketDetail nếu nó mong đợi object {date, day}
          // Điều này phụ thuộc vào cách bạn lưu và truyền showDate
          const dateParts = displayDate.split(', '); // Ví dụ: "T7, 31"
          const dayPart = dateParts.length > 1 ? dateParts[0] : '';
          const dateNumPart = dateParts.length > 1 ? parseInt(dateParts[1]) : parseInt(dateParts[0]);

          navigation.navigate('TicketDetail', {
            movieTitle: item.movie_title,
            seatArray: parsedSeats,
            showTime: item.show_time,
            showDate: { date: dateNumPart || 0, day: dayPart || 'N/A' },
            posterImage: item.poster_image_url,
            // bookingId: item.booking_id_from_backend, // Nếu TicketDetailScreen cần
          });
        }}>
        <Image source={{ uri: item.poster_image_url }} style={styles.ticketItemImage} />
        <View style={styles.ticketItemInfo}>
          <Text style={styles.ticketItemTitle} numberOfLines={2}>{item.movie_title}</Text>
          <Text style={styles.ticketItemText}>Ngày: {displayDate}</Text>
          <Text style={styles.ticketItemText}>Giờ: {item.show_time}</Text>
          {seatsString && <Text style={styles.ticketItemText}>Ghế: {seatsString}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && !isRefreshing) { // Chỉ hiển thị loading toàn màn hình khi không phải là đang kéo để refresh
    return (
      <View style={[styles.screenContainer, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.NetflixRed} />
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <StatusBar hidden={false} barStyle="light-content" backgroundColor={COLORS.Black} />
      <View style={styles.appHeaderContainer}>
        <CategoryHeader title={'Vé của tôi'} />
        {/* Bạn có thể không cần nút back ở đây vì đây là một tab chính */}
      </View>
      {(!user || !user.email) && !isLoading ? ( // Nếu không có user và không loading -> chưa đăng nhập
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Vui lòng đăng nhập để xem vé đã mua.</Text>
          {/* Thêm nút điều hướng đến Login nếu muốn */}
        </View>
      ) : tickets.length === 0 && !isLoading ? ( // Đã đăng nhập, không có vé và không loading
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Bạn chưa có vé nào.</Text>
          <Text style={styles.emptySubText}>Hãy khám phá và đặt vé ngay!</Text>
        </View>
      ) : (
        <FlatList
          data={tickets}
          renderItem={renderTicketItem}
          keyExtractor={(item) => item.booking_id_from_backend}
          contentContainerStyle={styles.listContentContainer}
          refreshControl={ // Thêm RefreshControl
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.NetflixRed} // Màu của spinner (iOS)
              colors={[COLORS.NetflixRed]} // Màu của spinner (Android)
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  appHeaderContainer: { 
    position: 'absolute',
    top: (StatusBar.currentHeight || 0) - SPACING.space_32, // << CHỈNH SỬA GIÁ TRỊ NÀY
    left: SPACING.space_10, // Hoặc SPACING.space_2 tùy theo lần sửa trước của bạn
    right: SPACING.space_10, // Hoặc SPACING.space_2 tùy theo lần sửa trước của bạn
    zIndex: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.space_20,
  },
  emptyText: {
    color: COLORS.WhiteRGBA75,
    fontSize: FONTSIZE.size_16,
    fontFamily: FONTFAMILY.poppins_regular,
    textAlign: 'center',
  },
  emptySubText: {
    color: COLORS.WhiteRGBA50,
    fontSize: FONTSIZE.size_14,
    fontFamily: FONTFAMILY.poppins_regular,
    textAlign: 'center',
    marginTop: SPACING.space_8,
  },
  listContentContainer: {
    paddingHorizontal: SPACING.space_16,
    paddingTop: 120, // Khoảng cách từ AppHeader (nếu có) hoặc đỉnh
    paddingBottom: SPACING.space_16,
  },
  ticketItemContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.DarkGrey,
    borderRadius: BORDERRADIUS.radius_10,
    padding: SPACING.space_12,
    marginBottom: SPACING.space_16,
    elevation: 3,
    shadowColor: COLORS.Black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  ticketItemImage: {
    width: 70, // Giảm kích thước ảnh
    height: 105, // Giữ tỉ lệ
    borderRadius: BORDERRADIUS.radius_4,
    marginRight: SPACING.space_12,
  },
  ticketItemInfo: {
    flex: 1,
    justifyContent: 'space-around', // Phân bố đều thông tin
  },
  ticketItemTitle: {
    color: COLORS.White,
    fontSize: FONTSIZE.size_16,
    fontFamily: FONTFAMILY.poppins_semibold,
    marginBottom: SPACING.space_4,
  },
  ticketItemText: {
    color: COLORS.WhiteRGBA75,
    fontSize: FONTSIZE.size_12,
    fontFamily: FONTFAMILY.poppins_regular,
    marginBottom: SPACING.space_2,
  },
});

export default TicketScreen;