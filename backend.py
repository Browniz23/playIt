import base64
import json
from time import sleep
from flask import Flask, jsonify, render_template, request
from sklearn.metrics import consensus_score
import os
from fft import *
app = Flask(__name__)

upload_path = os.path.join(os.getcwd(), 'uploads')
fullpath =""
melody = "empty"
image = ""

@app.route('/insert', methods=['POST'])
def insert():
    global melody
    melody = request.json['melodyData']
    print(melody)
    # here needs to call Itay's algo
    return jsonify({"chords": [('g',6), ('a7',5), ('c',5), ('f',6)]})

@app.route('/insertImage', methods=['POST'])
def insertImage():
    global image
    global fullpath # maybe doesnt need (only for show html)
    image = request.files.get('file')
    fullpath = os.path.join(upload_path, image.filename + '.jpeg') # 1 file always (sending each every call). check format fits
    f = open(fullpath, "w")
    f.close()
    image.save(fullpath)
    sleep(3)
    # here needs to call Oz's algo. what returns?
    return jsonify("done")

@app.route('/insertAudio', methods=['POST'])
def insertAudio():
    print("hello")
    audio = request.files.get('file')
    print(audio)
    fullpath = os.path.join(upload_path, audio.filename) # 1 file always (sending each every call). check format fits
    f = open(fullpath, "w")
    f.close()
    audio.save(fullpath)
    # here needs to call my algo. returns notes list
    print("backfile", fullpath)
    notesList = getFFTNotes(fullpath)
    print(notesList)
    return jsonify({"notes": notesList})

@app.route('/get', methods=['GET'])
def get():
    return jsonify(melody)

@app.route('/getImage', methods=['GET'])
def getImage():
    return '<img src="./assets/camera.png" alt="Smiley face" width="42" height="42">'

if __name__ == "__main__":
    app.run(host='192.168.1.231', port = 3000 ,debug=True)
    # app.run(host='0.0.0.0', port = 8080 ,debug=True)
    # app.run(host='10.0.0.5', port = 3000 ,debug=True)
    # app.run(host='192.168.56.1', port = 3000 ,debug=True) for emulator