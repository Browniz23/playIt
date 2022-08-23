import torch
import torch.nn as nn
import torch.optim as optim

import dataLoad
import model


def train_model():
    data_path = 'primus_data/package_aa' # data
    train_list = 'train.txt' # list of train dataset
    vocabulary = 'vocabulary_semantic.txt' # list of the lables

    # if not on gpu delete next line
    device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')

    # data loader
    load_data = dataLoad.CTC_PriMuS(data_path, train_list, vocabulary, val_split=0.1)

    # ephoc
    ephoc_to_full_data = int(len(load_data.training_list)/16)
    ephoc = ephoc_to_full_data*15
    
    # init model
    running_loss = 0
    crnn_model = model.Model(load_data.vocabulary_size)
    crnn_model.to(device)
    optimizer = optim.Adam(crnn_model.parameters(), 0.0001)
    criterion = nn.CTCLoss(blank=load_data.vocabulary_size, zero_infinity=True)
    
    # params to dataloader
    params = {
        'batch_size':16,
        'img_height':128,
        'img_channels':1,
        'conv_blocks':4
    }

    # every image width is diffrent
    # this function fill the width of images with undefine note
    def fill_data(targets):
        lengthes = []
        for tar in targets:
            lengthes.append(len(tar))
        max_len = max(lengthes)
        
        for tar in targets:
            
            while len(tar) < max_len:
                tar.append(load_data.vocabulary_size)
        return targets, lengthes

    # training loop
    for i in range(ephoc):
        

        # load batch
        batch = load_data.nextBatch(params)
        x = torch.Tensor(batch['inputs'])
        targets, lengthes = fill_data(batch['targets'])
        
        # if not on gpu delete next line
        x = x.cuda()
        x.to(device)

        # forward
        optimizer.zero_grad()
        train_outputs = crnn_model(x)
        
        # loss
        seq_len = torch.Tensor(batch['seq_lengths']).to(torch.int32)
        lengthes = torch.Tensor(lengthes).to(torch.int32)
        loss = criterion(train_outputs, torch.Tensor(targets), seq_len, lengthes)
        loss.backward()
        optimizer.step()
        running_loss += loss.item()

        # validation
        if i % ephoc_to_full_data == 0 and i != 0:
            print(f'Ephoc {i} loss={running_loss/ephoc_to_full_data}')

            # load batch
            val_batch, val_size = load_data.getValidation(params)

            with torch.no_grad():

                running_valid_loss = 0
                counter = 0
                len_count = 0
                
                # loop over validation set
                while len_count < val_size:
                    
                    if len_count!=0:
                        val_batch, val_size = load_data.getValidation(params)
                    
                    # get data
                    valid_x = val_batch['inputs']
                    valid_targets = val_batch['targets']
                    valid_input = torch.Tensor(valid_x)
                    val_batch_targets, valid_lengthes = fill_data(valid_targets)

                    # if not on gpu delete next line
                    valid_input = valid_input.cuda()

                    # validation forward
                    valid_output = crnn_model(valid_input.to(device))

                    # valid loss
                    valid_seq_len = torch.Tensor(val_batch['seq_lengths']).to(torch.int32)
                    valid_lengthes = torch.Tensor(valid_lengthes).to(torch.int32)
                    valid_loss = criterion(valid_output, torch.Tensor(val_batch_targets), valid_seq_len, valid_lengthes)
                    running_valid_loss += valid_loss.item()
                    
                    counter+=1
                    len_count+=len(valid_x)
            
            print(f'Valid loss={running_valid_loss/counter}')
        
        # save model
        torch.save(crnn_model, './trained_model', _use_new_zipfile_serialization=False)
        running_loss = 0