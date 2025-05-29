// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react'; // Thêm useState
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { COLORS, SPACING, FONTFAMILY, FONTSIZE, BORDERRADIUS } from '../theme/theme'; // Import thêm FONTFAMILY, FONTSIZE, BORDERRADIUS
import {
  nowPlayingMovies,
  upcomingMovies,
  baseImagePath,
} from '../api/apicalls';

import InputHeader from '../components/InputHeader';
import MovieCard from '../components/MovieCard'; 

const { width } = Dimensions.get('window');

// Giữ lại các hàm fetch API
const getNowPlayingMoviesListAPI = async () => { 
  try {
    const url = nowPlayingMovies('VN', 'vi-VN');
    let response = await fetch(url, { headers: { accept: 'application/json' } });
    let json = await response.json();
    return json;
  } catch (error) {
    console.error('Something went wrong in getNowPlayingMoviesListAPI Function', error);
  }
};

const getUpcomingMoviesListAPI = async () => { 
  try {
    const url = upcomingMovies('VN', 'vi-VN');
    let response = await fetch(url, { headers: { accept: 'application/json' } });
    let json = await response.json();
    return json;
  } catch (error) {
    console.error('Something went wrong in getUpcomingMoviesListAPI Function', error);
  }
};


const HomeScreen = ({ navigation }: any) => {
  const [nowPlayingMoviesList, setNowPlayingMoviesList] = useState<any[] | null>(null); 
  const [upcomingMoviesList, setUpcomingMoviesList] = useState<any[] | null>(null);

  const [activeTab, setActiveTab] = useState<'NowPlaying' | 'ComingSoon'>('NowPlaying'); 

  useEffect(() => {
    (async () => {
      let tempNowPlaying = await getNowPlayingMoviesListAPI();
      if (tempNowPlaying && tempNowPlaying.results) {
        setNowPlayingMoviesList([{ id: 'dummyLeft' }, ...tempNowPlaying.results, { id: 'dummyRight' }]);
      } else {
        setNowPlayingMoviesList([]); 
      }


      let tempUpcoming = await getUpcomingMoviesListAPI();
      if (tempUpcoming && tempUpcoming.results) {
        setUpcomingMoviesList([{ id: 'dummyLeftUpcoming' }, ...tempUpcoming.results, { id: 'dummyRightUpcoming' }]);
      } else {
        setUpcomingMoviesList([]);
      }
    })();
  }, []);

  const searchMoviesFunction = (searchText: string) => {
    navigation.navigate('Search', { searchText });
  };

  if (
    nowPlayingMoviesList === null ||
    upcomingMoviesList === null
  ) {
    return (
      <ScrollView style={styles.container} bounces={false} contentContainerStyle={styles.scrollViewFlex}>
        <StatusBar hidden />
        <View style={styles.InputHeaderContainer}>
          <InputHeader searchFunction={searchMoviesFunction} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={'large'} color={COLORS.NetflixRed} />
        </View>
      </ScrollView>
    );
  }

  const currentList = activeTab === 'NowPlaying' ? nowPlayingMoviesList : upcomingMoviesList;

  return (
    <ScrollView style={styles.container} bounces={false}>
      <StatusBar hidden />
      <View style={styles.InputHeaderContainer}>
        <InputHeader searchFunction={searchMoviesFunction} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'NowPlaying' && styles.activeTabButton]}
          onPress={() => setActiveTab('NowPlaying')}>
          <Text style={[styles.tabButtonText, activeTab === 'NowPlaying' && styles.activeTabButtonText]}>
            Đang Chiếu
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'ComingSoon' && styles.activeTabButton]}
          onPress={() => setActiveTab('ComingSoon')}>
          <Text style={[styles.tabButtonText, activeTab === 'ComingSoon' && styles.activeTabButtonText]}>
            Sắp Chiếu
          </Text>
        </TouchableOpacity>
      </View>

      {currentList && currentList.length > 0 ? (
         <FlatList
            data={currentList}
            keyExtractor={(item: any) => item.id.toString()}
            bounces={false}
            snapToInterval={width * 0.7 + SPACING.space_36}
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate={0}
            contentContainerStyle={styles.containerGap36}
            renderItem={({ item, index }) => {
              if (!item.original_title && (item.id === 'dummyLeft' || item.id === 'dummyRight' || item.id === 'dummyLeftUpcoming' || item.id === 'dummyRightUpcoming')) {
                return (
                  <View
                    style={{
                      width: (width - (width * 0.7 + SPACING.space_36 * 2)) / 2,
                    }}/>
                );
              }
              return (
                <MovieCard
                  shoudlMarginatedAtEnd={true}
                  cardFunction={() => {
                    navigation.push('MovieDetails', {
                        movieid: item.id,
                        isNowPlaying: activeTab === 'NowPlaying'
                    });
                  }}
                  cardWidth={width * 0.7}
                  isFirst={index === 0 ? true : false}
                  isLast={index === upcomingMoviesList?.length - 1 ? true : false}
                  title={item.title || item.original_title}
                  imagePath={baseImagePath('w780', item.poster_path)}
                  genre={item.genre_ids ? item.genre_ids.slice(0, 3) : []} 
                  vote_average={item.vote_average}
                  vote_count={item.vote_count}
                />
              );
            }}
          />
        ) : (
        (nowPlayingMoviesList !== null && upcomingMoviesList !== null) && (
            <View style={styles.emptyListContainer}>
                <Text style={styles.emptyListText}>
                    {activeTab === 'NowPlaying' ? 'Không có phim đang chiếu.' : 'Chưa có thông tin phim sắp chiếu.'}
                </Text>
            </View>
        )
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    backgroundColor: COLORS.Black,
    flex: 1, 
  },
  scrollViewFlex: { 
    flex: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
  },
  InputHeaderContainer: {
    marginHorizontal: SPACING.space_20, 
    marginTop: SPACING.space_20,   
    marginBottom: SPACING.space_10,  
  },

  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: SPACING.space_20,
    paddingVertical: SPACING.space_10,
    marginHorizontal: SPACING.space_20,
    borderRadius: BORDERRADIUS.radius_25,
    backgroundColor: COLORS.DarkGrey,
    marginBottom: SPACING.space_15,
  },
  tabButton: {
    paddingVertical: SPACING.space_10,
    paddingHorizontal: SPACING.space_24, 
    borderRadius: BORDERRADIUS.radius_20,
    marginHorizontal: SPACING.space_4,
  },
  activeTabButton: {
    backgroundColor: COLORS.NetflixRed, 
  },
  tabButtonText: {
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_14,
    color: COLORS.WhiteRGBA75, 
  },
  activeTabButtonText: {
    color: COLORS.White, 
  },
  containerGap36: {
    gap: SPACING.space_36,
    paddingBottom: SPACING.space_20, 
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.space_20,
    minHeight: 200, 
  },
  emptyListText: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_16,
    color: COLORS.WhiteRGBA75,
    textAlign: 'center',
  },
});

export default HomeScreen;