import json
import cgi
import io 
import base64
import os   
import numpy as np 
import scipy.io.wavfile as wavfile 
import scipy.fftpack as fftpk
from pydub import AudioSegment


NOTES_FREQS = [27.50000, 29.13524, 30.86771, 32.70320, 34.64783, 36.70810, 38.89087, 41.20344, 43.65353, 46.24930, 48.99943, 51.91309,
55.0, 58.27048, 61.73542, 65.4064, 69.29566, 73.4162, 77.78174, 82.40688, 87.30706, 92.4986, 97.99886, 103.82618,
110.0, 116.54096, 123.47084, 130.8128, 138.59132, 146.8324, 155.56348, 164.81376, 174.61412, 184.9972, 195.99772, 207.65236,
220.0, 233.08192, 246.94168, 261.6256, 277.18264, 293.6648, 311.12696, 329.62752, 349.22824, 369.9944, 391.99544, 415.30472,
440.0, 466.16384, 493.88336, 523.2512, 554.36528, 587.3296, 622.25392, 659.25504, 698.45648, 739.9888, 783.99088, 830.60944,
880.0, 932.32768, 987.76672, 1046.5024, 1108.73056, 1174.6592, 1244.50784, 1318.51008, 1396.91296, 1479.9776, 1567.98176, 1661.21888,
1760.0, 1864.65536, 1975.53344, 2093.0048, 2217.46112, 2349.3184, 2489.01568, 2637.02016, 2793.82592, 2959.9552, 3135.96352, 3322.43776,
3520.0, 3729.31072, 3951.06688, 4186.0096, 4434.92224, 4698.6368, 4978.03136, 5274.04032, 5587.65184, 5919.9104, 6271.92704, 6644.87552]

def closestPianoNoteNum(freq):
    if freq <= 0:
        return -1
    for i,x in enumerate(NOTES_FREQS):
        # if found close freq returns correct note (+1 for real piano Number)
        if freq < x:
            # freq is closer to i note frequency 
            if freq - NOTES_FREQS[i-1] > x - freq:
                return i+1
            # freq is closer to i-1 note frequency    
            else:
                return i-1+1
    return -1

# returns the maximum apt in data for normalization purposes
def getTotalMax(data):
    # case got stereo - 2 chanels
    if len(data.shape) > 1:
        fft1 = abs(fftpk.fft(data[:,0]))
        fft2 = abs(fftpk.fft(data[:,1]))
        return max(np.max(fft1),np.max(fft2))
    else:
        fft = abs(fftpk.fft(data))
        return np.max(fft)

# gets audio file and returns list of notes with duration time (tuple)
def getFFTNotes(filename):
    print("filename:", filename)
    extension = filename.split('.')[-1]
    print(extension)
    wav_filename = filename
    if extension != 'wav' and extension != 'WAV':
        # return []
        # works only if added layer pydub - need to make lambda bit larger. for now only wav files.
        wav_filename = ''.join(filename.split('.')[:-1]) + '.wav'
        track = AudioSegment.from_file(filename,  format= extension)
        file_handle = track.export(wav_filename, format='wav')

    # read file and set parameters
    rate, data = wavfile.read(wav_filename)
    full_length = 1000 * len(data) / rate
    sample_size = len(data) * (200 / full_length)
    iters = int(len(data) // sample_size)
    print("iters", iters)
    curr_main = (-1,-1)
    count = 0
    final_list = []
    isBreak = False
    totalMax = getTotalMax(data)

    for i in range(iters):

        curr_signal = data[int(i*sample_size) : int((i+1)*sample_size)]
        fft1 = []
        fft2 = []
        isTwoChanels = False
        if len(curr_signal.shape) > 1:
            fft1 = abs(fftpk.fft(curr_signal[:,0]))
            fft2 = abs(fftpk.fft(curr_signal[:,1]))
            isTwoChanels = True
        else:
            fft1 = abs(fftpk.fft(curr_signal))
            fft2 = np.zeros(len(fft1))

        # get data freqencies and ignore first 10 because noisy '0' (and unrealistic note)
        freqs = fftpk.fftfreq(len(fft1), (1.0/rate))
        freqs = freqs[10:len(fft1)//2] 
        fft1 = fft1[10:len(fft1)//2]
        fft2 = fft2[10:len(fft2)//2]
        # get max apt and its idx from entire data (fft1 and fft2)
        maxApt = max(np.max(fft1),np.max(fft2))
        maxIdx = np.argmax(fft1)
        secMaxIdx = np.argmax(fft2)
        if maxApt in fft2:
            temp = maxIdx
            maxIdx = secMaxIdx
            secMaxIdx = temp
        maxsFreq = freqs[maxIdx]    
        maxsNoteNum = closestPianoNoteNum(maxsFreq)

        # if max apt is too small - probably a break 
        if maxApt < totalMax * 0.02: # choose 0.02 from totalmax as small enough
            maxsNoteNum = 0
            if isBreak:
                count += 1
            else:
                if curr_main[1] != -1:
                    final_list.append((curr_main[1], count)) 
                count = 1
                isBreak = True
                curr_main = (maxApt, maxsNoteNum)
            continue
        # get out of a break and move on
        elif isBreak:
            final_list.append((curr_main[1], count)) 
            count = 0
            isBreak = False
        if maxsNoteNum < 0: 
            continue

        isBreak = False
        tops = []
        found = False
        # deal with harmonies problem. case many x2 freqs are high probably the smallest is real
        for i,a in enumerate(fft1):
            # if two chanels - check the other chanel max
            if (a > maxApt * 2/3 or (i == secMaxIdx and isTwoChanels)) and i != maxIdx:
                n = closestPianoNoteNum(freqs[i])
                if n < 0:
                    print("GOT -1 AT FIRST")
                    break
                # if many doubles - will take the first got into
                if n == maxsNoteNum - 12 or n == maxsNoteNum - 24 or n == maxsNoteNum - 36 or n == maxsNoteNum - 48 or n == maxsNoteNum - 60 or n == maxsNoteNum - 72 or n == maxsNoteNum - 84:
                    maxsNoteNum = n 
                    found = True
                    break
                tops.append(n)
    
        if not found and isTwoChanels:
            # deal with harmonies problem. case many x2 freqs are high probably the smallest is real
            for i,a in enumerate(fft2):
                if (a > maxApt * 2/3 or i == secMaxIdx) and i != maxIdx:
                    n = closestPianoNoteNum(freqs[i])
                    if n == maxsNoteNum - 12 or n == maxsNoteNum - 24 or n == maxsNoteNum - 36 or n == maxsNoteNum - 48 or n == maxsNoteNum - 60 or n == maxsNoteNum - 72 or n == maxsNoteNum - 84:
                        maxsNoteNum = n 
                        found = True
                        break
                    tops.append(n)


        # 1-same good note. 2-mistake note at current. 3-danger mistake. 4-new note.
        if maxsNoteNum == curr_main[1]:
            if maxApt > curr_main[0]:   # added to gain curr max apt
                curr_main = (maxApt, maxsNoteNum)
            count += 1
        elif maxApt > curr_main[0] * 2: # Tried * 2 for really big diff
            curr_main = (maxApt, maxsNoteNum)
            count += 1
        elif curr_main[1] in tops:      # probably unprecise freq mistake
            count += 1
        else:
            final_list.append((curr_main[1], count))
            count = 1
            curr_main = (maxApt, maxsNoteNum)

    final_list.append((curr_main[1], count))
    print(final_list)
    return final_list

#######################################################################
def get_file_from_request_body(headers, body):
    fp = io.BytesIO(base64.b64decode(body)) # decode
    environ = {"REQUEST_METHOD": "POST"}
    print(headers)
    print(body)
    headers = {
        "content-type": headers["content-type"],
        "content-length": len(body),
    }

    fs = cgi.FieldStorage(fp=fp, environ=environ, headers=headers) 
    return [fs["file"], None]

def lambda_handler(event, context):
    
    file_item, file_item_error = get_file_from_request_body(headers=event["headers"], body=event["body"])
    message = "hello!"
    myList = []
    if file_item.filename:
       fn = os.path.basename(file_item.filename)
       open('/tmp/' + fn, 'wb').write(file_item.file.read())
       os.chdir('/tmp')
       print(os.listdir())
       message = 'The file "' + fn + '" was uploaded successfully'
       myList = getFFTNotes(fn)
    else:
       message = 'No file was uploaded'
    print(myList)
    return {
        "statusCode": 200,
        "body": json.dumps({
            "notes": myList,
        }),
    }