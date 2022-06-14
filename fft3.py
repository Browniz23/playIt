from matplotlib.colors import same_color
import matplotlib.pyplot as plt
import scipy
import scipy.io.wavfile as wavfile
import scipy.fftpack as fftpk
import numpy as np
import sys
from pydub import AudioSegment
from scipy import signal


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
                return i+1 # +1 for real piano Number
            else:
                return i-1+1 # +1 for real piano Number
    return -1

def getTotalMax(data):
    if len(data.shape) > 1:
        fft1 = abs(scipy.fft.fft(data[:,0]))
        fft2 = abs(scipy.fft.fft(data[:,1]))
        return max(np.max(fft1),np.max(fft2))
    else:
        fft = abs(scipy.fft.fft(data))
        return np.max(fft)

def getFFTNotes(filename):
    print("filename:", filename)
    extension = filename.split('.')[-1]
    print(extension)
    wav_filename = filename
    if extension != 'wav' and extension != 'WAV':
        wav_filename = ''.join(filename.split('.')[:-1]) + '.wav'
        track = AudioSegment.from_file(filename,  format= extension)
        file_handle = track.export(wav_filename, format='wav')

    rate, data = wavfile.read(wav_filename)
    full_length = 1000 * len(data) / rate
    sample_size = len(data) * (200 / full_length) # real5 change to 300 - works (no break) execpt one harmony
    iters = int(len(data) // sample_size)
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
            fft1 = abs(scipy.fft.fft(curr_signal[:,0]))
            fft2 = abs(scipy.fft.fft(curr_signal[:,1]))
            isTwoChanels = True
        else:
            fft1 = abs(scipy.fft.fft(curr_signal))
            fft2 = np.zeros(len(fft1))

        freqs = fftpk.fftfreq(len(fft1), (1.0/rate))
        freqs = freqs[10:len(fft1)//2] 
        fft1 = fft1[10:len(fft1)//2]
        fft2 = fft2[10:len(fft2)//2]
        maxApt = max(np.max(fft1),np.max(fft2))
        maxIdx = np.argmax(fft1)
        secMaxIdx = np.argmax(fft2)
        if maxApt in fft2:
            temp = maxIdx
            maxIdx = secMaxIdx
            secMaxIdx = temp
        maxsFreq = freqs[maxIdx]    
        maxsNoteNum = closestPianoNoteNum(maxsFreq)

        if maxApt < totalMax * 0.02: # choose 0.02 from totalmax as small enough
            maxsNoteNum = 0
            if isBreak:
                count += 1
            else:
                if curr_main[1] != -1:
                    final_list.append((curr_main[1], count)) # changed right from maxsNoteNum
                count = 1
                isBreak = True
                curr_main = (maxApt, maxsNoteNum)
            continue
        elif isBreak:
            final_list.append((curr_main[1], count)) # changed right from maxsNoteNum
            count = 0
            isBreak = False
        if maxsNoteNum < 0: # maybe should repeat witout this high?
            continue

        isBreak = False
        tops = []
        found = False
        for i,a in enumerate(fft1):
            # if two chanels - check the other chanel max
            if (a > maxApt * 2/3 or (i == secMaxIdx and isTwoChanels)) and i != maxIdx: # maybe can pass middle
                n = closestPianoNoteNum(freqs[i])
                if n < 0: # high freq got -1 and made 11 get in         NEED ALSO IN SECOND?!?!
                    print("GOT -1 AT FIRST")
                    break
                # if many doubles - will take the first got into
                if n == maxsNoteNum - 12 or n == maxsNoteNum - 24 or n == maxsNoteNum - 36 or n == maxsNoteNum - 48 or n == maxsNoteNum - 60 or n == maxsNoteNum - 72 or n == maxsNoteNum - 84:
                    maxsNoteNum = n 
                    found = True
                    break # really??
                tops.append(n)

        if not found and isTwoChanels:
            for i,a in enumerate(fft2):
                if (a > maxApt * 2/3 or i == secMaxIdx) and i != maxIdx: # maybe can pass middle
                    n = closestPianoNoteNum(freqs[i])
                    if n == maxsNoteNum - 12 or n == maxsNoteNum - 24 or n == maxsNoteNum - 36 or n == maxsNoteNum - 48 or n == maxsNoteNum - 60 or n == maxsNoteNum - 72 or n == maxsNoteNum - 84:
                        maxsNoteNum = n 
                        found = True
                        break # really??
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
            final_list.append((curr_main[1], count)) # changed right from maxsNoteNum
            count = 1
            curr_main = (maxApt, maxsNoteNum)   # added

        # plt.plot(freqs[range(len(fft1)//32)], fft1[range(len(fft1)//32)])
        # plt.xlabel("Frequence(Hz)")
        # plt.ylabel("Amplitude")
        # plt.title(count)
        # plt.show()
        # if isTwoChanels:
        #     plt.plot(freqs[range(len(fft1)//32)], fft2[range(len(fft1)//32)])
        #     plt.xlabel("Frequence(Hz)")
        #     plt.ylabel("Amplitude")
        #     plt.title(count)
        #     plt.show()

    final_list.append((curr_main[1], count))
    print(final_list)
    return final_list

getFFTNotes('uploads/real3.wav')


# filename = 'uploads/real3.wav'
# extension = filename.split('.')[-1]
# wav_filename = filename
# # if filename.endswith('.wav') and filename.endswith('.WAV'):
# if extension != 'wav' and extension != 'WAV':
#     wav_filename = ''.join(filename.split('.')[:-1]) + '.wav'
#     track = AudioSegment.from_file(filename,  format= extension)
#     file_handle = track.export(wav_filename, format='wav')
# rate, data = wavfile.read(wav_filename)
# if len(data.shape) > 1:
#     # data = data[:,0]
#     data = data[:,1]
#     # data = np.sum(data, axis=1)
# fft = abs(scipy.fft.fft(data))
# freqs = fftpk.fftfreq(len(fft), (1.0/rate))
# maxApt = np.max(fft)
# print(maxApt)
# plt.plot(freqs[range(len(fft)//64)], fft[range(len(fft)//64)])
# plt.xlabel("Frequence(Hz)")
# plt.ylabel("Amplitude")
# plt.show()