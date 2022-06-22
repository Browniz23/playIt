import { StatusBar } from 'expo-status-bar';
import { ImageBackground, Image, StyleSheet, Text, View, Button, Touchable, Pressable } from 'react-native';
import {useEffect, useState} from 'react';
import WelcomeScreen from './screens/welcomeScreen';
import ChooseScreen from './screens/chooseScreen';
import CameraScreen from './screens/cameraScreen';
import SoundScreen from './screens/soundScreen';
import HarmonyScreen from './screens/harmonyScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import NavigationBarScreen from './screens/navigationBarScreen';
import PianoScreen from './screens/pianoScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {Restart} from 'fiction-expo-restart';
import {I18nManager} from 'react-native';


const Tab = createBottomTabNavigator();

function FeaturesTabs (props) {
  var initialRoute = props.route.params.initialRoute;
  // added resefix+reset when found right to left.
  useEffect(() => { 
    if(I18nManager.isRTL) 
    {
      I18nManager.allowRTL(false);  
      I18nManager.forceRTL(false); 
      Restart();
    }
  }, []);
  return (
      <Tab.Navigator initialRouteName={initialRoute} backBehavior='none'
      // screenOptions={({ route }) => ({ //TODO: DOESNT REALLY NEED!
      //     screenOptions: ({ focused, color, size }) => {
      //         if (route.name === 'Image') {
      //             return <Image style={styles.logo} source={require('../assets/camera.png')}/>
      //         } else if (route.name === 'Sound') {
      //             return <Image style={styles.logo} source={require('../assets/microphone.png')}/>
      //         } else {
      //             return <Image style={styles.logo} source={require('../assets/symphony.jpg')}/>
      //         }
      //     },
      // })}
      tabBarStyle={{
          activeTintColor: 'tomato',
          inactiveTintColor: 'gray',
      }}>
      <Tab.Screen name="Image" component={CameraScreen} options={{
          tabBarLabel: 'Image',
          tabBarIcon: ({focused, color, size}) => (
            <Image style={focused ? styles.tabImageBold : styles.tabImage} source={require('../assets/camera.png')}/>
          ),}}/>
      <Tab.Screen name="Sound" component={SoundScreen} options={{
          tabBarLabel: 'Sound',
          tabBarIcon: ({focused, color, size}) => (
            <Image style={focused ? styles.tabImageBold : styles.tabImage} source={require('../assets/microphone.png')}/>
          ),}}/>
      <Tab.Screen name="Harmony" component={HarmonyScreen} options={{
          tabBarLabel: 'Harmony',
          tabBarIcon: ({focused, color, size}) => (
            <Image style={focused ? styles.tabImageBold : styles.tabImage} source={require('../assets/symphony.jpg')}/>
          ),}}/>
    </Tab.Navigator>
  );
}

const Stack = createNativeStackNavigator();
const myStack = () => {
  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator
      screenOptions={{gestureEnabled: true, headerShown: false}}>
        <Stack.Screen name="Welcome" component={WelcomeScreen}/>
        <Stack.Screen name="Choose" component={ChooseScreen}/>
        <Stack.Screen name="FeaturesTabs" component={FeaturesTabs}/>
        <Stack.Screen name="Piano" component={PianoScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  logo :{
      width: 170,
      height: 170,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: "purple",
      borderRadius: 170 / 2,
  },
  tabImage:{
      width: 30,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: "purple",
      borderRadius: 30 / 2,
  },
  tabImageBold: {
      width: 30,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: "purple",
      borderRadius: 30 / 2,
      borderWidth: 4,
      borderColor: 'white'
  }
});

export default myStack;

