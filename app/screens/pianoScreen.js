import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, Image, Pressable, ImageBackground, Dimensions, Button} from 'react-native';
import FIonicons from 'react-native-vector-icons/Feather';
import EIonicons from 'react-native-vector-icons/Entypo';
import AdIcon from 'react-native-vector-icons/AntDesign';
import FaIcon from 'react-native-vector-icons/FontAwesome';
import OcIcon from 'react-native-vector-icons/Octicons'; // somehow doesnt recognize 'dot' or 'dot-fill'
// import Frequency from 'react-native-frequency';

const { height } = Dimensions.get("window");
const { width } = Dimensions.get("window");
const teoria = require('teoria');
const BLACKS = [2,5,7,10,12,14,17,19,22,24,26,29,31,34,36,38,41,43,46,48,50,53,55,58,60,62,65,67,70,72,74,77,79,82,84,86];
var SPEED = 6;

function isBlack(note) {    
    if (BLACKS.includes(note.key()))
        return true;
    return false;
}

function getBlackSpot(note) {
    var key = note.key();
    var note_idx = BLACKS.indexOf(key);
    var prevWhiteKey = teoria.note.fromKey(key - 1).key(true);
    if (key == 86 || BLACKS[note_idx + 1] == key + 3) { // includes first black
        return -0.0143 + 0.0193 * prevWhiteKey + 0.0118;
    } else if (BLACKS[note_idx - 1] == key - 3) {
        return -0.0143 + 0.0193 * prevWhiteKey + 0.0066;
    } else {
        return -0.0143 + 0.0193 * prevWhiteKey + 0.0092;
    }
}

function playNextNote(note) {
    setIsVisibleDot(true);
    console.log(note.toString(), note.key(true));
    if (!isBlack(note)) {
        setSpot(-0.0452 + 0.0184 * note.key(true));
        setBlackWhiteSpot(0.25)
    } else {
        var s = getBlackSpot(note);
        console.log(s);
        setSpot(s);
        setBlackWhiteSpot(0.35)
    }
}

var timer = null;
var timeLeft = 0;
var timerEnd = 0;
var startNoteIdx = 0;
var n = 0;
var chordTimer = null;
var chordTimeLeft = 0;
var chordTimerEnd = 0;
var startChordIdx = 0;
var c = 0;
const PianoScreen = ({ route, navigation }) => {
    const [longPiano, setLongPiano] = useState(true);
    // spot+0.0184 , start 0.01 (c1)
    const [spot, setSpot] = useState(-0.0268);
    const [blackWhiteSpot, setBlackWhiteSpot] = useState(0.25);
    const [isVisibleDot, setIsVisibleDot] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currNoteName, setCurrNoteName] = useState('');
    const [chordSpot, setChordSpot] = useState([-0.0143,-0.0143,-0.0143,-0.0143,-0.0143]);
    const [chordBlackWhiteSpot, setChordBlackWhiteSpot] = useState([-0.0143,-0.0143,-0.0143,-0.0143,-0.0143]);
    const [isVisibleChord, setIsVisibleChord] = useState(false);
    const [currChordName, setCurrChordName] = useState('');
    const [chordNotes, setChordNotes] = useState(['','','','','']);
    const isVisibleDotRef = React.useRef(isVisibleDot);
    const isVisibleChordRef = React.useRef(isVisibleChord);
    isVisibleDotRef.current = isVisibleDot;
    isVisibleChordRef.current = isVisibleChord;
    var notes = route.params.notes;
    var chords = route.params.chords;
    // start = () => {
    //     console.log("before");
    //     Frequency.playFrequency(440, 5000);
    //     console.log("after");
    // }
    // console.log("height:", height, -0.0452*height, 0.0184*height);
    // console.log("width:", width, -0.0452*width, 0.0184*width);
    onStart = async () => {
        isPlaying ? setIsPlaying(false) : setIsPlaying(true);
        if (!isPlaying) {
            setIsPaused(false);
        }
    }
    onPause = async () => {
        setIsPaused(true);
        setIsPlaying(false);
    }
    onStop = async () => {
        setIsPaused(false);
        setIsPlaying(false);
        startNoteIdx = 0;
        timeLeft = 0

    }
    useEffect(() => {
        console.log("useEffect");
        if (isPlaying) {
            (async () => {
                for (c = startChordIdx; c < chords.length; c++) {
                    var showTime = (c == 0) ? 250 : 1000 * SPEED / chords[c-1].notes()[0].duration.value;
                    if (chordTimeLeft != 0) {
                        showTime = chordTimeLeft;
                        c = startChordIdx;
                        console.log(showTime, c);
                        startChordIdx = 0;
                        chordTimeLeft = 0;
                    }
                    await new Promise((resolve, reject) => {
                        chordTimerEnd = new Date().getTime() + showTime;
                        // console.log(chordTimerEnd-showTime, chordTimerEnd);
                        var chordNotes = chords[c].notes();
                        chordTimer = setTimeout(() => {
                            setIsVisibleChord(true);
                            console.log(chords[c].toString());
                            var notesSpots=[-0.0143,-0.0143,-0.0143,-0.0143,-0.0143];
                            var notesBlackWhiteSpots=[-0.0143,-0.0143,-0.0143,-0.0143,-0.0143];
                            // var notesNames=['', '', '', '', ''];
                            var spotsSum = 0;
                            for (var note in chordNotes) {
                                if (!isBlack(chordNotes[note])) {
                                    notesSpots[note] = -0.0143 + 0.0193 * chordNotes[note].key(true);
                                    notesBlackWhiteSpots[note] = 0.42;
                                } else {
                                    var s = getBlackSpot(chordNotes[note]);
                                    notesSpots[note] = s;
                                    notesBlackWhiteSpots[note] = 0.51;
                                }
                                spotsSum += notesSpots[note];
                                // notesNames[note] = chordNotes[note]
                            }
                            // setChordMain([chords[c].toString(), spotsSum/note+1])
                            setChordSpot(notesSpots);
                            setChordBlackWhiteSpot(notesBlackWhiteSpots);
                            setChordNotes(chords[c].simple(), ...['', '', '', '', '']);
                            console.log(chords[c].simple(), ...['', '', '', '', '']);
                            setCurrChordName(chords[c].toString());
                            resolve(); // must be inside timer
                        }, showTime);
                    });
                }
                await new Promise((resolve, reject) => {
                    setTimeout(() => {
                        // setIsVisibleDot(false);     // TODO: deal with notes collision!
                        setIsVisibleChord(false);
                        if (!isVisibleDotRef.current) {
                            console.log("ISPLAYING CHANGE AT END!")
                            setIsPlaying(false);        // TODO: deal with notes collision!
                        }
                        resolve()
                    }, !isPlaying ? 0 : SPEED / chords[c-1].notes()[0].duration.value * 1000);
                });
            })();
            (async () => {
                for (n = startNoteIdx; n < notes.length; n++) {
                    var showTime = (n == 0) ? 250 : 1000 * SPEED / notes[n-1].duration.value;
                    if (timeLeft != 0) {
                        showTime = timeLeft;
                        n = startNoteIdx;
                        console.log(showTime, n);
                        startNoteIdx = 0;
                        timeLeft = 0;
                    }
                    await new Promise((resolve, reject) => {
                        timerEnd = new Date().getTime() + showTime;
                        // console.log(timerEnd-showTime, timerEnd);
                        timer = setTimeout(() => {
                            setIsVisibleDot(true);
                            console.log(notes[n].name(), notes[n].key(true));
                            if (!isBlack(notes[n])) {
                                // setSpot(-0.0452 + 0.0184 * notes[n].key(true));
                                setSpot(-0.0143 + 0.0193 * notes[n].key(true));
                                setBlackWhiteSpot(0.42);
                                setCurrNoteName(notes[n].name());
                            } else {
                                var s = getBlackSpot(notes[n]);
                                // console.log(s);
                                setSpot(s);
                                setBlackWhiteSpot(0.51);
                                setCurrNoteName(notes[n].toString());
                            }
                            resolve(); // must be inside timer
                        }, showTime);
                    });
                }
                await new Promise((resolve, reject) => {
                    setTimeout(() => {
                        setIsVisibleDot(false);
                        if (!isVisibleChordRef.current) {
                            console.log("ISPLAYING CHANGE AT END!")
                            setIsPlaying(false);        // TODO: deal with notes collision!
                        }
                        resolve()
                    }, !isPlaying ? 0 : SPEED / notes[n-1].duration.value * 1000);
                });
            })();
        } else {
            console.log("OUT. isPlaying False");
            if (isPaused) {
                timeLeft = timerEnd - new Date().getTime();
                console.log("timeleft", timeLeft);
                startNoteIdx = n;
                chordTimeLeft = chordTimerEnd - new Date().getTime();
                console.log("ChordTimeleft", chordTimeLeft);
                startChordIdx = c;
            } else {
                setIsVisibleDot(false); 
                setIsVisibleChord(false); 
                timeLeft = 0; 
                startNoteIdx = 0;
                chordTimeLeft = 0;
                startChordIdx = 0;
            }
            clearTimeout(timer); 
            clearTimeout(chordTimer); 
        }
    }, [isPlaying, isPaused]);
    var dot = function(spot, blackWhiteSpot) {
        return {
            top: height * spot - 25,
            left: width * blackWhiteSpot - 25,
            position: "absolute", 
            borderWidth: 3,
        }
    }
    var currNote = function(spot, blackWhiteSpot) {
        return {
            top: height * spot - 25 + 15, // need fix 15 according height!
            left: width * blackWhiteSpot - 25 + 120, 
            position: "absolute", 
            fontSize: 20,
            fontWeight: 'bold',
            padding: 3,
            transform: [{ rotate: "90deg" }],
            color: "black"
        }
    }
    return (
        // <View style={styles.background}>
            <ImageBackground source={require('../../assets/music_brown.jpg')} resizeMode="cover" style={styles.backgroundPicture}>
                <ImageBackground style={longPiano ? styles.longPiano : styles.shortPiano} source={require('../../assets/long_piano_side.png')}></ImageBackground>
                {isVisibleDot && (isPlaying || isPaused) && <Text style={currNote(spot, blackWhiteSpot)}>{currNoteName}</Text>}
                {isVisibleChord && (isPlaying || isPaused) && <Text style={currNote(chordSpot[0],chordBlackWhiteSpot[0])}>{chordNotes[0]}</Text>}
                {isVisibleChord && (isPlaying || isPaused) && <Text style={currNote(chordSpot[1],chordBlackWhiteSpot[1])}>{chordNotes[1]}</Text>}
                {isVisibleChord && (isPlaying || isPaused) && <Text style={currNote(chordSpot[2],chordBlackWhiteSpot[2])}>{chordNotes[2]}</Text>}
                {isVisibleChord && (isPlaying || isPaused) && <Text style={currNote(chordSpot[3],chordBlackWhiteSpot[3])}>{chordNotes[3]}</Text>}
                {isVisibleChord && (isPlaying || isPaused) && <Text style={currNote(chordSpot[4],chordBlackWhiteSpot[4])}>{chordNotes[4]}</Text>}
                {isVisibleChord && (isPlaying || isPaused) && <Text style={styles.currChord}>{currChordName}</Text>}
                <View style={dot(spot, blackWhiteSpot)}>
                    <EIonicons name='dot-single' size={isVisibleDot && (isPlaying || isPaused) ? 50 : 0} style={styles.dot}/>    
                </View>
                <View style={dot(chordSpot[0],chordBlackWhiteSpot[0])}>
                    <EIonicons name='dot-single' size={isVisibleChord && (isPlaying || isPaused) ? 50 : 0} style={styles.chordDot}/>    
                </View>
                <View style={dot(chordSpot[1],chordBlackWhiteSpot[1])}>
                    <EIonicons name='dot-single' size={isVisibleChord && (isPlaying || isPaused) ? 50 : 0} style={styles.chordDot}/>    
                </View>
                <View style={dot(chordSpot[2],chordBlackWhiteSpot[2])}>
                    <EIonicons name='dot-single' size={isVisibleChord && (isPlaying || isPaused) ? 50 : 0} style={styles.chordDot}/>    
                </View>
                <View style={dot(chordSpot[3],chordBlackWhiteSpot[3])}>
                    <EIonicons name='dot-single' size={isVisibleChord && (isPlaying || isPaused) ? 50 : 0} style={styles.chordDot}/>    
                </View>
                <View style={dot(chordSpot[4],chordBlackWhiteSpot[4])}>
                    <EIonicons name='dot-single' size={isVisibleChord && (isPlaying || isPaused) ? 50 : 0} style={styles.chordDot}/>    
                </View>
                <Pressable
                    onPress={() => {setLongPiano(!longPiano)}}
                        style={styles.wrapperCustom}>
                        {() => (
                        longPiano ? <FIonicons name='zoom-in' size={30} style={styles.zoom}/> :
                            <FIonicons name='zoom-out' size={30} style={styles.zoom}/>
                    )}
                </Pressable>
                <View style={styles.actionButtons}>
                    <FaIcon name="stop-circle" size={50} onPress={onStop} style={styles.stop}/>
                    {(isPlaying ? <FIonicons name="pause-circle" size={45} onPress={onPause} style={styles.play}/> : 
                        <AdIcon name="play" size={45} onPress={onStart} style={styles.play}/>)}
                </View>
                {/* <Button title="start" onPress={start}/> */}
            </ImageBackground>
        // </View> 
    );
}

const styles = StyleSheet.create({
    wrapperCustom: {
        // width: 30,
        // height: 30,
        // direction: "ltr",
        position: 'absolute',
        top: 60,
        left: 40,
        color: "steelblue",
    },
    longPiano: {
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        height: height,
        width: width * 0.7,
        // width: width * 0.5,
    },
    shortPiano: {
        width: width * 1.3,
        height: height,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backgroundPicture :{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
    },
    text : {
        fontSize: 20,
        padding: 3,
        transform: [{ rotate: "90deg" }]
    },
    zoom: {
        color: "steelblue",
        transform: [{ rotate: "90deg" }]
    },
    play: {
        transform: [{ rotate: "90deg" }],
        // position: 'absolute',
        // top: height * 0.5,
        // right: width * 0.2,
        color: "steelblue",
        padding: 5,
    },
    stop: {
        transform: [{ rotate: "90deg" }],
        // position: 'absolute',
        // top: height * 0.4,
        // right: width * 0.2,
        color: "steelblue",
        padding: 5,
    },
    dot: {
        color: "orange",
    },
    chordDot: {
        color: "purple",
    },
    actionButtons: {
        borderWidth: 2,
        alignContent: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: height * 0.4,
        left: width * 0.15,
    },
    currChord: {
            top: height * 0.45,
            left: width * 0.3, 
            position: "absolute", 
            fontSize: 23,
            fontWeight: 'bold',
            padding: 3,
            transform: [{ rotate: "90deg" }],
            color: "red"
    }
});
export default PianoScreen;
