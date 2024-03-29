import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, Image, Button, Platform, Pressable, ImageBackground, Alert, ActivityIndicator, Modal} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AdIcon from 'react-native-vector-icons/AntDesign';
import MCiIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FaIcon from 'react-native-vector-icons/FontAwesome';
import * as ExpoFileSystem from 'expo-file-system'

const teoria = require('teoria');

// fetch with given timeout function
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 5000 } = options;
  const abortController = new AbortController();
  const id = setTimeout(() => abortController.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: abortController.signal  
  });
  clearTimeout(id);
  return response;
}

const CameraScreen = ({navigation}) => {

    // state variables
    const [image, setImage] = useState(null);
    const [clickedAnalyze, setClickedAnalyze] = useState(false);
    const [dots, setDots] = useState("   ");
    const [modalVisible, setModalVisible] = useState(false);
    const [notes, setNotes] = useState(null);

    // permissions - first time
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

    // pick image from library
    const pickGallery = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          // aspect: [4, 3], 
          quality: 1,
        });    
        if (!result.cancelled) {
          setImage(result);
        }
      };

    // get image from device camera
    const pickCamera = async () => {
        let result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          // aspect: [4, 3],
          quality: 1,
        });
        if (!result.cancelled) {
          setImage(result);
        }
      };

    // send image to server to perform analyze and get result
    const sendImage = async () => {
      splitedUri = image.uri.split(".") 
      const formdata = new FormData();
      formdata.append('file', {
        uri: image.uri,
        type: 'image/jpeg',
        name: 'imageFile'+'.'+splitedUri[splitedUri.length - 1],  
        extension: image.uri.split(".")[1]})  // not sure needed (maybe keep in comment)

      // await fetchWithTimeout('http://192.168.1.100:3000/insertImage', { // for phone lan ipv4 make sure phone wifi!
      // await fetchWithTimeout('https://vy1c5yyy63.execute-api.us-east-1.amazonaws.com/secondAttempt/{proxy+}', {
      await fetchWithTimeout('http://192.168.56.1:3000/insertImage', { // emulator
        timeout: 30000, // 30 sec timeout
        method: 'POST',
        headers: {
            "X-Requested-With": "XMLHttpRequest",  // same with or without?
        //     // Accept: 'multipart/form-data',  //needed?       those 2 make network prob?!
            'Content-Type': 'multipart/form-data'  // VERY IMPORTANT IN FLASK WAS IN COMMENT!!! but seems to work at first in aws.
        //   'name': 'AudioFile'+'.'+splitedUri[splitedUri.length - 1],    // ADDED TO TRY SEE FOR WAV
        },
        body: formdata,
      })
      .then(resp => resp.json())
      .then(notes => {
        console.log(notes);
        console.log("printed when returned (can take a while)");
        var notesList = []
        for (var i = 0; i < notes['notes'].length; i++) {
            var name = teoria.note.fromKey(Number(notes['notes'][i][0])).toString()
            var durr = 8 * Number(notes['notes'][i][1]) // in 200 millisec units ('2'-> 400 ms) + mult 4 for normal speed
            notesList.push(teoria.note(name, { value: durr }));
        }
        for (i = 0; i < notesList.length; i++) {
            console.log(notesList[i].toString(), notesList[i].duration.value);
        }
        setNotes(notesList)  
        setClickedAnalyze(false);
      })
      .catch(err => {
        if (err.name === 'AbortError') {
            console.log("server problem")      
            Alert.alert('Connection problem', 'We having trouble access our servers, please try again later',
            [{ text: 'OK', onPress: () => console.log('OK Pressed') }]); 
        } else {
            console.log("error occured", err)
            Alert.alert('Problem', 'some problem occured, please try again',
            [{ text: 'OK', onPress: () => console.log('OK Pressed') }]); 
        }
        setClickedAnalyze(false);
      });
    };

    // analyzing dots update
    useEffect(() => {
      (async () => {
        if (clickedAnalyze || dots != "   ") {
          setTimeout(() => {
            if (dots == "   ")
              setDots(".  ")
            else if (dots == ".  ")
              setDots(".. ")
            else if (dots == ".. ")
              setDots("...")
            else
              setDots("   ")
          }, 200)
        }
      })();
    }, [dots]);

    // actual view
    return (
        <View style={styles.background}>
          <ImageBackground source={require('../../assets/music_brown.jpg')} resizeMode="cover" style={styles.backgroundPicture}>
            <View style={styles.c2}>
              <Pressable
                  onPress={() => setModalVisible(!modalVisible)}
                  style={styles.wrapperCustom}>
                  {() => (
                      <Image style={styles.logo} source={require('../../assets/camera.png')}/>
                  )}
              </Pressable>
              <Modal
                  animationType="fade"
                  transparent={true}
                  visible={modalVisible}
                  onRequestClose={() => {setModalVisible(!modalVisible);}}>
                  <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Image feature!{'\n\n'}Upload an image of sheet music.{'\n\n'}Tips for better accuracy:{'\n\n'}* Use a high quality image.{'\n'}* Use a clear and direct picture.{'\n\n'}Our algorithm will analyze your image and detect the notes.</Text>
                        <Pressable
                        style={[styles.button, styles.buttonClose]}
                        onPress={() => setModalVisible(!modalVisible)}
                        >
                        <Text style={styles.textStyle}>Hide info</Text>
                        </Pressable>
                    </View>
                  </View>
              </Modal>
              <View style={styles.c1}>
                <View style={styles.c22}>
                  <Text style={styles.text}>Take a{'\n'}picture</Text>
                  <MCiIcon name="camera" size={50} onPress={pickCamera}/>
                </View>  
                <View style={styles.c22}>
                  <Text style={styles.text}>Choose image{'\n'}file</Text>
                  <FaIcon name="file-image-o" color="black" size={50} onPress={pickGallery}/>
                </View>
              </View>
              {image && <Image source={{ uri: image.uri }} style={styles.chosenPic}/>}
              {image && <Pressable
                onPress={() => {
                  if (!clickedAnalyze) {
                    setClickedAnalyze(true);
                    setDots(".  ");
                    sendImage();
                    console.log("pressed")}}
                  }
                style={styles.wrapperCustom}>
                <Text style={styles.analyzeText}>
                  {clickedAnalyze ? 'Analyzing'+dots : 'Analyze'}
                </Text>
              </Pressable>}
              {clickedAnalyze && <ActivityIndicator size="large" color="#00ff00" />}
              {!clickedAnalyze && notes && <Button title="show" onPress={() => {navigation.navigate('Piano', {notes: notes, chords: [], screen: 'Piano'})}}/>}
            </View>
          </ImageBackground>
        </View>
    );
}

// styles
const styles = StyleSheet.create({
    background :{
        flex: 1,
        backgroundColor: "lavender"
    },
    text : {
      fontSize: 20,
      padding: 3,
      flexShrink: 1,
      textAlign: 'center',
      justifyContent: 'center'
    },
    c1 :{
        // flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'space-evenly',
        // backgroundColor: "blue",
        flexDirection: 'row',
        borderColor: 'black',
        // borderWidth: 3,
        borderRadius: 10
    },
    c2 :{
        // flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        // backgroundColor: "green",
        padding: 10,
        margin: 1,
        // borderColor: 'black',
        // borderWidth: 3
    },
    c22: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-around',
      // backgroundColor: "green",
      padding: 10,
      margin: 2,
      // borderColor: 'black',
      // borderWidth: 3
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
      margin: 6,
    },
    backgroundPicture :{
      flex: 1,
      justifyContent: 'center',
    },
    chosenPic: {
      width: 100,
      height: 100,
      borderWidth: 3,
      borderRadius: 20,
      // paddingVertical: 5,
      borderColor: 'black',
      margin: 2,
    },
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 22
    },
    modalView: {
      margin: 20,
      backgroundColor: "#008B8B",
      borderRadius: 20,
      padding: 35,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5
    },
    button: {
      borderRadius: 20,
      padding: 10,
      elevation: 2
    },
    buttonOpen: {
      backgroundColor: "#F194FF",
    },
    buttonClose: {
      backgroundColor: "#4682B4",
    },
    textStyle: {
      fontSize: 15,
      color: "white",
      fontWeight: "bold",
      textAlign: "center"
    },
    modalText: {
      fontSize: 20,
      marginBottom: 15,
      textAlign: "center"
    }
});
export default CameraScreen;