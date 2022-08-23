import React from 'react';
import {View, Text, StyleSheet, Image, Button, Platform, ToastAndroid, Pressable, ImageBackground, Alert, ActivityIndicator, Modal} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import AdIcon from 'react-native-vector-icons/AntDesign';
import MCiIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FaIcon from 'react-native-vector-icons/FontAwesome';

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

const SoundScreen = ({navigation}) => {

    // state & ref variables
    const [recording, setRecording] = React.useState(); 
    const recRef = React.useRef(recording);
    const [isUploaded, setIsUploaded] = React.useState(false);
    const [soundUri, setSoundUri] = React.useState(null);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const isPlayRef = React.useRef(isPlaying);
    const [audioPlayer, setAudioPlayer] = React.useState(new Audio.Sound());
    const audioRef = React.useRef(audioPlayer);
    const [playerStatus, setPlayerStatus] = React.useState();
    const [clickedAnalyze, setClickedAnalyze] = React.useState(false);
    const [dots, setDots] = React.useState("   ");
    const [notes, setNotes] = React.useState(null);
    const [modalVisible, setModalVisible] = React.useState(false);

    recRef.current = recording;
    isPlayRef.current = isPlaying;
    audioRef.current = audioPlayer;

    // recording start
    async function startRecording() {
        try {
            setSoundUri(null); // added and helped prevent second time abort
            console.log('Requesting permissions..');
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            }); 
            console.log('Starting recording..');
            const { recording } = await Audio.Recording.createAsync(
                Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
            setRecording(recording);
            console.log('Recording started');
            if (Platform.OS !== 'ios')
                ToastAndroid.show('Recording started', ToastAndroid.SHORT);
        } catch (err) {
            console.error('Failed to start recording', err);
        }
        setIsUploaded(undefined)
    }

    // recording stop
    async function stopRecording() {
        try {
            if (recording) {
                console.log('Stopping recording..');
                await recording.stopAndUnloadAsync(); 
                setSoundUri(recording.getURI());
                setRecording(undefined);                    
                console.log('Recording stopped and stored at', soundUri);
                if (Platform.OS !== 'ios')
                    ToastAndroid.show('Recording stopped', ToastAndroid.SHORT);
                if (soundUri) {
                    console.log("yes indeed wee")
                    if (Platform.OS !== 'ios')
                        ToastAndroid.show('Stored at: ',soundUri, ToastAndroid.SHORT);
                }
                setIsUploaded(true);
            }   
        } catch (error) {
            console.log("ERROR CAUGHT")
        }
    }
    
    // getting audio from library
    pickAudio = async () => {
        let options = {
        type:["audio/mpeg", "audio/ogg", "audio/wav", "audio/x-wav", "audio/vnd.wav", "audio/*"]
        }
        let result = await DocumentPicker.getDocumentAsync(options);
        console.log(result);
        if (result.type != "cancel") {
            setSoundUri(result.uri);
            setIsUploaded(true)
        }
    }

    // playing uploaded audio
    playAudio = async () => {
        if (playerStatus && playerStatus.isLoaded){
            try {
                await audioPlayer.stopAsync();
                await audioPlayer.unloadAsync();
            } catch {
                console.log("i dunno why, but he thinks he is not loaded <?>")
            }
        }
        await audioPlayer.loadAsync({uri: soundUri}, {}, true);
        const stat = await audioPlayer.getStatusAsync()
        setPlayerStatus(stat);
        if (stat.isLoaded) {
            if (stat.isPlaying === false) {
            audioPlayer.playAsync();
            setIsPlaying(true)
            }
        }
        // set for audioPlayer contains setting setOnPlaybackStatusUpdate.
        setAudioPlayer( (() => {
            var myAudio = audioPlayer;
            console.log("HOW MANY TIMES?!?!?!")
            myAudio.setOnPlaybackStatusUpdate((playerStatus) => {                
                console.log("again")
                if (playerStatus.isPlaying === true)
                    setIsPlaying(true);
                else
                    setIsPlaying(false);
            });
            return myAudio;
        })());
    }

    // stopping audio play
    stopAudio = async () => {
        const stat = await audioPlayer.getStatusAsync()
        setPlayerStatus(stat);
        // if song is playing then stop it
        if (stat.isLoaded) {
            if (stat.isPlaying === true) {
                await audioPlayer.unloadAsync();
                setIsPlaying(false)
            }
        }
        else
            console.log("need to stop when not playing??")
    }

    // handle recording button click
    handleRec = async () => {
        if (!recording) {
            if (isPlaying)
                stopAudio();
            startRecording();
        }
        else
            stopRecording();
    };

    // handle library button click
    handleLibrary = async () => {
        console.log("play:",isPlayRef, isPlaying);
        if (isPlaying)
            stopAudio();
        pickAudio();
    }

    // send audio to server to perform analyze and get notes list as result
    const sendAudio = async () => {
        splitedUri = soundUri.split(".")
        const formdata = new FormData();
        formdata.append('file', {
          uri: soundUri,
        //   type: 'audio/*',
          type: 'audio/acc',
          name: 'AudioFile'+'.'+splitedUri[splitedUri.length - 1],
          extension: soundUri.split(".")[1]})  
        console.log(soundUri.split(".")[1]);
        await fetchWithTimeout('https://o5d9cl8ib7.execute-api.us-east-1.amazonaws.com/firstAttempt/{proxy+}', {
            timeout: 30000, // 30 sec timeout, maybe need more
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
                var durr = Number(notes['notes'][i][1]) // in 200 millisec units ('2'-> 400 ms)
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
        })
    };

    // cleanup function
    React.useEffect(() => {
        console.log("OUT!");
        return ()=>{
            console.log("IN!", recRef.current?false:true, isPlayRef.current);
            console.log(recRef.current);
            if (recRef.current) {
                console.log(true);
                recRef.current.stopAndUnloadAsync();
            }
            if (isPlayRef.current) {
                audioRef.current.unloadAsync();
                setIsPlaying(false);
                console.log(isPlayRef);
            }
        }
    }, []);

    // analyzing dots update
    React.useEffect(() => {
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
                    <View style={styles.c4}>
                        <Pressable
                            onPress={() => setModalVisible(!modalVisible)}
                            style={styles.wrapperCustom}>
                            {() => (
                                <Image style={styles.logo} source={require('../../assets/microphone.png')}/>
                            )}
                        </Pressable>
                        <Modal
                            animationType="fade"
                            transparent={true}
                            visible={modalVisible}
                            onRequestClose={() => {setModalVisible(!modalVisible);}}>
                            <View style={styles.centeredView}>
                                <View style={styles.modalView}>
                                    <Text style={styles.modalText}>Sound feature!{'\n\n'}Upload an audio file of a melody, without harmony.{'\n\n'}Tips for better accuracy:{'\n\n'}* Record in a quiet room.{'\n'}* Use an accurate non-harmonized tool {'('}for example, an Organ is better than a piano{').'}{'\n'}* Press each note separately.{'\n\n'} Our algorithm will analyze the file and detect the melody notes.</Text>
                                    <Pressable
                                    style={[styles.button, styles.buttonClose]}
                                    onPress={() => setModalVisible(!modalVisible)}
                                    >
                                    <Text style={styles.textStyle}>Hide info</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </Modal>
                    </View>
                    <View style={styles.c1}>
                        <View style={styles.c22}>
                            <Text style={styles.text}>Record a{'\n'}melody</Text>
                            {recording ? 
                                <MCiIcon name="stop-circle-outline" color="brown" size={50} onPress={handleRec}/> :
                                <MCiIcon name="record-circle-outline" color="brown" size={50} onPress={handleRec}/>}
                        </View>        
                        <View style={styles.c22}>
                            <Text style={styles.text}>Choose audio{'\n'}file</Text>
                            <FaIcon name="file-audio-o" color="orange" size={50} onPress={handleLibrary}/>
                        </View>
                    </View>
                    {isUploaded && (isPlaying ? <Text style={styles.text}>Stop</Text> : <Text style={styles.text}>Play</Text>)}
                    {isUploaded && (isPlaying ? <FaIcon name="stop" size={50} onPress={stopAudio}/> :
                    <AdIcon name="play" size={50} onPress={playAudio}/>)}
                    {isUploaded && <Pressable
                        onPress={() => {
                            if (!clickedAnalyze) {
                                setClickedAnalyze(true);
                                setDots(".  ");
                                sendAudio();
                                console.log("pressed")}}
                            }
                        style={styles.wrapperCustom}>
                        <Text style={styles.analyzeText}>
                            {clickedAnalyze ? 'Analyzing'+dots : 'Analyze'}
                        </Text>
                    </Pressable> }
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
        alignItems: 'flex-end',
        justifyContent: 'space-evenly',
        flexDirection: 'row',
        // borderWidth: 3
    },
    c2 :{
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: 10,
        margin: 1,
        marginRight: 10,
        marginLeft: 10,
        // borderWidth: 3
    },
    c22 :{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: 10,
        margin: 2,
        // borderWidth: 3
    },
    c3 :{
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    c4: {
        alignItems: 'center',
        justifyContent: 'center',
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
        margin: 5
    },
    backgroundPicture :{
        flex: 1,
        justifyContent: 'center',
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
export default SoundScreen;