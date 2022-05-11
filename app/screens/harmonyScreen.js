import React, { useState } from 'react';
import {View, Text, StyleSheet, Image, Pressable, Button, ImageBackground} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import CameraScreen from './cameraScreen';
import SoundScreen from './soundScreen';
import {Ionicons} from 'react-native-vector-icons';

const teoria = require('teoria');
const HarmonyScreen = ({navigation}) => {
    // var notes = [{name :'b', duration:1, num:2}, {name :'c', duration:2, num:5}, {name :'g', duration:3, num:10}, {name :'a', duration:4, num:40}]
    var a = teoria.note('a1', { value: 4 });
    var b = teoria.note('b2', { value: 4 });
    var c = teoria.note('c3', { value: 4 });
    var d = teoria.note('d4', { value: 4 });
    var e = teoria.note('a#1', { value: 4 });
    var f = teoria.note('c#2', { value: 4 });
    var g = teoria.note('d#3', { value: 4 });
    var h = teoria.note('f#4', { value: 4 });
    var i = teoria.note('g#5', { value: 4 });
    var notes = [a,b,c,d,e,f,g,h,i];
    var ch1 = teoria.chord('g',6); var ch2 = teoria.chord('a7',5); var ch3 = teoria.chord('c',5); var ch4 = teoria.chord('f',6);
    var chords = [ch1, ch2, ch3, ch4];
    const [clickedCreate, setClickedCreate] = useState(false);
    // console.log("harmony")
    return (
        <View style={styles.background}>
            <ImageBackground source={require('../../assets/music_brown.jpg')} resizeMode="cover" style={styles.backgroundPicture}>
                <View style={styles.c2}>
                    <Image style={styles.logo} source={require('../../assets/music-book.jpg')}/>
                </View>
                <View style={styles.c3}>
                    <Pressable
                    onPress={() => {
                        setClickedCreate(true);
                        console.log("pressed");}}
                        //   navigation.navigate('Piano')}}
                    style={styles.wrapperCustom}>
                    <Text style={styles.analyzeText}>
                        {clickedCreate ? 'Creating Harnomy...' : 'Create Harmony'}
                    </Text>
                    </Pressable>
                    <Button title="show" onPress={() => {navigation.navigate('Piano', {notes: notes, chords: chords, screen: 'Piano'})}}/>
                </View>
            </ImageBackground>
        </View> 
    );
}

const styles = StyleSheet.create({
    background :{
        flex: 1,
        backgroundColor: "lavender",
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
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: "green",
    },
    c3 :{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
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
    wrapperCustom: {
        borderRadius: 10,
        
    },
    analyzeText: {
        borderRadius: 10,
        fontSize: 30,
        backgroundColor: 'orange',
        padding: 6,
    },
    pianoBoard : {
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    piano: {
        width: 350,
        height: 300,
    },
    backgroundPicture :{
        flex: 1,
        justifyContent: 'center',
    },
});
export default HarmonyScreen;