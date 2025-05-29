import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import TicketScreen from '../screens/TicketScreen';
import UserAccountScreen from '../screens/UserAccountScreen';

import { COLORS, FONTSIZE, SPACING } from '../theme/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarHideOnKeyboard: true, // Ẩn tab bar khi bàn phím hiện lên
        headerShown: false, // Ẩn header mặc định
        tabBarStyle: {
          backgroundColor: COLORS.Black,
          borderTopWidth: 0,
          height: 80 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 17,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              {focused ? (
                <View style={styles.focusedTab}>
                  <Ionicons
                    name="film-outline"
                    size={FONTSIZE.size_20}
                    color={COLORS.White}
                  />
                  <Text style={styles.focusedText}>Movie</Text>
                </View>
              ) : (
                <Ionicons
                  name="film-outline"
                  size={FONTSIZE.size_30}
                  color={COLORS.White}
                />
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              {focused ? (
                <View style={styles.focusedTab}>
                  <Ionicons
                    name="search-outline"
                    size={FONTSIZE.size_20}
                    color={COLORS.White}
                  />
                  <Text style={styles.focusedText}>Search</Text>
                </View>
              ) : (
                <Ionicons
                  name="search-outline"
                  size={FONTSIZE.size_30}
                  color={COLORS.White}
                />
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Ticket"
        component={TicketScreen as any}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              {focused ? (
                <View style={styles.focusedTab}>
                  <Ionicons
                    name="ticket-outline"
                    size={FONTSIZE.size_20}
                    color={COLORS.White}
                  />
                  <Text style={styles.focusedText}>Ticket</Text>
                </View>
              ) : (
                <Ionicons
                  name="ticket-outline"
                  size={FONTSIZE.size_30}
                  color={COLORS.White}
                />
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="User"
        component={UserAccountScreen}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              {focused ? (
                <View style={styles.focusedTab}>
                  <AntDesign
                    name="user"
                    size={FONTSIZE.size_20}
                    color={COLORS.White}
                  />
                  <Text style={styles.focusedText}>User</Text>
                </View>
              ) : (
                <AntDesign
                  name="user"
                  size={FONTSIZE.size_30}
                  color={COLORS.White}
                />
              )}
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: 60,
  },
  focusedTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.NetflixRed,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 24,
    minWidth: 90,
    maxWidth: 140,
    flexWrap: 'nowrap',
  },
  focusedText: {
    color: COLORS.White,
    fontSize: FONTSIZE.size_14,
    fontWeight: 'bold',
    marginLeft: 6,
    flexShrink: 0,
  },
});

export default TabNavigator;