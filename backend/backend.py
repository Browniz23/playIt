import base64
import json
from time import sleep
from flask import Flask, jsonify, render_template, request
from sklearn.metrics import consensus_score
import os
from audio_analysis.fft_aws import *
import sys
from csv_analysis.load_model import get_chords
from image_analysis.predict import predict

app = Flask(__name__)


upload_path = os.path.join(os.getcwd(), 'uploads')
image_analysis_path = os.path.join(os.getcwd(), 'image_analysis')
csv_analysis_path = os.path.join(os.getcwd(), 'csv_analysis')

sys.path.append(image_analysis_path)
sys.path.append(csv_analysis_path)


@app.route('/insertCSV', methods=['POST'])
def insert():
    # comment below for getting csv data instead of file itself
    # melody = request.json['melodyData']

    # added for saving csv instead only data
    melody = request.files.get('file')
    fullpath = os.path.join(upload_path, melody.filename) # 1 file always (sending each every call). check format fits
    f = open(fullpath, "w")
    f.close()
    melody.save(fullpath)
    # myList = ['g', 'a7', 'c', 'f'] # output example

    # calls Itay's algo
    myList = get_chords(fullpath)

    return {
        "statusCode": 200,
        "body": json.dumps({
            "chords": myList,
        }),
        "chords": myList, # here for keep the code in harmonyScreen same as using AWS Lambda
    }
    # return jsonify({"chords": [('g',6), ('a7',5), ('c',5), ('f',6)]}) # before aws

# gets an image, saves it in uploads folder and calls ML algorithm to detect notes in picture.
# returns a list of tuples, where the first element is note (as piano key) and the second is its duration.
@app.route('/insertImage', methods=['POST'])
def insertImage():
    
    image = request.files.get('file')
    fullpath = os.path.join(upload_path, image.filename) # 1 file always (sending each every call). check format fits
    f = open(fullpath, "w")
    f.close()
    image.save(fullpath)
    # myList = [(42, 4), (44, 2), (47, 4), (49, 2)] # output example

    # call Oz's algo.
    myList = predict(fullpath)

    return {
        "statusCode": 200,
        "body": json.dumps({
            "notes": myList,
        }),
        "notes": myList, # here for keep the code in cameraScreen same as using AWS Lambda
    }

# ***UNUSED! AWS instead. ***
# gets audio file, saves it and return the notes and their durations in list (using FFT).
@app.route('/insertAudio', methods=['POST'])
def insertAudio():
    audio = request.files.get('file')
    fullpath = os.path.join(upload_path, audio.filename) # 1 file always (sending each every call). check format fits
    f = open(fullpath, "w")
    f.close()
    audio.save(fullpath)
    # here needs to call my algo. returns notes list
    notesList = getFFTNotes(fullpath)
    print(notesList)
    return jsonify({"notes": notesList})

if __name__ == "__main__":
    # app.run(host='192.168.1.224', port = 3000 ,debug=True)    # for wifi new 100 instead of 231 
    app.run(host='192.168.56.1', port = 3000 ,debug=True) # for emulator