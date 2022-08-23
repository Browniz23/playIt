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


note_to_number_dict = {'rest': 0, 'A0': 1, 'A#': 2, 'Bb': 2, 'B0': 3, 'B#': 4, 'Cb': 3, 'C0': 4, 'C#': 5, 'Db': 5, 'D0': 6,
                       'D#': 7, 'Eb': 7, 'E0': 8, 'E#': 9, 'Fb': 8, 'F0': 9, 'F#': 10, 'Gb': 10, 'G0': 11, 'G#': 12, 'Ab': 12, '[]': 13}
chord_type_to_number_dict = {'major': 0, 'minor-sixth': 1, 'dominant': 2, 'half-diminished': 3,
                             'minor': 4, 'major-seventh': 5, 'major-sixth': 6, '[]': 7, 'minor-seventh': 8, 'dominant-ninth': 9, 'augmented-seventh': 10,
                             'diminished': 11, 'suspended-fourth': 12, 'minor-ninth': 13, 'dominant-13th': 14, 'major-ninth': 15, 'dominant-seventh': 16, 'augmented': 17,
                             'diminished-seventh': 18, 'nan': 0, 'maj7': 5, '7': 5, 'maj': 0, 'min': 4, 'min7': 8, '9': 19, 'major-minor': 20,
                             'maj69': 21, 'minor-11th': 22, 'dominant-11th': 23, 'dim': 11, 'suspended-second': 24, 'minor-major': 25, 'min9': 13, 'augmented-ninth': 26,
                             'power': 27, 'pedal': 28, 'minMaj7': 29, 'aug': 17, 'minor-13th': 30, ' dim7': 18, 'dim7': 18, 'sus47': 31, 'maj9': 15, 'm7b5': 32}

number_to_note_dict = {'1': 'A', '2': 'A#', '3': 'B', '4': 'C', '5': 'C#', '6': 'D',
                       '7': 'D#', '8': 'E', '9': 'F', '10': 'F#', '11': 'G', '12': 'G#'}


def map_numbers_to_elements(target1, target2):
    result = []
    for i in range(len(target1)):
        chord_root = target1[i]
        chord_type = target2[i]
        for key, value in note_to_number_dict.items():
            if chord_root == value:
                chord_root = key
                break
        for key, value in chord_type_to_number_dict.items():
            if chord_type == value:
                chord_type = key
                break
        result.append(chord_root + chord_type)
    return result


def map_elements_to_numbers(df):
    df = df.replace({'note_root': note_to_number_dict,
                    'chord_root': note_to_number_dict, 'chord_type': chord_type_to_number_dict})
    return df


def multiply_note(row):
    temp = [row['note_info'] for i in range(int(row['note_duration']))]
    temp = [item for sublist in temp for item in sublist]
    return temp


def add_note_column(row):
    return [row['note_root'], row['note_octave']]


def delete_useless_columns(df):
    del df['time']
    del df['key_fifths']
    del df['key_mode']
    del df['note_root']
    del df['note_octave']
    del df['note_duration']


def fix_list_length(row):
    if len(row['long_note']) > 32:
        return row['long_note'][:32]
    else:
        row['long_note'] += [0] * (32 - len(row['long_note']))
    return row['long_note']


def connect_measures(df):
    return df.groupby('measure', sort=False).agg({'long_note': 'sum', 'chord_root': 'first', 'chord_type': 'first'})


def create_note_and_ocatve_columns(df):
    for i in range(16):
        df['note_' +
            str(i)] = df.apply(lambda row: row['long_note'][2*i], axis=1)
        df['octave_' +
            str(i)] = df.apply(lambda row: row['long_note'][2*i + 1], axis=1)
    return df


def get_data_frame(file_name):
    df = pd.read_csv(file_name)
    df = map_elements_to_numbers(df)
    df['note_info'] = df.apply(lambda row: add_note_column(row), axis=1)
    df['long_note'] = df.apply(lambda row: multiply_note(row), axis=1)
    delete_useless_columns(df)
    df = connect_measures(df)
    df['long_note'] = df.apply(lambda row: fix_list_length(row), axis=1)
    df = create_note_and_ocatve_columns(df)
    del df['long_note']
    df['song_name'] = df.apply(lambda row: file_name, axis=1)
    return df


def create_big_data_frame(dir_path):
    big_df = pd.DataFrame()

    for filename in os.listdir(dir_path):
        df = get_data_frame(dir_path + '/' + filename)
        big_df = pd.concat([big_df, df], ignore_index=True)

    return big_df


def get_one_sample_data_loader(file_path):
    sample_df = get_data_frame(file_path)
    data_ds = songDataset(sample_df)
    data_dl = DataLoader(data_ds)
    return data_dl


class songDataset(Dataset):
    def __init__(self, df):
        self.train, self.target1, self.target2, self.songs_lengths = build_dataset(
            df)

    def __len__(self):
        return len(self.train)

    def __getitem__(self, idx):
        return self.train[idx], self.target1[idx], self.target2[idx], self.songs_lengths[idx]


def build_dataset(df):
    all_data = []
    all_target_1 = []
    all_target_2 = []
    all_songs_length = []

    for i, song_df in df.groupby("song_name"):
        song_df = song_df.reset_index()
        song_data = np.zeros((185, 32))
        song_target_1 = np.zeros(185)
        song_target_2 = np.zeros(185)
        all_songs_length.append(len(song_df))
        for j, row in song_df.iterrows():
            for k in range(16):
                song_data[j, 2*k] = row['note_' + str(k)]
                song_data[j, 2*k + 1] = row['octave_' + str(k)]
            song_target_1[j] = row["chord_root"]
            song_target_2[j] = row["chord_type"]
        all_data.append(song_data)
        all_target_1.append(song_target_1)
        all_target_2.append(song_target_2)

    return np.array(all_data), np.array(all_target_1), np.array(all_target_2), all_songs_length


def get_data_loader(data_path, batch_size=1):
    data_df = create_big_data_frame(data_path)
    data_ds = songDataset(data_df)
    data_dl = DataLoader(data_ds, batch_size)
    return data_dl
