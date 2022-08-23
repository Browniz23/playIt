# this file is based on the file primus.py from
# https://github.com/OMR-Research/tf-end-to-end/blob/master/primus.py

import cv2
import numpy as np
import random

class CTC_PriMuS:
    gt_element_separator = '-'
    PAD_COLUMN = 0
    validation_dict = None


    def __init__(self, corpus_dirpath, corpus_filepath, dictionary_path, distortions = False, val_split = 0.0):
        
        self.distortions = distortions
        self.corpus_dirpath = corpus_dirpath

        # Corpus
        corpus_file = open(corpus_filepath,'r')
        corpus_list = corpus_file.read().splitlines()
        corpus_file.close()

        self.current_idx = 0
        self.current_val_idx = 0
        self.end_val_set = False

        # Dictionary
        self.word2int = {}
        self.int2word = {}
            
        dict_file = open(dictionary_path,'r')
        dict_list = dict_file.read().splitlines()
        for word in dict_list:
            if not word in self.word2int:
                word_idx = len(self.word2int)
                self.word2int[word] = word_idx
                self.int2word[word_idx] = word

        dict_file.close()

        self.vocabulary_size = len(self.word2int)
        
        
        # Train and validation split
        random.shuffle(corpus_list) 
        val_idx = int(len(corpus_list) * val_split) 
        self.training_list = corpus_list[val_idx:]
        self.validation_list = corpus_list[:val_idx]
        
        print ('Training with ' + str(len(self.training_list)) + ' and validating with ' + str(len(self.validation_list)))

    def nextBatch(self, params):
        images = []
        labels = []

        # Read files
        for _ in range(params['batch_size']):
            sample_filepath = self.training_list[self.current_idx]
            sample_fullpath = self.corpus_dirpath + '/' + sample_filepath + '/' + sample_filepath
            
            # IMAGE
            if self.distortions:
                sample_img = cv2.imread(sample_fullpath + '_distorted.jpg', cv2.IMREAD_GRAYSCALE) # Grayscale is assumed
            else:
                sample_img = cv2.imread(sample_fullpath + '.png', cv2.IMREAD_GRAYSCALE)  # Grayscale is assumed!
            
            height = params['img_height']
            sample_img = resize(sample_img,height)
            images.append((255.0-sample_img)/255)

            # GROUND TRUTH
            
            sample_full_filepath = sample_fullpath + '.semantic'
            
            
            sample_gt_file = open(sample_full_filepath, 'r')
            sample_gt_plain = sample_gt_file.readline().rstrip().split('\t')
            sample_gt_file.close()

            labels.append([self.word2int[lab] for lab in sample_gt_plain])

            self.current_idx = (self.current_idx + 1) % len( self.training_list )


        # Transform to batch
        image_widths = [img.shape[1] for img in images]
        max_image_width = max(image_widths)

        batch_images = np.ones(shape=[params['batch_size'],
                                       params['img_channels'],
                                       params['img_height'],
                                       max_image_width], dtype=np.float32)*self.PAD_COLUMN

        for i, img in enumerate(images):
            batch_images[i, 0, 0:img.shape[0], 0:img.shape[1]] = img

        # LENGTH
        width_reduction = 1
        for i in range(params['conv_blocks']):
            width_reduction = width_reduction * 2

        lengths = [ batch_images.shape[3] / width_reduction ] * batch_images.shape[0]

        return {
            'inputs': batch_images,
            'seq_lengths': np.asarray(lengths),
            'targets': labels,
        }
        
    def getValidation(self, params):
        if self.validation_dict == None:                
            images = []
            labels = []
    
            # Read files
            for _ in range(params['batch_size']):
                if self.end_val_set:
                    self.end_val_set = False
                    break
                sample_filepath = self.validation_list[self.current_val_idx]
                sample_fullpath = self.corpus_dirpath + '/' + sample_filepath + '/' + sample_filepath
    
                # IMAGE
                sample_img = cv2.imread(sample_fullpath + '.png', cv2.IMREAD_GRAYSCALE)  # Grayscale is assumed!
                height = params['img_height']
                sample_img = resize(sample_img,height)
                images.append((255.0-sample_img)/255)
    
                # GROUND TRUTH
                sample_full_filepath = sample_fullpath + '.semantic'
                
                
                sample_gt_file = open(sample_full_filepath, 'r')
            
                sample_gt_plain = sample_gt_file.readline().rstrip().split('\t')
                sample_gt_file.close()
    
                labels.append([self.word2int[lab] for lab in sample_gt_plain])
                self.current_val_idx = (self.current_val_idx + 1) % len( self.validation_list )
                if self.current_val_idx == 0:
                    self.end_val_set = True
    
            # Transform to batch
            image_widths = [img.shape[1] for img in images]
            max_image_width = max(image_widths)
    
            batch_images = np.ones(shape=[len(images),
                                           params['img_channels'],
                                           params['img_height'],
                                           max_image_width], dtype=np.float32)*self.PAD_COLUMN
    
            for i, img in enumerate(images):
                batch_images[i, 0, 0:img.shape[0], 0:img.shape[1]] = img
    
            # LENGTH
            width_reduction = 1
            for i in range(params['conv_blocks']):
                width_reduction = width_reduction * 2
    
            lengths = [ batch_images.shape[3] / width_reduction ] * batch_images.shape[0]
    
            self.validation_dict = {
                'inputs': batch_images,
                'seq_lengths': np.asarray(lengths),
                'targets': labels,
            }
            
        
        return self.validation_dict, len(self.validation_list)

def resize(image, height):
    width = int(float(height * image.shape[1]) / image.shape[0])
    sample_img = cv2.resize(image, (width, height))
    return sample_img