import React from 'react';
import {View, Text, StyleSheet, Image, Button, ToastAndroid, Pressable, ImageBackground} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import AdIcon from 'react-native-vector-icons/AntDesign';
import MCiIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FaIcon from 'react-native-vector-icons/FontAwesome';

const SoundScreen = (props) => {
    const [recording, setRecording] = React.useState();
    const recRef = React.useRef(recording);
    // const setRecRef = React.useRef(setRecording);
    const [isUploaded, setIsUploaded] = React.useState(false);
    const [soundUri, setSoundUri] = React.useState(null);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const isPlayRef = React.useRef(isPlaying);
    const [audioPlayer, setAudioPlayer] = React.useState(new Audio.Sound());
    const audioRef = React.useRef(audioPlayer);
    const [playerStatus, setPlayerStatus] = React.useState();
    const [clickedAnalyze, setClickedAnalyze] = React.useState(false);

    recRef.current = recording;
    isPlayRef.current = isPlaying;
    audioRef.current = audioPlayer;

    async function startRecording() {
        try {
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
            ToastAndroid.show('Recording started', ToastAndroid.SHORT);
        } catch (err) {
            console.error('Failed to start recording', err);
        }
        setIsUploaded(undefined)
        // this function will be fired when you leave the page
    }

    async function stopRecording() {
        if (recording) {
            console.log('Stopping recording..');
            setRecording(undefined);                    // todo: order here is not peoblem?!?!
            await recording.stopAndUnloadAsync();
            setSoundUri(recording.getURI());
            console.log('Recording stopped and stored at', soundUri);
            ToastAndroid.show('Recording stopped', ToastAndroid.SHORT);
            if (soundUri) {
                console.log("yes indeed wee")
                ToastAndroid.show('Stored at: ',soundUri, ToastAndroid.SHORT);
            }
            setIsUploaded(true)
        }
    }
    
    pickAudio = async () => {
        let options = {
        type:["audio/mpeg"]
        }
        let result = await DocumentPicker.getDocumentAsync(options);
        console.log(result);
        if (result.type != "cancel") {
            setSoundUri(result.uri);
            setIsUploaded(true)
        }
    }

    playAudio = async () => {
        if (playerStatus && playerStatus.isLoaded){
            try {
                await audioPlayer.stopAsync();
                await audioPlayer.unloadAsync();
            } catch {
                console.log("i dunno why, but he thinks he is not loaded <?>")
            }
        }
        await audioPlayer.loadAsync({ uri: soundUri }, {}, true);
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

    handleRec = async () => {
        if (!recording) {
            if (isPlaying)
                stopAudio();
            startRecording();
        }
        else
            stopRecording();
    };

    handleLibrary = async () => {
        console.log("play:",isPlayRef, isPlaying);
        if (isPlaying)
            stopAudio();
        pickAudio();
    }
    React.useEffect(() => {
        // this function will be fired when you leave the page
        console.log("OUT!");
        return ()=>{
            console.log("IN!", recRef.current?false:true, isPlayRef.current);
            // audioPlayer && audioPlayer.unloadAsync();
            console.log(recRef.current);
            if (recRef.current) {
                console.log(true);
                // setRecRef.current(undefined);                    // todo: order here is not peoblem?!?!
                recRef.current.stopAndUnloadAsync();
            }
            if (isPlayRef.current) {
                audioRef.current.unloadAsync();
                setIsPlaying(false);
                console.log(isPlayRef);
            }
        }
    }, []);
    return (
        <View style={styles.background}>
            <ImageBackground source={require('../../assets/music_brown.jpg')} resizeMode="cover" style={styles.backgroundPicture}>
                <View style={styles.c2}>
                    <View style={styles.c4}>
                        <Image style={styles.logo} source={require('../../assets/microphone.png')}/>
                    </View>
                    <View style={styles.c4}>
                        <View style={styles.c1}>
                            <View style={styles.c2}>
                                <Text style={styles.text}>Record a melody</Text>
                                {recording ? 
                                    <MCiIcon name="stop-circle-outline" color="brown" size={50} onPress={handleRec}/> :
                                    <MCiIcon name="record-circle-outline" color="brown" size={50} onPress={handleRec}/>}
                            </View>        
                            <View style={styles.c2}>
                                <Text style={styles.text}>Choose audio file</Text>
                                <FaIcon name="file-audio-o" color="orange" size={50} onPress={handleLibrary}/>
                            </View>
                        </View>
                        {isUploaded && (isPlaying ? <Text style={styles.text}>Stop</Text> : <Text style={styles.text}>Play</Text>)}
                        {isUploaded && (isPlaying ? <FaIcon name="stop" size={50} onPress={stopAudio}/> :
                        <AdIcon name="play" size={50} onPress={playAudio}/>)}
                        <Pressable
                            onPress={() => {setClickedAnalyze(true); console.log("pressed")}}
                            style={styles.wrapperCustom}>
                            <Text style={styles.analyzeText}>
                                {clickedAnalyze ? 'Analyzing...' : 'Analyze'}
                            </Text>
                        </Pressable>
                    </View>
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
        flexDirection: 'row',
    },
    c2 :{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        // backgroundColor: "green",
        padding: 10,
    },
    c3 :{
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: "navy",
        padding: 10,
    },
    c4: {
        // flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: "green",
        padding: 10,
        borderWidth: 10,
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
export default SoundScreen;