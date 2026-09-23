import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadow } from '@/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { focused: IoniconsName; unfocused: IoniconsName }> = {
  home: { focused: 'home', unfocused: 'home-outline' },
  learn: { focused: 'compass', unfocused: 'compass-outline' },
  stories: { focused: 'book', unfocused: 'book-outline' },
  practice: { focused: 'flash', unfocused: 'flash-outline' },
  vocabulary: { focused: 'library', unfocused: 'library-outline' },
  progress: { focused: 'stats-chart', unfocused: 'stats-chart-outline' },
  profile: { focused: 'person', unfocused: 'person-outline' },
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons = TAB_ICONS[name] ?? { focused: 'ellipse' as IoniconsName, unfocused: 'ellipse-outline' as IoniconsName };
  return (
    <View style={styles.iconWrap}>
      <Ionicons
        name={focused ? icons.focused : icons.unfocused}
        size={22}
        color={focused ? colors.primary : colors.textMuted}
      />
      {focused && <View style={styles.indicator} />}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="learn"
          options={{
            title: 'Learn',
            tabBarIcon: ({ focused }) => <TabIcon name="learn" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="stories"
          options={{
            title: 'Stories',
            tabBarIcon: ({ focused }) => <TabIcon name="stories" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="practice"
          options={{
            title: 'Practice',
            tabBarIcon: ({ focused }) => <TabIcon name="practice" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="vocabulary"
          options={{
            title: 'Vocab',
            tabBarIcon: ({ focused }) => <TabIcon name="vocabulary" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: 'Progress',
            tabBarIcon: ({ focused }) => <TabIcon name="progress" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.borderLight,
    borderTopWidth: 0.5,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    ...shadow.sm,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    bottom: -10,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});
