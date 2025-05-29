import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  ImageBackground,    
  Image,
  ActivityIndicator, 
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
  const [ticketData, setTicketData] = useState<any>(route.params?.seatArray ? route.params : undefined);

  useEffect(() => {
    if (!ticketData?.seatArray) {
      (async () => {
        try {
          const ticketString = await EncryptedStorage.getItem('ticket');
          if (ticketString !== undefined && ticketString !== null) {
            setTicketData(JSON.parse(ticketString));
          } else {
            setTicketData(null);
          }
        } catch (error) {
          console.error('Something went wrong while getting Data from Storage', error);
          setTicketData(null); 
        }
      })();
    }
  }, []); 

  if (ticketData === undefined) {
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
          <ActivityIndicator size="large" color={COLORS.Orange} />
        </View>
      </View>
    );
  }

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

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.appHeaderContainer}>
        <AppHeader
          name="close-outline"
          header={'Vé của tôi'}
          action={() => navigation.goBack()}
           customIconStyle={{ 
             backgroundColor: 'rgba(0,0,0,0.3)',
             borderRadius: BORDERRADIUS.radius_20,
           }}
        />
      </View>

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
                    ?.slice(0, 3) 
                    .map((item: any, index: number, arr: any) => {
                      return item + (index === arr.length - 1 ? '' : ', ');
                    })}
                  {ticketData?.seatArray?.length > 3 ? '...' : ''} 
                </Text>
              </View>
            </View>
            <Image
              source={require('../assets/image/barcode.png')} 
              style={styles.barcodeImage}
            />
          </View>
        </View>
      </ScrollView>
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
    paddingHorizontal: 40, 
  },
  loadingView: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_14,
    color: COLORS.WhiteRGBA75,
  },
  scrollViewContent: { 
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center', 
    paddingVertical: SPACING.space_20, 
  },
  ticketContainer: {
    alignItems: 'center',
    width: 300, 
  },
  ticketBGImage: {
    alignSelf: 'center',
    width: '100%', 
    aspectRatio: 200 / 300,
    borderTopLeftRadius: BORDERRADIUS.radius_25,
    borderTopRightRadius: BORDERRADIUS.radius_25,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  linearGradient: {
    height: '70%', 
  },
  linear: {
    borderTopColor: COLORS.Black,
    borderTopWidth: 2, 
    width: '100%', 
    alignSelf: 'center',
    backgroundColor: COLORS.NetflixRed,
    borderStyle: 'dashed',
  },
  ticketFooter: {
    backgroundColor: COLORS.NetflixRedRGB10,
    width: '100%',
    alignItems: 'center',
    paddingBottom: SPACING.space_20, 
    alignSelf: 'center',
    borderBottomLeftRadius: BORDERRADIUS.radius_25,
    borderBottomRightRadius: BORDERRADIUS.radius_25,
    paddingTop: SPACING.space_10, 
  },
  ticketDateContainer: {
    flexDirection: 'row',
    gap: SPACING.space_36,
    alignItems: 'center',
    justifyContent: 'space-around', 
    marginVertical: SPACING.space_10,
    width: '90%', 
  },
  ticketSeatContainer: {
    flexDirection: 'row',
    gap: SPACING.space_20, 
    alignItems: 'flex-start', 
    justifyContent: 'space-around',
    marginVertical: SPACING.space_10,
    width: '90%', 
  },
  dateTitle: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_24,
    color: COLORS.White,
  },
  subtitle: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_12,
    color: COLORS.White,
    marginTop: SPACING.space_4,
  },
  subheading: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_14,
    color: COLORS.White,
  },
  subtitleContainer: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: SPACING.space_4, 
  },
  clockIcon: {
    fontSize: FONTSIZE.size_20, 
    color: COLORS.White,
    marginBottom: SPACING.space_4,
  },
  barcodeImage: {
    height: 40, 
    aspectRatio: 158 / 52,
    marginTop: SPACING.space_15, 
  },
  blackCircle: {
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: COLORS.Black,
    zIndex: 1, 
  },
});

export default TicketDetailScreen;