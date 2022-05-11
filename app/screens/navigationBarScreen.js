import React from 'react';
import {View, Text, StyleSheet, Image, Button} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import CameraScreen from './cameraScreen';
import SoundScreen from './soundScreen';
import {Ionicons} from 'react-native-vector-icons';
import HarmonyScreen from './harmonyScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PianoScreen from './pianoScreen';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabs = (props) => {
    var initialRoute = props.route.params.initialRoute;
    console.log("real bar")
    return (
        <Tab.Navigator initialRouteName={initialRoute} backBehavior='none'
        screenOptions={({ route }) => ({ //TODO: DOESNT REALLY NEED!
            screenOptions: ({ focused, color, size }) => {
                let iconName;
                if (route.name === 'Camera') {
                    return <Image style={styles.logo} source={require('../../assets/camera.png')}/>
                } else if (route.name === 'Sound') {
                    return <Image style={styles.logo} source={require('../../assets/microphone.png')}/>
                } else {
                    return <Image style={styles.logo} source={require('../../assets/symphony.jpg')}/>
                }
            },
        })}
        tabBarStyle={{
            activeTintColor: 'tomato',
            inactiveTintColor: 'gray',
        }}>
        <Tab.Screen name="Camera" component={CameraScreen} options={{
            tabBarLabel: 'Camera',
            tabBarIcon: ({focused, color, size}) => (
              <Image style={focused ? styles.tabImageBold : styles.tabImage} source={require('../../assets/camera.png')}/>
            ),}}/>
        <Tab.Screen name="Sound" component={SoundScreen} options={{
            tabBarLabel: 'Sound',
            tabBarIcon: ({focused, color, size}) => (
              <Image style={focused ? styles.tabImageBold : styles.tabImage} source={require('../../assets/microphone.png')}/>
            ),}}/>
        <Tab.Screen name="Harmony" component={HarmonyScreen} options={{
            tabBarLabel: 'Harmony',
            tabBarIcon: ({focused, color, size}) => (
              <Image style={focused ? styles.tabImageBold : styles.tabImage} source={require('../../assets/symphony.jpg')}/>
            ),}}/>
      </Tab.Navigator>
    );
}
const NavigationBarScreen = ({props}) => {
    console.log("barstack")
    return (
        <NavigationContainer independent={true} initialRoute={tabs}>
            <Stack.Screen
                name="tabs"
                component={tabs}
                options={{ headerShown: false }}
                />
            <Stack.Screen name="Piano" component={PianoScreen}/>
        </NavigationContainer>
    );
    // var initialRoute = props.route.params.initialRoute;
    // return (
    //     <NavigationContainer independent={true}>
    //     <Tab.Navigator initialRouteName={initialRoute} backBehavior='none'
    //     screenOptions={({ route }) => ({ //TODO: DOESNT REALLY NEED!
    //         screenOptions: ({ focused, color, size }) => {
    //             let iconName;
    //             if (route.name === 'Camera') {
    //                 return <Image style={styles.logo} source={require('../../assets/camera.png')}/>
    //             } else if (route.name === 'Sound') {
    //                 return <Image style={styles.logo} source={require('../../assets/microphone.png')}/>
    //             } else {
    //                 return <Image style={styles.logo} source={require('../../assets/symphony.jpg')}/>
    //             }
    //         },
    //     })}
    //     tabBarStyle={{
    //         activeTintColor: 'tomato',
    //         inactiveTintColor: 'gray',
    //     }}>
    //     <Tab.Screen name="Camera" component={CameraScreen} options={{
    //         tabBarLabel: 'Camera',
    //         tabBarIcon: ({focused, color, size}) => (
    //           <Image style={focused ? styles.tabImageBold : styles.tabImage} source={require('../../assets/camera.png')}/>
    //         ),}}/>
    //     <Tab.Screen name="Sound" component={SoundScreen} options={{
    //         tabBarLabel: 'Sound',
    //         tabBarIcon: ({focused, color, size}) => (
    //           <Image style={focused ? styles.tabImageBold : styles.tabImage} source={require('../../assets/microphone.png')}/>
    //         ),}}/>
    //     <Tab.Screen name="Harmony" component={HarmonyScreen} options={{
    //         tabBarLabel: 'Harmony',
    //         tabBarIcon: ({focused, color, size}) => (
    //           <Image style={focused ? styles.tabImageBold : styles.tabImage} source={require('../../assets/symphony.jpg')}/>
    //         ),}}/>
    //   </Tab.Navigator>
    // </NavigationContainer>
    // );
}

const styles = StyleSheet.create({
    background :{
        flex: 1,
        backgroundColor: "lavender"
    },
    c1 :{
        // flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'space-evenly',
        backgroundColor: "blue",
        flex: 1,
        flexDirection: 'row',
    },
    c2 :{
        // flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "green",
    },
    c3 :{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: "navy",
        padding: 10,
    },
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
        borderWidth: 2,
        borderColor: 'black'
    }
});
export default NavigationBarScreen;