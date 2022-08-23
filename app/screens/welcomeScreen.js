import { StatusBar } from 'expo-status-bar';
import { Dimensions, ImageBackground, Image, StyleSheet, Text, View, Button, Touchable, Pressable } from 'react-native';
import {useState} from 'react';
import { Video } from 'expo-av';
import { getUnloadedStatus } from 'expo-av/build/AV';

const { height, width } = Dimensions.get("window");

const WelcomeScreen = ({navigation}) => {
    return (
        <View style={styles.container}>
          <Video
            source={require('../../assets/demo_notes_falling.mp4')}
            style={styles.backgroundVideo}
            rate={1}
            shouldPlay={true}
            isLooping={true}
            volume={1}
            muted={true}
            resizeMode="cover"
            />
          <View style={styles.c1}>
            <Text style={styles.titleText}>PlayIt!</Text>
            <StatusBar style="auto" />
          </View>
        
          <View style={styles.c2}>
            <Image style={styles.logo} source={require('../../assets/music-book.jpg')}/>
          </View>
      
          <View style={styles.c3}>
            <Pressable
              onPress={() => {navigation.navigate('Choose')}}
              style={styles.wrapperCustom}>
              {({ pressed }) => (
                <Text style={styles.text}>Lets go!</Text>
              )}
            </Pressable>
          </View>
        </View>
      );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lavender",
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 10,
  },
  logo: {
    width: width,
    height: height*0.5,
    borderRadius: 50
  },
  titleText: {
    fontSize: 30,
    color: "steelblue",
    fontWeight: "bold",
    position: "relative",
    paddingBottom: 20,
  },
  text: {
    borderRadius: 10,
    fontSize: 30,
    backgroundColor: 'orange',
    padding: 6,
  },
  wrapperCustom: {
    borderRadius: 10,
  },
  c1 :{
    flex: 1.15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  c2 :{
    flex: 1.75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  c3 :{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundVideo: {
    height: height + 30, 
    position: "absolute",
    top: 0,
    left: 0,
    alignItems: "stretch",
    bottom: 0,
    right: 0,
    }
});


export default WelcomeScreen;
