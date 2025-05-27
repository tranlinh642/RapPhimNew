import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {
  BORDERRADIUS,
  COLORS,
  FONTFAMILY,
  FONTSIZE,
  SPACING,
} from '../theme/theme';
import CustomIcon from './CustomIcon';
import Ionicons from 'react-native-vector-icons/Ionicons';

const InputHeader = (props: any) => {
  const [searchText, setSearchText] = useState<string>(props.initialText || '');

  useEffect(() => {
    if (props.initialText) {
      setSearchText(props.initialText);
    }
  }, [props.initialText]);

  const handleSearch = () => {
    if (typeof props.searchFunction === 'function') {
      props.searchFunction(searchText);
    } else {
      console.error('searchFunction is not a function:', props.searchFunction);
    }
  };

  return (
    <View style={styles.inputBox}>
      <TextInput
        style={styles.textInput}
        onChangeText={textInput => setSearchText(textInput)}
        value={searchText}
        placeholder="Search your Movies..."
        placeholderTextColor={COLORS.WhiteRGBA32}
      />
      <TouchableOpacity
        style={styles.searchIcon}
        onPress={handleSearch}>
        <Ionicons
          name="search-outline"
          color={COLORS.NetflixRed}
          size={FONTSIZE.size_24}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputBox: {
    display: 'flex',
    paddingVertical: SPACING.space_8,
    paddingHorizontal: SPACING.space_24,
    borderWidth: 2,
    borderColor: COLORS.WhiteRGBA15,
    borderRadius: BORDERRADIUS.radius_25,
    flexDirection: 'row',
  },
  textInput: {
    width: '90%',
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_14,
    color: COLORS.White,
  },
  searchIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.space_10,
  },
});

export default InputHeader;