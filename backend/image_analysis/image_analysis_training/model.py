import torch
import torch.nn as nn



params = {
    'l1': 32,
    'l2': 64,
    'l3': 128,
    'l4': 256,
    'kernel_size': 3,
    'max_pool': (2,2)
}

class Model(nn.Module):
    def __init__(self, vocab_size):
        super(Model, self).__init__()
        
        self.conv1 = nn.Sequential(
            nn.Conv2d(1, params['l1'], params['kernel_size'], padding=1),
            nn.BatchNorm2d(params['l1']),
            nn.LeakyReLU(0.2, inplace=True),
            nn.MaxPool2d(params['max_pool'] ,params['max_pool'])
		)

        self.conv2 = nn.Sequential(
            nn.Conv2d(params['l1'], params['l2'], params['kernel_size'], padding=1),
            nn.BatchNorm2d(params['l2']),
            nn.LeakyReLU(0.2, inplace=True),
            nn.MaxPool2d(params['max_pool'] ,params['max_pool'])
		)
        
        self.conv3 = nn.Sequential(
            nn.Conv2d(params['l2'], params['l3'], params['kernel_size'], padding=1),
            nn.BatchNorm2d(params['l3']),
            nn.LeakyReLU(0.2, inplace=True),
            nn.MaxPool2d(params['max_pool'] ,params['max_pool'])
		)

        self.conv4 = nn.Sequential(
            nn.Conv2d(params['l3'], params['l4'], params['kernel_size'], padding=1),
            nn.BatchNorm2d(params['l4']),
            nn.LeakyReLU(0.2, inplace=True),
            nn.MaxPool2d(params['max_pool'] ,params['max_pool'])
		)

        self.rnn = nn.LSTM(input_size=int(params['l4']*(128/(2**4))), hidden_size=512, num_layers=2, dropout=0.5, bidirectional=True)

        self.pred = nn.Linear(2*512, vocab_size + 1)

        self.sm = nn.LogSoftmax(2)

    def forward(self, x):
        x_shape = x.shape # (batch, chunnel, high, width)
        x = self.conv1(x)
        x = self.conv2(x)
        x = self.conv3(x)
        x = self.conv4(x)
        x = x.permute(3, 0, 2, 1) # (width, batch, high,chunnel)
        new_shape = (int(x_shape[3]/(2**4)), x_shape[0], int(params['l4']*(128/(2**4))))
        x = torch.reshape(x, new_shape)
        x, _ = self.rnn(x)
        x = self.pred(x)
        x = self.sm(x)
        

        return x

    


