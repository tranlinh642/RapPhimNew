// AppHeader.tsx
import * as React from 'react';
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  BORDERRADIUS,
  COLORS,
  FONTFAMILY,
  FONTSIZE,
  SPACING,
} from '../theme/theme';
import CustomIcon from './CustomIcon'; 

interface AppHeaderProps {
  name: string;
  header?: string;
  action: () => void;
  showClock?: boolean; 
  runtime?: number;    
  customIconStyle?: object; 
  customTextStyle?: object;  
}

const AppHeader = (props: AppHeaderProps) => {
  const formatTime = (totalMinutes: number | undefined) => {
    if (totalMinutes === undefined || totalMinutes === null || totalMinutes <=0) return '';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.iconBG, props.customIconStyle]} 
        onPress={() => props.action()}>
        <Ionicons name={props.name} style={styles.iconStyle} />
      </TouchableOpacity>

      {props.header ? (
        <Text style={[styles.headerText, props.customTextStyle]}>{props.header}</Text>
      ) : (
        <View style={styles.emptySpaceInHeader} />
      )}

      {props.showClock && props.runtime ? (
        <View style={styles.timeContainerHeader}>
          <CustomIcon name="clock" style={styles.clockIconHeader} />
          <Text style={styles.runtimeTextHeader}>{formatTime(props.runtime)}</Text>
        </View>
      ) : (
        <View style={styles.emptyContainer} /> 
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.space_10, 
  },
  iconBG: {
    padding: SPACING.space_8,
    borderRadius: BORDERRADIUS.radius_20,
  },
  iconStyle: {
    color: COLORS.White,
    fontSize: FONTSIZE.size_24, 
  },
  headerText: {
    flex: 1,
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_20,
    textAlign: 'center',
    color: COLORS.White,
    marginHorizontal: SPACING.space_10, 
  },
  emptySpaceInHeader: {
    flex: 1,
  },
  emptyContainer: {
    width: SPACING.space_20 * 2,
    height: SPACING.space_20 * 2,
  },
  timeContainerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: SPACING.space_10,
    paddingVertical: SPACING.space_4,
    borderRadius: BORDERRADIUS.radius_15,
  },
  clockIconHeader: {
    fontSize: FONTSIZE.size_14,
    color: COLORS.WhiteRGBA75,
    marginRight: SPACING.space_4,
  },
  runtimeTextHeader: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_12,
    color: COLORS.White,
  },
});
export default AppHeader;