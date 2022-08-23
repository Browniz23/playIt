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
from data_loader import get_data_loader
from datetime import datetime


# # check if cuda available
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")


class Classifier(nn.Module):
    def __init__(self, input_size, hidden_layer, output_size):
        super(Classifier, self).__init__()
        self.fc1 = nn.Linear(input_size, hidden_layer)
        self.fc2 = nn.Linear(hidden_layer, output_size)
        self.relu = nn.ReLU()

    def forward(self, X):
        X = self.fc1(X)
        X = self.relu(X)
        X = self.fc2(X)
        return X


class Model(nn.Module):
    def __init__(self, input_size, hidden_size, lstm_layers, n_traget1, n_traget2):
        super(Model, self).__init__()
        #self.lstm_init_state = torch.tensor(np.zeros(input_size))
        self.lstm_hidden_size = hidden_size  # 10
        self.lstm_layers = lstm_layers  # 2
        self.lstm = torch.nn.RNN(input_size=input_size, hidden_size=hidden_size, num_layers=lstm_layers,
                                 batch_first=True, bidirectional=True)  # biLSTM(input_size, hidden_size, layers)
        self.target1_model = Classifier(
            2*hidden_size, hidden_size//2, n_traget1)
        self.target2_model = Classifier(
            2*hidden_size, hidden_size//2, n_traget2)

    def forward(self, X):
        # X.shape=(2,35,32) batch_size,sequence_length,input_size
        # (2*num_layers,batch_size,hidden_size)
        h0 = torch.tensor(
            np.zeros((2*self.lstm_layers, X.size()[0], self.lstm_hidden_size))).float()
        outputs, _ = self.lstm(X, h0)
        all_target1 = []
        all_target2 = []
        for song in outputs:
            song_target1 = []
            song_target2 = []
            for c in song:
                song_target1.append(self.target1_model(c).detach().numpy())
                song_target2.append(self.target2_model(c).detach().numpy())
            all_target1.append(np.array(song_target1))
            all_target2.append(np.array(song_target2))
        return np.array(all_target1), np.array(all_target2)


def train(epoch, training_loader, model, optimizer, loss_fn):
    model.train()
    for i in range(epoch):
        sum_loss = 0
        n_batches = 0

        for (data, targets1, targets2, lengthes) in training_loader:
            n_batches += 1
            data = data.float()
            data = data.to(device)
            outputs = model(data)

            target1 = torch.Tensor(np.argmax(outputs[0], axis=2))
            target2 = torch.Tensor(np.argmax(outputs[1], axis=2))

            optimizer.zero_grad()
            loss = loss_fn(target1.to(device), targets1.to(device))
            # loss += loss_fn(target2.to(device), targets2.to(device))
            sum_loss += loss
            loss = Variable(loss, requires_grad=True)
            loss.backward()
            optimizer.step()


# predict given test data and write results to file
def predict(model, test_loader):
    model.eval()
    with torch.no_grad():
        for data in test_loader:
            outputs = model(data[0].float().to(device))
            target1 = torch.Tensor(np.argmax(outputs[0], axis=2))
            target2 = torch.Tensor(np.argmax(outputs[1], axis=2))
            pred1 = target1.max(1, keepdim=True)[1]
            pred2 = target2.max(1, keepdim=True)[1]
            print(target1)
            print(target2)
            break


if __name__ == '__main__':
    model = Model(input_size=32, hidden_size=10,
                  lstm_layers=2, n_traget1=14, n_traget2=33)
    optimizer = torch.optim.Adam(model.parameters(), lr=0.1)
    loss_fn = torch.nn.CrossEntropyLoss()
    now = datetime.now()
    current_time = now.strftime("%H:%M:%S")
    print("Begin Time =", current_time)
    train_dl = get_data_loader('data/csv_train', 2)
    train(5, train_dl, model, optimizer, loss_fn)
    # test_df = create_big_data_frame('data/csv_test')
    # test_ds = songDataset(test_df)
    # test_dl = DataLoader(test_ds)
    # predict(model, test_dl)
    torch.save(model.state_dict(), 'trained_model/trained_model.pt')
    now = datetime.now()
    current_time = now.strftime("%H:%M:%S")
    print("End Time =", current_time)
