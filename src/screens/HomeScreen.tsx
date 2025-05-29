import * as React from 'react';
import { useState, useEffect } from 'react';
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
import { COLORS, SPACING } from '../theme/theme';
import {
  nowPlayingMovies,
  upcomingMovies,
  popularMovies,
  baseImagePath,
  searchMovies,
} from '../api/apicalls';
import LinearGradient from 'react-native-linear-gradient';

import InputHeader from '../components/InputHeader';
import CategoryHeader from '../components/CategoryHeader';
import SubMovieCard from '../components/SubMovieCard';
import MovieCard from '../components/MovieCard';

const { width, height } = Dimensions.get('window');

const getNowPlayingMoviesList = async () => {
  try {
    const url = nowPlayingMovies('VN', 'vi-VN');
    let response = await fetch(url, {
      headers: {
        accept: 'application/json',
      },
    });
    let json = await response.json();
    return json;
  } catch (error) {
    console.error(' Something went wrong in getNowPlayingMoviesList Function', error);
  }
};

const getUpcomingMoviesList = async () => {
  try {
    const url = upcomingMovies('VN', 'vi-VN');
    let response = await fetch(url, {
      headers: {
        accept: 'application/json',
      },
    });
    let json = await response.json();
    return json;
  } catch (error) {
    console.error(' Something went wrong in getUpcomingMoviesList Function', error);
  }
};

const getPopularMoviesList = async () => {
  try {
    const url = popularMovies('VN', 'vi-VN');
    let response = await fetch(url, {
      headers: {
        accept: 'application/json',
      },
    });
    let json = await response.json();
    return json;
  } catch (error) {
    console.error(' Something went wrong in getPopularMoviesList Function', error);
  }
};

const HomeScreen = ({ navigation }: any) => {
  const [nowPlayingMoviesList, setNowPlayingMoviesList] = useState<any>(null);
  const [popularMoviesList, setPopularMoviesList] = useState<any>(null);
  const [upcomingMoviesList, setUpcomingMoviesList] = useState<any>(null);

  useEffect(() => {
    (async () => {
      let tempNowPlaying = await getNowPlayingMoviesList();
      setNowPlayingMoviesList([
        { id: 'dummy1' },
        ...tempNowPlaying.results,
        { id: 'dummy2' },
      ]);

      let tempPopular = await getPopularMoviesList();
      setPopularMoviesList(tempPopular.results);

      let tempUpcoming = await getUpcomingMoviesList();
      setUpcomingMoviesList(tempUpcoming.results);
    })();
  }, []);

  const searchMoviesFunction = (searchText: string) => {
    navigation.navigate('Search', { searchText }); // Truyền từ khóa tìm kiếm qua params
  };

  if (
    nowPlayingMoviesList === undefined || // Sửa lại điều kiện kiểm tra state ban đầu
    popularMoviesList === undefined ||
    upcomingMoviesList === undefined
  ) {
    return (
      // {/* Giao diện khi đang tải dữ liệu */}
      <ScrollView style={styles.container} bounces={false}>
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

  return (
    <ScrollView style={styles.container} bounces={false}>
      <StatusBar hidden />
      {/* Thanh tìm kiếm */}
      <View style={styles.InputHeaderContainer}>
        <InputHeader searchFunction={searchMoviesFunction} />
      </View>

      {/* Danh sách phim Đang chiếu */}
      <CategoryHeader title={'NowPlaying'} />
      <FlatList
        data={nowPlayingMoviesList}
        keyExtractor={(item: any) => item.id}
        bounces={false}
        snapToInterval={width * 0.7 + SPACING.space_36}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate={0}
        contentContainerStyle={styles.containerGap36}
        renderItem={({ item, index }) => {
          if (!item.original_title) {
            return (
              <View
                style={{
                  width: (width - (width * 0.7 + SPACING.space_36 * 2)) / 2,
                }}></View>
            );
          }
          return (
            <MovieCard
              shoudlMarginatedAtEnd={true}
              cardFunction={() => {
                navigation.push('MovieDetails', { movieid: item.id, isNowPlaying: true });
              }}
              cardWidth={width * 0.7}
              isFirst={index === 0 ? true : false} // Cần điều chỉnh nếu dummy items ảnh hưởng index
              isLast={index === nowPlayingMoviesList?.length - 1 ? true : false} // Cần điều chỉnh
              title={item.title || item.original_title}
              imagePath={baseImagePath('w780', item.poster_path)}
              genre={item.genre_ids.slice(1, 4)}
              vote_average={item.vote_average}
              vote_count={item.vote_count}
            />
          );
        }}
      />

      {/* Danh sách phim Phổ biến */}
      <CategoryHeader title={'Popular'} />
      <FlatList
        data={popularMoviesList}
        keyExtractor={(item: any) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={styles.containerGap36}
        renderItem={({ item, index }) => (
          <SubMovieCard
            shoudlMarginatedAtEnd={true}
            cardFunction={() => {
              navigation.push('MovieDetails', { movieid: item.id });
            }}
            cardWidth={width / 3}
            isFirst={index === 0 ? true : false}
            isLast={index === popularMoviesList?.length - 1 ? true : false}
            title={item.title || item.original_title}
            imagePath={baseImagePath('w342', item.poster_path)}
          />
        )}
      />

      {/* Danh sách phim Sắp chiếu */}
      <CategoryHeader title={'Upcoming'} />
      <FlatList
        data={upcomingMoviesList}
        keyExtractor={(item: any) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={styles.containerGap36}
        renderItem={({ item, index }) => (
          <SubMovieCard
            shoudlMarginatedAtEnd={true}
            cardFunction={() => {
              navigation.push('MovieDetails', { movieid: item.id });
            }}
            cardWidth={width / 3}
            isFirst={index === 0 ? true : false}
            isLast={index === upcomingMoviesList?.length - 1 ? true : false}
            title={item.title || item.original_title}
            imagePath={baseImagePath('w342', item.poster_path)}
          />
        )}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    backgroundColor: COLORS.Black,
  },
  loadingContainer: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  InputHeaderContainer: {
    marginHorizontal: SPACING.space_36,
    marginTop: SPACING.space_28,
  },
  containerGap36: {
    gap: SPACING.space_36,
  },
});

export default HomeScreen;