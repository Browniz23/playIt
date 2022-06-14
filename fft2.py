from matplotlib.colors import same_color
import matplotlib.pyplot as plt
import scipy
import scipy.io.wavfile as wavfile
import scipy.fftpack as fftpk
import numpy as np
import sys
from pydub import AudioSegment


NOTES_FREQS = [27.50000, 29.13524, 30.86771, 32.70320, 34.64783, 36.70810, 38.89087, 41.20344, 43.65353, 46.24930, 48.99943, 51.91309,
55.0, 58.27048, 61.73542, 65.4064, 69.29566, 73.4162, 77.78174, 82.40688, 87.30706, 92.4986, 97.99886, 103.82618,
110.0, 116.54096, 123.47084, 130.8128, 138.59132, 146.8324, 155.56348, 164.81376, 174.61412, 184.9972, 195.99772, 207.65236,
220.0, 233.08192, 246.94168, 261.6256, 277.18264, 293.6648, 311.12696, 329.62752, 349.22824, 369.9944, 391.99544, 415.30472,
440.0, 466.16384, 493.88336, 523.2512, 554.36528, 587.3296, 622.25392, 659.25504, 698.45648, 739.9888, 783.99088, 830.60944,
880.0, 932.32768, 987.76672, 1046.5024, 1108.73056, 1174.6592, 1244.50784, 1318.51008, 1396.91296, 1479.9776, 1567.98176, 1661.21888,
1760.0, 1864.65536, 1975.53344, 2093.0048, 2217.46112, 2349.3184, 2489.01568, 2637.02016, 2793.82592, 2959.9552, 3135.96352, 3322.43776,
3520.0, 3729.31072, 3951.06688, 4186.0096, 4434.92224, 4698.6368, 4978.03136, 5274.04032, 5587.65184, 5919.9104, 6271.92704, 6644.87552]

def closestPianoNoteNum(freq): # maybe do binary search
    if freq <= 0:
        return -1
    for i,x in enumerate(NOTES_FREQS):
        if freq < x:
            if freq - NOTES_FREQS[i-1] > x - freq:
                # print("1:", i+1, freq, x)
                return i+1 # +1 for real piano Number
            else:
                # print("2:", i-1+1, freq, NOTES_FREQS[i-1])
                return i-1+1 # +1 for real piano Number

def getFFTNotes(filename):
    print("filename:", filename)
    # filename = 'uploads/testing1.mp3'
    extension = filename.split('.')[-1]
    print(extension)
    wav_filename = filename
    # if filename.endswith('.wav') and filename.endswith('.WAV'):
    if extension != 'wav' and extension != 'WAV':
        wav_filename = ''.join(filename.split('.')[:-1]) + '.wav'
        track = AudioSegment.from_file(filename,  format= extension)
        file_handle = track.export(wav_filename, format='wav')

    rate, data = wavfile.read(wav_filename)
    full_length = 1000 * len(data) / rate
    sample_size = len(data) * (200 / full_length)
    iters = int(len(data) // sample_size)
    curr_main = (-1,-1)
    count = 0
    final_list = []
    durr = 0
    prevApt = -1
    isFading = False
    isBreak = False
    for i in range(iters):
        signal = data[int(i*sample_size) : int((i+1)*sample_size)]
        if len(signal.shape) > 1:
            signal = np.sum(signal, axis=1)
        fft = abs(scipy.fft.fft(signal))
        print(rate)
        freqs = fftpk.fftfreq(len(fft), (1.0/rate))
        np.set_printoptions(threshold=sys.maxsize, suppress=True)
        # print(freqs)
        freqs = freqs[10:len(fft)//2]    # here??            # adde /2
        fft = fft[10:len(fft)//2]
        maxApt = np.max(fft)
        # print("         ",maxApt)
        maxIdx = np.argmax(fft)
        print("len:", len(freqs), len(fft))
        maxsFreq = freqs[maxIdx] 
        print("freq:", maxsFreq, "idx:", maxIdx, "apt:", maxApt)
        maxsNoteNum = closestPianoNoteNum(maxsFreq)
        if maxApt < 10: # choose 10 as small enough for break
            maxsNoteNum = 0
            if isBreak:
                count += 1
            else:
                if curr_main[1] != -1:
                    final_list.append((curr_main[1], count)) # changed right from maxsNoteNum
                count = 1
                isBreak = True
                isFading = True
                curr_main = (maxApt, maxsNoteNum)
            prevApt = maxApt
            continue
        isBreak = False
        tops = []
        for i,a in enumerate(fft):
            if a > maxApt * 0.45 and i != maxIdx and freqs[i] > 0: # maybe can pass middle (y need last? nad y still get -1????)
                n = closestPianoNoteNum(freqs[i])
                # print("n:", n, "max:", maxsNoteNum)
                # if many doubles - will take the first got into
                if n == maxsNoteNum - 12 or n == maxsNoteNum - 24 or n == maxsNoteNum - 36 or n == maxsNoteNum - 48 or n == maxsNoteNum - 60 or n == maxsNoteNum - 72 or n == maxsNoteNum - 84:
                    # print("yay?")
                    maxsNoteNum = n 
                    curr_main = (maxApt, maxsNoteNum) # change maxApt to a????? or to curr_main[0]???
                tops.append(n)
                # tops.append((a,i))
                
        if maxApt > prevApt or maxApt <= prevApt:
            # on our way up: 1-same good note. 2-mistake note at current. 3-danger mistake. 4-new note.
            if maxsNoteNum == curr_main[1]:
                print("AAAAAAAAAA")
                count += 1
            # elif maxApt > curr_main[0] and not isFading:
            elif maxApt > curr_main[0]:
                print("BBBBBBBBBB - ", maxsNoteNum)
                curr_main = (maxApt, maxsNoteNum)
                count += 1
            elif curr_main[1] in tops:
                print("CCCCCCCCCC")
                # probably unprecise freq mistake
                count += 1
            else:
                print("DDDDDDDDDDD - ", maxsNoteNum)
                # if maxsNoteNum == 47 or maxsNoteNum == 59:
                #     print("                             WHY?")
                final_list.append((curr_main[1], count)) # changed right from maxsNoteNum
                count = 1
                curr_main = (maxApt, maxsNoteNum)   # added
            isFading = False
        # else:
        #     isFading = True
        #     count += 1
        #     print("EEEEEEEEEEEEE - ", maxsNoteNum)
        prevApt = maxApt

        # plt.plot(freqs[range(len(fft)//2)], fft[range(len(fft)//2)])
        plt.plot(freqs[range(len(fft)//64)], fft[range(len(fft)//64)])
        plt.xlabel("Frequence(Hz)")
        plt.ylabel("Amplitude")
        plt.title(count)
        plt.show()
    final_list.append((maxsNoteNum, count))
    # np.set_printoptions(threshold=sys.maxsize, suppress=True)
    print(freqs)
    print(final_list)
    return final_list

getFFTNotes('uploads/real1.mp4')