import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl, 
  Alert,
  StatusBar, 
} from 'react-native';
import { useFocusEffect, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { getUserTicketsFromCache, Ticket as TicketData } from '../hooks/database';
import { COLORS, FONTFAMILY, FONTSIZE, SPACING, BORDERRADIUS } from '../theme/theme';
import { RootStackParamList } from '../../App'; 
import CategoryHeader from '../components/CategoryHeader';

type TicketScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TicketScreenRouteProp = RouteProp<RootStackParamList, 'Tab'>;

interface TicketScreenProps {
  route: TicketScreenRouteProp;
}

const TicketScreen: React.FC<TicketScreenProps> = ({ route }) => {
  const { user } = useAuth(); 
  const navigation = useNavigation<TicketScreenNavigationProp>();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadTickets = useCallback(async () => {
    if (!user || !user.email) {
      console.log('[TicketScreen] Không có người dùng hoặc email, không tải vé.');
      setTickets([]);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    console.log(`[TicketScreen] Đang tải vé cho người dùng: ${user.email}`);
    if (!isRefreshing) setIsLoading(true); 

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
  }, [user, isRefreshing]);


  useFocusEffect(
    useCallback(() => {
      const shouldRefresh = route.params?.params?.refreshTimestamp;

      if (shouldRefresh) {
        console.log('[TicketScreen] Nhận được tín hiệu làm mới (refreshTimestamp), đang tải lại vé...');
        // Xóa param để không bị refresh liên tục nếu không cần
        navigation.setParams({ params: { ...route.params?.params, refreshTimestamp: null } } as any);
      }
      loadTickets();
    }, [loadTickets, navigation, route.params?.params?.refreshTimestamp])
  );

  const onRefresh = useCallback(() => {
    console.log('[TicketScreen] Đang làm mới danh sách vé...');
    setIsRefreshing(true); 
  }, []);


  const renderTicketItem = ({ item }: { item: TicketData }) => {
    let displayDate = item.show_date; 
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
          const dateParts = displayDate.split(', '); 
          const dayPart = dateParts.length > 1 ? dateParts[0] : '';
          const dateNumPart = dateParts.length > 1 ? parseInt(dateParts[1]) : parseInt(dateParts[0]);

          navigation.navigate('TicketDetail', {
            movieTitle: item.movie_title,
            seatArray: parsedSeats,
            showTime: item.show_time,
            showDate: { date: dateNumPart || 0, day: dayPart || 'N/A' },
            posterImage: item.poster_image_url,
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

  if (isLoading && !isRefreshing) { 
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
      </View>
      {(!user || !user.email) && !isLoading ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Vui lòng đăng nhập để xem vé đã mua.</Text>
        </View>
      ) : tickets.length === 0 && !isLoading ? ( 
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
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.NetflixRed} 
              colors={[COLORS.NetflixRed]} 
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
    top: (StatusBar.currentHeight || 0) - SPACING.space_32,
    left: SPACING.space_10, 
    right: SPACING.space_10, 
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
    paddingTop: 120,
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
    width: 70,
    height: 105, 
    borderRadius: BORDERRADIUS.radius_4,
    marginRight: SPACING.space_12,
  },
  ticketItemInfo: {
    flex: 1,
    justifyContent: 'space-around', 
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