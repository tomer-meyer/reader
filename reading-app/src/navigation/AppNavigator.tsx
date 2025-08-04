import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Define navigation types
export type RootStackParamList = {
  LibraryMain: undefined;
  DocumentReader: { documentId: number; highlightId?: number };
  AddContent: undefined;
};

export type ReviewStackParamList = {
  ReviewMain: undefined;
};

export type SearchStackParamList = {
  SearchMain: undefined;
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
};

// Import screens
import LibraryScreen from '../screens/LibraryScreen';
import ReviewScreen from '../screens/ReviewScreen';
import SearchScreen from '../screens/SearchScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DocumentReaderScreen from '../screens/DocumentReaderScreen';
import AddContentScreen from '../screens/AddContentScreen';

const Tab = createBottomTabNavigator();
const LibraryStack = createStackNavigator<RootStackParamList>();
const ReviewStack = createStackNavigator<ReviewStackParamList>();
const SearchStack = createStackNavigator<SearchStackParamList>();
const SettingsStack = createStackNavigator<SettingsStackParamList>();

// Library Stack Navigator
function LibraryStackNavigator() {
  return (
    <LibraryStack.Navigator>
      <LibraryStack.Screen 
        name="LibraryMain" 
        component={LibraryScreen}
        options={{ title: 'Library' }}
      />
      <LibraryStack.Screen 
        name="DocumentReader" 
        component={DocumentReaderScreen}
        options={{ title: 'Reader' }}
      />
      <LibraryStack.Screen 
        name="AddContent" 
        component={AddContentScreen}
        options={{ title: 'Add Content' }}
      />
    </LibraryStack.Navigator>
  );
}

// Review Stack Navigator
function ReviewStackNavigator() {
  return (
    <ReviewStack.Navigator>
      <ReviewStack.Screen 
        name="ReviewMain" 
        component={ReviewScreen}
        options={{ title: 'Daily Review' }}
      />
    </ReviewStack.Navigator>
  );
}

// Search Stack Navigator
function SearchStackNavigator() {
  return (
    <SearchStack.Navigator>
      <SearchStack.Screen 
        name="SearchMain" 
        component={SearchScreen}
        options={{ title: 'Search' }}
      />
    </SearchStack.Navigator>
  );
}

// Settings Stack Navigator
function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen 
        name="SettingsMain" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </SettingsStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Library') {
              iconName = focused ? 'library' : 'library-outline';
            } else if (route.name === 'Review') {
              iconName = focused ? 'refresh-circle' : 'refresh-circle-outline';
            } else if (route.name === 'Search') {
              iconName = focused ? 'search' : 'search-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Library" component={LibraryStackNavigator} />
        <Tab.Screen name="Review" component={ReviewStackNavigator} />
        <Tab.Screen name="Search" component={SearchStackNavigator} />
        <Tab.Screen name="Settings" component={SettingsStackNavigator} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}