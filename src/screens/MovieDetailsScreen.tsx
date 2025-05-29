import React, {useEffect, useState, useCallback} from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import YoutubeIframe from 'react-native-youtube-iframe';
import {
  baseImagePath,
  movieCastDetails,
  movieDetails, 
  movieVideos,
} from '../api/apicalls';
import {
  BORDERRADIUS,
  COLORS,
  FONTFAMILY,
  FONTSIZE,
  SPACING,
} from '../theme/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AppHeader from '../components/AppHeader';
import LinearGradient from 'react-native-linear-gradient';
import CategoryHeader from '../components/CategoryHeader';
import CastCard from '../components/CastCard';

const getMovieDetailsAPI = async (movieid: number, language: string) => {
  try {
    const url = movieDetails(movieid, language); 
    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
      },
    });
    if (!response.ok) {
      console.error(
        `HTTP error ${response.status} in getMovieDetailsAPI for lang ${language}`,
      );
      return null; 
    }
    const json = await response.json();
    return json;
  } catch (error) {
    console.error(
      `Something went wrong in getMovieDetailsAPI for lang ${language}`,
      error,
    );
    return null; 
  }
};

const getMovieCastDetailsAPI = async (movieid: number) => {
  try {
    const url = movieCastDetails(movieid, 'vi-VN'); 
    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
      },
    });
    if (!response.ok) {
      console.error(`HTTP error ${response.status} in getMovieCastDetailsAPI`);
      return null;
    }
    const json = await response.json();
    return json;
  } catch (error) {
    console.error(
      'Something went wrong in getMovieCastDetailsAPI Function',
      error,
    );
    return null;
  }
};

const getMovieVideosAPI = async (movieid: number) => {
  try {
    const url = movieVideos(movieid);
    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
      },
    });
    if (!response.ok) {
      console.error(`HTTP error ${response.status} in getMovieVideosAPI`);
      return null;
    }
    const json = await response.json();
    return json;
  } catch (error) {
    console.error('Something went wrong in getMovieVideosAPI Function', error);
    return null;
  }
};

const MovieDetailsScreen = ({navigation, route}: any) => {
  const [movieData, setMovieData] = useState<any>(undefined);
  const [movieCastData, setMovieCastData] = useState<any>(undefined);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const videoAspectRatio = 16 / 9;
  const videoWidth = screenWidth * 0.9;
  const videoHeight = videoWidth / videoAspectRatio;

  const isNowPlayingMovie = route.params?.isNowPlaying === true;

  useEffect(() => {
    const fetchData = async () => {
      const movieIdFromRoute = route.params.movieid;
      if (!movieIdFromRoute) {
        setMovieData(null);
        return;
      }
      let tempMovieDataVI = await getMovieDetailsAPI(movieIdFromRoute, 'vi-VN');
      if (
        tempMovieDataVI &&
        (!tempMovieDataVI.overview || tempMovieDataVI.overview.trim() === '')
      ) {
        console.log(
          `Mô tả tiếng Việt cho phim ID ${movieIdFromRoute} bị thiếu. Đang lấy mô tả tiếng Anh.`,
        );
        const tempMovieDataEN = await getMovieDetailsAPI(
          movieIdFromRoute,
          'en-US',
        );
        if (
          tempMovieDataEN &&
          tempMovieDataEN.overview &&
          tempMovieDataEN.overview.trim() !== ''
        ) {
          tempMovieDataVI = {
            ...tempMovieDataVI,
            overview: tempMovieDataEN.overview,
          };
        }
      }

      if (!tempMovieDataVI) {
        setMovieData(null); 
        return;
      }

      setMovieData(tempMovieDataVI);

      const videosData = await getMovieVideosAPI(movieIdFromRoute);
      if (videosData && videosData.results) {
        const officialTrailer = videosData.results.find(
          (video: any) => video.site === 'YouTube' && video.type === 'Trailer',
        );
        if (officialTrailer) {
          setTrailerKey(officialTrailer.key);
        } else {
          const anyYoutubeVideo = videosData.results.find(
            (video: any) =>
              video.site === 'YouTube' && video.type !== 'Behind the Scenes', 
          );
          setTrailerKey(anyYoutubeVideo ? anyYoutubeVideo.key : null);
        }
      }

      const tempMovieCastData = await getMovieCastDetailsAPI(movieIdFromRoute);
      setMovieCastData(tempMovieCastData?.cast);
    };

    fetchData();
  }, [route.params.movieid]);

  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') setPlaying(false);
    if (state === 'playing') setPlaying(true);
    if (state === 'paused') setPlaying(false);
  }, []);

  if (movieData === undefined) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollViewContainer}
        bounces={false}
        showsVerticalScrollIndicator={false}>
        <View style={styles.appHeaderContainerLoading}>
          <AppHeader
            name="arrow-back-outline"
            action={() => navigation.goBack()}
          />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={'large'} color={COLORS.NetflixRed} />
        </View>
      </ScrollView>
    );
  }

  if (movieData === null) {
    return (
      <View style={styles.container}>
        <View style={styles.appHeaderContainerLoading}>
          <AppHeader
            name="arrow-back-outline"
            action={() => navigation.goBack()}
          />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Không thể tải thông tin phim.</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      bounces={false}
      showsVerticalScrollIndicator={false}>
      <StatusBar hidden />

      <View style={styles.headerContainer}>
        <ImageBackground
          source={{
            uri: baseImagePath('w780', movieData?.backdrop_path),
          }}
          style={styles.backdropImage}>
          <LinearGradient
            colors={[COLORS.BlackRGB10 || 'rgba(0,0,0,0.1)', COLORS.Black]}
            style={styles.backdropGradient}>
            <View style={styles.headerOverlay}>
              <AppHeader
                name="arrow-back-outline"
                action={() => navigation.goBack()}
                showClock={true}
                runtime={movieData?.runtime}
                customIconStyle={{
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  borderRadius: BORDERRADIUS.radius_20,
                }}
              />
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>

      <View style={styles.videoContainer}>
        {trailerKey ? (
          <>
            <YoutubeIframe
              height={videoHeight}
              width={videoWidth}
              play={playing}
              videoId={trailerKey}
              onChangeState={onStateChange}
              webViewProps={{
                scrollEnabled: false,
                androidLayerType: 'hardware', 
              }}
              initialPlayerParams={{
                preventFullScreen: true,
                controls: true,
                showClosedCaptions: false,
              }}
            />
            {!playing && (
              <TouchableOpacity
                style={[
                  styles.playButtonOverlayVideo,
                  {height: videoHeight, width: videoWidth},
                ]}
                onPress={() => setPlaying(true)}>
                <Ionicons
                  name="play-circle-outline"
                  size={60}
                  color={COLORS.WhiteRGBA75 || 'rgba(255,255,255,0.75)'}
                />
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View
            style={[
              styles.noTrailerContainer,
              {height: videoHeight, width: videoWidth},
            ]}>
            <Ionicons
              name="videocam-off-outline"
              size={40}
              color={COLORS.WhiteRGBA50 || 'rgba(255,255,255,0.5)'}
            />
            <Text style={styles.noTrailerText}>Không có trailer</Text>
          </View>
        )}
      </View>

      <View style={styles.mainInfoContainer}>
        <Text style={styles.title}>
          {movieData?.title || movieData?.original_title}
        </Text>

        <View style={styles.ratingsSection}>
          <View style={styles.starRatingContainer}>
            <Ionicons name="star" style={styles.starIcon} />
            <Text style={styles.ratingText}>
              {movieData?.vote_average?.toFixed(1)}
              <Text style={styles.ratingCountText}>
                {' '}
                ({movieData?.vote_count} reviews)
              </Text>
            </Text>
          </View>
        </View>

        <View style={styles.genreContainer}>
          {movieData?.genres?.map((item: any) => (
            <View style={styles.genreBox} key={item.id}>
              <Text style={styles.genreText}>{item.name}</Text>
            </View>
          ))}
        </View>

        {movieData?.tagline?.trim() ? (
          <Text style={styles.tagline}>{movieData.tagline}</Text>
        ) : null}
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>
          {movieData?.overview || 'Không có mô tả.'}
        </Text>
      </View>

      {movieCastData && movieCastData.length > 0 && (
        <View style={styles.castContainer}>
          <CategoryHeader title="Diễn viên hàng đầu" />
          <FlatList
            data={movieCastData}
            keyExtractor={(item: any) => String(item.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.castFlatListContainer}
            renderItem={({item, index}) => (
              <CastCard
                shouldMarginatedAtEnd={true}
                cardWidth={80}
                isFirst={index === 0}
                isLast={index === movieCastData.length - 1}
                imagePath={baseImagePath('w185', item.profile_path)}
                title={item.name || item.original_name}
                subtitle={item.character}
              />
            )}
          />
        </View>
      )}

      {movieData && isNowPlayingMovie && (
        <View style={styles.bookingButtonContainer}>
          <TouchableOpacity
            style={styles.bookingButton}
            onPress={() => {
              if (movieData) {
                navigation.push('SeatBooking', {
                  bgImage: baseImagePath('w780', movieData.backdrop_path),
                  PosterImage: baseImagePath('original', movieData.poster_path),
                  movieTitle: movieData.title || movieData.original_title,
                  movieId: route.params.movieid,
                });
              }
            }}>
            <Text style={styles.bookingButtonText}>Đặt vé</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  loadingContainer: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  errorText: {
    color: COLORS.WhiteRGBA75 || 'rgba(255,255,255,0.75)',
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_16,
    textAlign: 'center',
  },
  appHeaderContainerLoading: {
    marginHorizontal: SPACING.space_20,
    marginTop: (StatusBar.currentHeight || 0) + SPACING.space_10,
  },
  headerContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  backdropImage: {
    width: '100%',
    height: '100%',
  },
  backdropGradient: {
    height: '100%',
    width: '100%',
    justifyContent: 'flex-start', 
  },
  headerOverlay: {
    position: 'absolute',
    top: (StatusBar.currentHeight || 0) + SPACING.space_10,
    left: SPACING.space_10,
    right: SPACING.space_10,
    zIndex: 10, 
  },
  videoContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.space_20,
    justifyContent: 'center',
    position: 'relative',
  },
  noTrailerContainer: {
    backgroundColor: COLORS.Black,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDERRADIUS.radius_8,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA50 || 'rgba(255,255,255,0.5)',
  },
  noTrailerText: {
    color: COLORS.WhiteRGBA75 || 'rgba(255,255,255,0.75)',
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_14,
    marginTop: SPACING.space_8,
  },
  playButtonOverlayVideo: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, 
    backgroundColor: 'rgba(0,0,0,0.2)', 
  },
  mainInfoContainer: {
    paddingHorizontal: SPACING.space_20,
    backgroundColor: COLORS.Black,
    paddingTop: SPACING.space_10,
  },
  title: {
    fontFamily: FONTFAMILY.poppins_bold,
    fontSize: FONTSIZE.size_24, 
    color: COLORS.White,
    textAlign: 'center',
    marginBottom: SPACING.space_10,
  },
  ratingsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.space_10,
  },
  starRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: FONTSIZE.size_18,
    color: COLORS.Yellow,
    marginRight: SPACING.space_4,
  },
  ratingText: {
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_14,
    color: COLORS.White,
  },
  ratingCountText: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_12,
    color: COLORS.WhiteRGBA75 || 'rgba(255,255,255,0.75)',
  },
  genreContainer: {
    flexDirection: 'row',
    gap: SPACING.space_8,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: SPACING.space_10,
  },
  genreBox: {
    borderColor: COLORS.WhiteRGBA50 || 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    paddingHorizontal: SPACING.space_12,
    paddingVertical: SPACING.space_4,
    borderRadius: BORDERRADIUS.radius_25,
  },
  genreText: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_10,
    color: COLORS.WhiteRGBA75 || 'rgba(255,255,255,0.75)',
  },
  tagline: {
    fontFamily: FONTFAMILY.poppins_light,
    fontSize: FONTSIZE.size_14,
    fontStyle: 'italic',
    color: COLORS.WhiteRGBA75 || 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginVertical: SPACING.space_15,
  },
  descriptionContainer: {
    marginHorizontal: SPACING.space_20,
    marginVertical: SPACING.space_15,
  },
  descriptionText: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_14,
    color: COLORS.White,
    lineHeight: 22, 
  },
  castContainer: {
    marginTop: SPACING.space_15,
  },
  castFlatListContainer: {
    paddingHorizontal: SPACING.space_20,
    paddingVertical: SPACING.space_10,
    gap: SPACING.space_15,
  },
  bookingButtonContainer: {
    paddingHorizontal: SPACING.space_20,
    paddingBottom: SPACING.space_20,
    paddingTop: SPACING.space_10,
    alignItems: 'center',
  },
  bookingButton: {
    backgroundColor: COLORS.NetflixRed,
    width: '100%',
    paddingVertical: SPACING.space_14,
    borderRadius: BORDERRADIUS.radius_25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingButtonText: {
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_16,
    color: COLORS.White,
  },
});

export default MovieDetailsScreen;