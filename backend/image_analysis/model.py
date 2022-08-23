from os import device_encoding
from turtle import forward
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
import numpy as np



class Model(nn.Module):
    def __init__(self, vocab_size):
        super(Model, self).__init__()
        
        self.conv1 = nn.Sequential(
            nn.Conv2d(1, 32, 3, padding=1),
            nn.BatchNorm2d(32),
            nn.LeakyReLU(0.2, inplace=True),
            nn.MaxPool2d((2,2),(2,2))
		)

        self.conv2 = nn.Sequential(
            nn.Conv2d(32, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.LeakyReLU(0.2, inplace=True),
            nn.MaxPool2d((2,2),(2,2))
		)
        
        self.conv3 = nn.Sequential(
            nn.Conv2d(64, 128, 3, padding=1),
            nn.BatchNorm2d(128),
            nn.LeakyReLU(0.2, inplace=True),
            nn.MaxPool2d((2,2),(2,2))
		)

        self.conv4 = nn.Sequential(
            nn.Conv2d(128, 256, 3, padding=1),
            nn.BatchNorm2d(256),
            nn.LeakyReLU(0.2, inplace=True),
            nn.MaxPool2d((2,2),(2,2))
		)

        self.rnn = nn.LSTM(input_size=int(256*(128/(2**4))), hidden_size=512, num_layers=2, dropout=0.5, bidirectional=True)

        self.pred = nn.Linear(2*512, vocab_size + 1)

        self.sm = nn.LogSoftmax(2)

    def forward(self, x):
        x_shape = x.shape
        # print(x.shape)
        x = self.conv1(x)
        x = self.conv2(x)
        x = self.conv3(x)
        x = self.conv4(x)

        x = x.permute(3, 0, 2, 1)
        # print(x.shape)
        new_shape = (int(x_shape[3]/(2**4)), x_shape[0], int(256*(128/(2**4))))
        x = torch.reshape(x, new_shape)
        # print(x.shape)
        x, _ = self.rnn(x)

        x = self.pred(x)
        # print(x)
        # x = self.sm(x)
        # torch.set_printoptions(profile="full")
        # print(x.shape)
        # print(x)
        # print(torch.argmax(x[0][0]))

        return x

    


