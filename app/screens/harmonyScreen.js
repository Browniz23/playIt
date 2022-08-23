import React, { useState } from 'react';
import {View, Text, StyleSheet, Image, Pressable, Button, ImageBackground, Alert, ActivityIndicator, Modal} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import CameraScreen from './cameraScreen';
import SoundScreen from './soundScreen';
import {Ionicons} from 'react-native-vector-icons';
import Fa5Icon from 'react-native-vector-icons/FontAwesome5';
// import RNFetchBlob from 'react-native-fetch-blob'
// import { readRemoteFile } from 'react-native-csv';
import * as DocumentPicker from 'expo-document-picker';
import Papa from "papaparse";
import * as ExpoFileSystem from 'expo-file-system'


// const csvToJson = require('convert-csv-to-json');
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

const HarmonyScreen = ({navigation}) => {
    
    // notes and chords for example show
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
    var ch1 = teoria.chord('g7',6); var ch2 = teoria.chord('a7',5); var ch3 = teoria.chord('c',5); var ch4 = teoria.chord('f',6);
    var chords = [ch1, ch2, ch3, ch4];
    notes = [] // show only chords

    // state variables
    const [clickedCreate, setClickedCreate] = useState(false);
    const [melodyData, setMelodyData] = useState('none');
    const [isUploaded, setIsUploaded] = React.useState(false);
    const [dots, setDots] = React.useState("   ");
    const [chordList, setChordList] = React.useState(null); // only for easy checking
    const [modalVisible, setModalVisible] = useState(false);
    const [csvDoc, setCsvDoc] = useState(null);

    // get CSV file from library
    pickCSV = async () => {
        let options = {
        type:["text/comma-separated-values", 'text/csv'] 
        }
        let result = await DocumentPicker.getDocumentAsync(options);
        console.log(result); 
        
        if (result.type != "cancel") {
            setIsUploaded(true);
            const fileContent = await ExpoFileSystem.readAsStringAsync(result.uri);
            console.log(fileContent);
            setMelodyData(fileContent);
            setCsvDoc(result)
        }
    }

    // send csv to server to perform analyze and get chords list as result
    const insertData = async () => {
        // sending CSV data only
        // await fetchWithTimeout('http://192.168.1.231:3000/insertCSV', { 
        // await fetchWithTimeout('https://w15y28voif.execute-api.us-east-1.amazonaws.com/thirdAttempt/{proxy+}', {
        //     timeout: 30000, // 30 sec timeout
        //     method: 'POST',
        //     headers: {
        //         Accept: 'application/json',
        //         'Content-Type': 'application/json'  // I added this line
        //     },
        //     body: JSON.stringify({melodyData : melodyData}),
        // }) 

        // sending entire CSV file (for aws compatability)
        splitedUri = csvDoc.uri.split(".") 
        const formdata = new FormData();
        formdata.append('file', {
        uri: csvDoc.uri,
        type: 'text/comma-separated-values', 
        name: 'csvFile'+'.'+splitedUri[splitedUri.length - 1],  
        extension: csvDoc.uri.split(".")[1]})  // not sure needed (maybe keep in comment)
        // await fetchWithTimeout('https://w15y28voif.execute-api.us-east-1.amazonaws.com/thirdAttempt/{proxy+}', {
        // await fetchWithTimeout('http://192.168.1.100:3000/insertCSV', { //wifi
        await fetchWithTimeout('http://192.168.56.1:3000/insertCSV', { // emulator
            timeout: 30000, // 30 sec timeout
            method: 'POST',
            headers: {
                "X-Requested-With": "XMLHttpRequest",  
                'Content-Type': 'multipart/form-data'  
            },
            body: formdata,
        })
        .then(resp => resp.json())
        .then(d => {
            console.log("printed when returned (can take a while)");
            var chordList = []
            for (var i = 0; i < d['chords'].length; i++) {
                var name = d['chords'][i];
                var octave = 3;
                chordList.push(teoria.chord(name, octave));
            }
            for (i = 0; i < chordList.length; i++) {
                console.log(chordList[i].name, chordList[i].toString());
            }
            setChordList(chordList);
            setClickedCreate(false);
        })
        .catch(err => {
            if (err.name === 'AbortError') {
                console.log("server problem")      
                Alert.alert('Connection problem', 'We having trouble access our servers, please try again later',
                [{ text: 'OK', onPress: () => console.log('OK Pressed') }]); 
            } else {
                console.log("error occured", err)
                Alert.alert('Problem', 'some problem occured, please make sure appropriate csv format',
                [{ text: 'OK', onPress: () => console.log('OK Pressed') }]); 
            }
            setClickedCreate(false);
        })
    }

    // analyzing dots update
    React.useEffect(() => {
        (async () => {
          if (clickedCreate || dots != "   ") {
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
                            <Image style={styles.logo} source={require('../../assets/symphony.jpg')}/>
                        )}
                    </Pressable>
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => {setModalVisible(!modalVisible);}}>
                        <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalText}>Harmony feature!{'\n\n'}Upload a CSV file which contains a melody in the following format:{'\n\n'}measure, note_root, note_octave, note_duration.{'\n\n'} Our algorithm will analyze your melody and find nice fitting chords {':)'}</Text>
                            <Pressable
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalVisible(!modalVisible)}
                            >
                            <Text style={styles.textStyle}>Hide info</Text>
                            </Pressable>
                        </View>
                        </View>
                    </Modal>
                <View style={styles.c3}>
                    <Text style={styles.text}>Upload melody as CSV</Text>
                    <Fa5Icon name="file-csv" color="green" size={60} onPress={pickCSV}/>
                    {isUploaded && <Pressable
                    onPress={() => {
                        if (!clickedCreate) {
                            setDots(".  ");
                            setClickedCreate(true);
                            insertData();
                            console.log("pressed!");}}
                        }
                    style={styles.wrapperCustom}>
                    <Text style={styles.analyzeText}>
                        {clickedCreate ? 'Creating Harnomy'+dots : 'Create Harmony'}
                    </Text>
                    </Pressable>}
                    {clickedCreate && <ActivityIndicator size="large" color="#00ff00" />}
                    {!clickedCreate && chordList && <Button title="show" onPress={() => {navigation.navigate('Piano', {notes: notes, chords: chordList, screen: 'Piano'})}}/>}
                </View>
                </View>
            </ImageBackground>
        </View> 
    );
}

// styles
const styles = StyleSheet.create({
    background :{
        flex: 1,
        backgroundColor: "lavender",
    },
    c1 :{
        alignItems: 'flex-end',
        justifyContent: 'space-evenly',
        backgroundColor: "blue",
        flex: 1,
        flexDirection: 'row',
    },
    c2 :{
         alignItems: 'center',
         justifyContent: 'space-around',
         padding: 10,
         margin: 1,
         // borderWidth: 3
    },
    c3 :{
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: 10,
        margin: 2,
        // borderWidth: 3
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
    text : {
        fontSize: 23,
        padding: 3,
        flexShrink: 1,
        textAlign: 'center',
        justifyContent: 'center',
        margin: 5,
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
export default HarmonyScreen;