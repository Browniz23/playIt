import React, { useState } from 'react';
import {View, Text, StyleSheet, Image, Pressable, Button, ImageBackground, Alert, ActivityIndicator} from 'react-native';
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
    const [melodyData, setMelodyData] = useState('none');
    const [isUploaded, setIsUploaded] = React.useState(false);
    const [dots, setDots] = React.useState("   ");
    const [chordList, setChordList] = React.useState(null);

    pickCSV = async () => {
        let options = {
        type:["text/comma-separated-values", 'text/csv'] // maybe only for android. ios maybe text/csv
        }
        let result = await DocumentPicker.getDocumentAsync(options);
        console.log(result); 
        
        if (result.type != "cancel") {
            setIsUploaded(true);
            const fileContent = await ExpoFileSystem.readAsStringAsync(result.uri);
            console.log(fileContent);
            // const content = JSON.parse(fileContent);
            setMelodyData(fileContent);
        }
    }

    const getData = () => {  // need ip of virtualBox ipv4
        // fetch('http://192.168.56.1:3000/get', {
        fetch('http://192.168.1.231:3000/get', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'  // I added this line
            }
        })
        .then(resp => resp.json())
        .then(d => {
            console.log(d['data']);
            setMelodyData(d.data);
        })
        .catch(err => console.log(err))
    }

    const insertData = async () => {  // need ip of virtualBox ipv4 for emulator
        // fetch('http://192.168.56.1:3000/insert', { //for emulator   
        await fetchWithTimeout('http://192.168.1.231:3000/insert', { // for phone lan ipv4 make sure phone wifi!
            timeout: 2000, // 10 sec timeout, maybe need more
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'  // I added this line
            },
            body: JSON.stringify({melodyData : melodyData}),
            // body: checkingData
        }) 
        .then(resp => resp.json())
        .then(d => {
            console.log("printed when returned (can take a while)");
            // console.log(d);
            var chordList = []
            for (var i = 0; i < d['chords'].length; i++) {
                var name = d['chords'][i][0];
                var octave = d['chords'][i][1];
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
    return (
        <View style={styles.background}>
            <ImageBackground source={require('../../assets/music_brown.jpg')} resizeMode="cover" style={styles.backgroundPicture}>
                <View style={styles.c2}>
                    <Image style={styles.logo} source={require('../../assets/music-book.jpg')}/>
                <View style={styles.c3}>
                    <Text style={styles.text}>Upload melody as CSV</Text>
                    <Fa5Icon name="file-csv" color="green" size={60} onPress={pickCSV}/>
                    {/* <Pressable
                    onPress={() => {
                        pickCSV();}}
                    style={styles.wrapperCustom}>
                    <Text style={styles.analyzeText}>
                        Upload melody as CSV
                    </Text>
                    </Pressable> */}
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
                    {!clickedCreate && chordList && <Button title="show" onPress={() => {navigation.navigate('Piano', {notes: notes, chords: chords, screen: 'Piano'})}}/>}
                </View>
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
        // flex: 1,
        // alignItems: 'center',
        // justifyContent: 'center',
        // // backgroundColor: "green",

         // flex: 1,
         alignItems: 'center',
         justifyContent: 'space-around',
         // backgroundColor: "green",
         padding: 10,
         margin: 1,
         // borderColor: 'black',
         // borderWidth: 3
    },
    c3 :{
        // flex: 1,
        // alignItems: 'center',
        // justifyContent: 'flex-start',
        // padding: 10,

        // flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        // backgroundColor: "green",
        padding: 10,
        margin: 2,
        // borderColor: 'black',
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
    text : {
        fontSize: 23,
        padding: 3,
        flexShrink: 1,
        textAlign: 'center',
        justifyContent: 'center',
        margin: 5,
    },
});
export default HarmonyScreen;