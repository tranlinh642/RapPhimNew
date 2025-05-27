import React, { useState, useEffect, useCallback } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING } from '../theme/theme';
import { baseImagePath, searchMovies } from '../api/apicalls';
import InputHeader from '../components/InputHeader';
import SubMovieCard from '../components/SubMovieCard';

const { width } = Dimensions.get('screen');

const SearchScreen = ({ navigation, route }: any) => {
  const [searchList, setSearchList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialSearchText, setInitialSearchText] = useState<string>('');

  // Nhận từ khóa tìm kiếm từ navigation params
  useEffect(() => {
    const searchText = route.params?.searchText;
    if (searchText) {
      setInitialSearchText(searchText);
      searchMoviesFunction(searchText);
    }
  }, [route.params?.searchText]);

  const searchMoviesFunction = useCallback(async (name: string) => {
    try {
      if (!name.trim()) {
        setSearchList([]);
        return;
      }
      setIsLoading(true);
      console.log('Calling searchMovies with:', name);
      const response = await fetch(searchMovies(name));
      const json = await response.json();
      console.log('API Response:', json);

      if (json.results && Array.isArray(json.results)) {
        setSearchList(json.results);
      } else {
        setSearchList([]);
        console.log('No results found or invalid response');
      }
    } catch (error) {
      console.error('Something went wrong in searchMoviesFunction:', error);
      setSearchList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const renderHeader = () => (
    <View style={styles.InputHeaderContainer}>
      <InputHeader searchFunction={searchMoviesFunction} initialText={initialSearchText} />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <FlatList
        data={searchList}
        keyExtractor={(item: any) => item.id.toString()}
        bounces={false}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.centerContainer}
        renderItem={({ item, index }) => (
          <SubMovieCard
            shoudlMarginatedAtEnd={false}
            shouldMarginatedAround={true}
            cardFunction={() => {
              navigation.push('MovieDetails', { movieid: item.id });
            }}
            cardWidth={width / 2 - SPACING.space_12 * 2}
            title={item.original_title}
            imagePath={baseImagePath('w342', item.poster_path)}
          />
        )}
      />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.NetflixRed} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: COLORS.Black,
  },
  InputHeaderContainer: {
    marginHorizontal: SPACING.space_36,
    marginTop: SPACING.space_28,
    marginBottom: SPACING.space_28 - SPACING.space_12,
  },
  centerContainer: {
    alignItems: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.Black,
  },
});

export default SearchScreen;