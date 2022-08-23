import sys
import pandas as pd
import numpy as np
import os
import torch
from torch.utils.data import Dataset
from torch.utils.data import DataLoader
import torch
import torch.autograd as autograd
import torch.nn as nn
import torch.optim as optim
import torch.utils.data as data
from torch.autograd import Variable
csv_analysis_path = os.path.join(os.getcwd(), 'csv_analysis')
sys.path.append(csv_analysis_path)
from model2 import Model
from data_loader import get_data_frame, get_data_loader, get_one_sample_data_loader

device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

number_to_note_dict = {'1': 'A', '2': 'A#', '3': 'B', '4': 'C', '5': 'C#', '6': 'D',
                       '7': 'D#', '8': 'E', '9': 'F', '10': 'F#', '11': 'G', '12': 'G#'}


def number_to_note(vec):
    result = []
    for num in vec:
        result.append(number_to_note_dict[str(int(num))])
    return result


def predict(model, test_loader):
    model.eval()
    with torch.no_grad():
        i = 0
        for data in test_loader:
            length = int(data[3])
            outputs = model(data[0].float().to(device))
            pred1 = number_to_note(torch.Tensor(
                np.argmax(outputs[0], axis=2)[0, :length]))
            pred2 = torch.Tensor(np.argmax(outputs[1], axis=2)[0, :length])
            return pred1
            break


def get_chords(file_path):
    model = Model(input_size=32, hidden_size=10,
                  lstm_layers=2, n_traget1=14, n_traget2=33)
    model.load_state_dict(torch.load('csv_analysis/trained_model/trained_model.pt'))
    model.eval()
    sample_dl = get_one_sample_data_loader(file_path)
    return predict(model, sample_dl)


if __name__ == '__main__':
    print(get_chords(sys.argv[1]))
