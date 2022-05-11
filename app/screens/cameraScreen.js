import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, Image, Button, Platform, Pressable, ImageBackground} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AdIcon from 'react-native-vector-icons/AntDesign';
import MCiIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FaIcon from 'react-native-vector-icons/FontAwesome';

const CameraScreen = (props) => {
    const [image, setImage] = useState(null);
    const [clickedAnalyze, setClickedAnalyze] = useState(false);
    useEffect(() => {
        (async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            }
          }
        })();
    }, []);
    const pickGallery = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });    
        if (!result.cancelled) {
          setImage(result.uri);
        }
      };
    const pickCamera = async () => {
        let result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
        if (!result.cancelled) {
          setImage(result.uri);
        }
      };

    return (
        <View style={styles.background}>
          <ImageBackground source={require('../../assets/music_brown.jpg')} resizeMode="cover" style={styles.backgroundPicture}>
            <View style={styles.c2}>
              <Image style={styles.logo} source={require('../../assets/camera.png')}/>
              <View style={styles.c1}>
                <View style={styles.c2}>
                  <Text style={styles.text}>Take a picture</Text>
                  <MCiIcon name="camera" size={50} onPress={pickCamera}/>
                </View>  
                <View style={styles.c2}>
                  <Text style={styles.text}>Choose image file</Text>
                  <FaIcon name="file-image-o" color="black" size={50} onPress={pickGallery}/>
                </View>
              </View>
              {image && <Image source={{ uri: image }} style={{ width: 100, height: 100 }} />}
              <Pressable
                onPress={() => {setClickedAnalyze(true); console.log("pressed")}}
                style={styles.wrapperCustom}>
                <Text style={styles.analyzeText}>
                  {clickedAnalyze ? 'Analyzing...' : 'Analyze'}
                </Text>
              </Pressable>
            </View>
          </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    background :{
        flex: 1,
        backgroundColor: "lavender"
    },
    text : {
      fontSize: 20,
      padding: 3,
    },
    c1 :{
        // flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'space-evenly',
        // backgroundColor: "blue",
        flexDirection: 'row',
    },
    c2 :{
        // flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: "green",
        padding: 8
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
    wrapperCustom: {
      borderRadius: 10,
    },
    analyzeText: {
      borderRadius: 10,
      fontSize: 30,
      backgroundColor: 'orange',
      padding: 6,
    },
    backgroundPicture :{
      flex: 1,
      justifyContent: 'center',
    },
});
export default CameraScreen;