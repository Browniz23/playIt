import React from 'react';
import {View, Text, StyleSheet, Image, Pressable, StatusBar, Dimensions, ImageBackground} from 'react-native';
import { Video } from 'expo-av';

const { height } = Dimensions.get("window");

const ChooseScreen = ({navigation}) => {
    return (
        <View style={styles.background}>
            <ImageBackground source={require('../../assets/music_brown.jpg')} resizeMode="cover" style={styles.backgroundPicture}>
            <View style={styles.c1}>
                <View style={styles.c3}>
                <Text style={styles.text}>Get melody from image</Text>
                <Pressable
                    onPress={() => {navigation.navigate('FeaturesTabs', {initialRoute: 'Image', screen: 'Image'})}}
                    style={styles.wrapperCustom}>
                    {() => (
                        <Image style={styles.logo} source={require('../../assets/camera.png')}/>
                    )}
                </Pressable>
                </View>
                <View style={styles.c3}>
                <Text style={styles.text}>Get melody from audio</Text>
                <Pressable
                    onPress={() => {navigation.navigate('FeaturesTabs', {initialRoute: 'Sound', screen: 'Sound'})}}
                    style={styles.wrapperCustom}>
                    {() => (
                        <Image style={styles.logo} source={require('../../assets/microphone.png')}/>
                    )}
                </Pressable>
                </View>
            </View>
            <View style={styles.c3}>
                <Text style={styles.text}>{`Create Harmony from \n melody`}</Text>
                <Pressable
                    onPress={() => {navigation.navigate('FeaturesTabs', {initialRoute: 'Harmony', screen: 'Harmony'})}}
                    style={styles.wrapperCustom}>
                    {() => (
                        <Image style={styles.logo} source={require('../../assets/symphony.jpg')}/>
                    )}
                </Pressable>
            </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    background :{
        flex: 1,
        // backgroundColor: "lavender",
    },
    c1 :{
        // flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'space-evenly',
        // backgroundColor: "lavender",
        flex: 1,
        flexDirection: 'row',
    },
    c2 :{
        // flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: "green",
    },
    c3 :{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        // backgroundColor: "lavender",
        padding: 10,
    },
    logo :{
        width: 170,
        height: 170,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "purple",
        borderRadius: 170 / 2,
        borderColor: 'black',
        borderWidth: 4,
    },
    wrapperCustom: {
        borderRadius: 10,
    },
    text : {
        fontSize: 20,
        padding: 3,
        color: 'white',
        textAlign: 'center',
        alignContent: 'center',
        justifyContent: 'center'
    },
    backgroundPicture :{
        flex: 1,
        justifyContent: 'center',
    },
});
export default ChooseScreen;