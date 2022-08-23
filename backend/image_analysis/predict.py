import torch
import cv2
import numpy as np
import warnings

# indexing the notes
note_to_idx = {
    'rest': 0,
    'A1': 13,
    'A#1': 14,
    'Bb1': 14,
    'B1': 15,
    'C2': 16,
    'C#2': 17,
    'Db2': 17,
    'D2': 18,
    'D#2': 19,
    'Eb2': 19,
    'E2': 20,
    'F2':21,
    'F#2':22,
    'Gb2':22,
    'G2': 23,
    'G#2': 24,
    'Ab2': 24,
    'A2': 25,
    'A#2': 26,
    'Bb2': 26,
    'B2': 27,
    'C3': 28,
    'C#3': 29,
    'Db3': 29,
    'D3': 30,
    'D#3': 31,
    'Eb3': 31,
    'E3': 32,
    'F3': 33,
    'F#3': 34,
    'Gb3': 34,
    'G3': 35,
    'G#3': 36,
    'Ab3': 36,
    'A3': 37,
    'A#3': 38,
    'Bb3': 38,
    'B3': 39,
    'C4': 40,
    'C#4': 41,
    'Db4': 41,
    'D4': 42,
    'D#4': 43,
    'Eb4': 43,
    'E4': 44,
    'F4': 45,
    'F#4': 46,
    'Gb4': 46,
    'G4': 47,
    'G#4': 48,
    'Ab4': 48,
    'A4': 49,
    'A#4': 50,
    'Bb4': 50,
    'B4': 51,
    'C5': 52,
    'C#5': 53,
    'Db5': 53,
    'D5': 54,
    'D#5': 55,
    'Eb5': 55,
    'E5': 56,
    'F5': 57,
    'F#5': 58,
    'Gb5': 58,
    'G5': 59,
    'G#5': 60,
    'Ab5': 60,
    'A5': 61,
    'A#5': 62,
    'Bb5': 62,
    'B5': 63,
    'C6': 64,
    'C#6': 65,
    'Db6': 65,
    'D6': 66,
    'D#6': 67,
    'Eb6': 67,
    'E6': 68,
    'F6': 69,
    'F#6': 70,
    'Gb6': 70,
    'G6': 71,
    'G#6': 72,
    'Ab6': 72,
    'A6': 73,
    'A#6': 74,
    'Bb6': 74,
    'B6': 75,
    'C7': 76,
    'C#7': 77,
    'Db7': 77,
    'D7': 78,
    'D#7': 79,
    'Eb7': 79,
    'E7': 80,
    'F7':81,
    'F#7':82,
    'Gb7':82,
    'G7': 83,
    'G#7': 84,
    'Ab7': 84,
    'A7': 85,
    'A#7': 86,
    'Bb7': 86,
    'B7': 87,
    'C8': 88,
    'C#8': 89,
    'Db8': 89,
    'D8': 90,
    'D#8': 91,
    'Eb8': 91,
    'E8': 92,
    'F8': 93,
    'F#8': 94,
    'Gb8': 94,
    'G8': 95,
    'G#8': 96,
    'Ab8': 96,
    'A8': 97,
    'A#8': 98,
    'Bb8': 98,
    'B8': 99,
    'C9': 100,
    'C#9': 101,
    'Db9': 101,
    'D9': 102,
    'D#9': 103,
    'Eb9': 103,
    'E9': 104,
    'F9': 105,
    'F#9': 106,
    'Gb9': 106,
    'G9': 107,
    'G#9': 108,
    'Ab9': 108,
}

# dictionary of the lengthes of playing notes
time_to_play = {
    'sixty_fourth': 1/64,
    'sixty_fourth.': 1/64,
    'sixty_fourth..': 1/64,
    'sixty_fourth_fermata': 1/64,
    'sixty_fourth._fermata': 1/64,
    'thirty_second': 1/32,
    'thirty_second.': 1/32,
    'thirty_second..': 1/32,
    'thirty_second_fermata': 1/32,
    'thirty_second._fermata': 1/32,
    'sixteenth': 1/16,
    'sixteenth.': 1/16,
    'sixteenth..': 1/16,
    'sixteenth_fermata': 1/16,
    'sixteenth._fermata': 1/16,
    'eighth': 1/8,
    'eighth.': 1/8,
    'eighth..': 1/8,
    'eighth._fermata': 1/8,
    'eighth_fermata': 1/8,
    'quarter': 1/4,
    'quarter.': 1/4,
    'quarter..': 1/4,
    'quarter_fermata': 1/4,
    'quarter._fermata': 1/4,
    'quarter.._fermata': 1/4,
    'half': 1/2,
    'half.': 1/2,
    'half..': 1/2,
    'half_fermata': 1/2,
    'half._fermata': 1/2,
    'whole': 1,
    'whole.': 1,
    'whole..': 1,
    'whole_fermata': 1,
    'whole._fermata': 1,
    'quadruple_whole': 2,
    'quadruple_whole.': 2,
    'quadruple_whole_fermata': 2,
    'double_whole': 2,
    'double_whole.': 2,
    'double_whole_fermata': 2,  

}

# resize images
def resize(image, height):
    width = int(float(height * image.shape[1]) / image.shape[0])
    sample_img = cv2.resize(image, (width, height))
    return sample_img



def predict(path_to_image):
    warnings.filterwarnings('ignore')  
    # the model
    path_to_model = 'image_analysis/trained_model (3)'
    pred_model = torch.load(path_to_model, map_location=torch.device('cpu'))
    pred_model.eval()
    
    # optionals lables of the model
    path_to_voc = 'image_analysis/vocabulary_semantic.txt'
    voc = open(path_to_voc,'r')
    voc_list = voc.read().splitlines()

    # parse the lables
    int2word = {}
    for word in voc_list:
        word_idx = len(int2word)
        int2word[word_idx] = word
    voc.close()
    int2word[1781] = '        '

    # read the input image
    image = cv2.imread(path_to_image, cv2.IMREAD_GRAYSCALE)
    image = resize(image, 128)
    image = (255.0-image)/255
    image = np.asarray(image).reshape(1, 1 ,image.shape[0],image.shape[1])

    # run the model
    pred = pred_model(torch.Tensor(image))

    # get the prediction
    notes_list = []
    for note in pred:
        notes_list.append(int2word[np.argmax(note[0].detach().numpy())])

    # save only the notes from the prediction
    notes=[]
    for n in notes_list: 
        if n[0:5] == 'note-':
            if not n[6].isdigit():
                notes.append((n[5:8], n[9:]))
            else:
                notes.append((n[5:7],n[8:]))
        elif n[0:5] == 'rest-':
            notes.append(('rest', n[5:]))
    
    # code the notes and lenthes
    output = []
    for pair in notes:
        if pair[0] in note_to_idx:
            output.append((note_to_idx[pair[0]], time_to_play[pair[1]]))


    return output



# print(predict('000051783-1_1_1.png'))