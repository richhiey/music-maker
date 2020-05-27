import os
import tensorflow as tf
import numpy as np
import itertools
from .processing import *
from .losses import *
from .tensorboard import *

class ConvolutionalEncoder(tf.keras.Model):
    def __init__(self):
        super(ConvolutionalEncoder, self).__init__(name = "ConvolutionalEncoder")
        self.model = self.build_encoder()

    def build_encoder(self):
        model = tf.keras.models.Sequential()
        model.add(tf.keras.layers.InputLayer(
            input_shape = (64000, 1)))
        model.add(tf.keras.layers.Conv1D(
            filters = 4096,
            kernel_size = 1024,
            strides = 256,
            padding = 'SAME'))
        model.add(tf.keras.layers.Activation('relu'))
        model.add(tf.keras.layers.Conv1D(
            filters = 4096,
            kernel_size = 1,
            strides = 1,
            padding = 'SAME'))
        model.add(tf.keras.layers.Activation('relu'))
        model.add(tf.keras.layers.Conv1D(
            filters = 4096,
            kernel_size = 1,
            strides = 1,
            padding = 'SAME'))
        model.add(tf.keras.layers.Activation('relu'))
        model.add(tf.keras.layers.Conv1D(
            filters = 128,
            kernel_size = 1,
            strides = 1,
            padding = 'SAME'))
        return model

    def call(self, x):
        return self.model(x)

class ConvolutionalDecoder(tf.keras.Model):
    def __init__(self):
        super(ConvolutionalDecoder, self).__init__(name = "ConvolutionalDecoder")
        self.model = self.build_decoder()

    def build_decoder(self):
        model = tf.keras.models.Sequential()
        model.add(tf.keras.layers.InputLayer(
            input_shape = (250, 128)))
        model.add(tf.keras.layers.Conv1D(
            filters = 4096,
            kernel_size = 9,
            strides = 1,
            padding = 'SAME'))
        model.add(tf.keras.layers.Activation('relu'))
        model.add(tf.keras.layers.Conv1D(
            filters = 4096,
            kernel_size = 1,
            strides = 1,
            padding = 'SAME'))
        model.add(tf.keras.layers.Activation('relu'))
        model.add(tf.keras.layers.Conv1D(
            filters = 4096,
            kernel_size = 1,
            strides = 1,
            padding = 'SAME'))
        model.add(tf.keras.layers.Activation('relu'))
        model.add(tf.keras.layers.Lambda(
            lambda x: tf.expand_dims(x, axis = 1)
        ))
        model.add(tf.keras.layers.Conv2DTranspose(
            filters = 1,
            kernel_size = (1,1024),
            strides = (1,256),
            padding = "SAME"))
        model.add(tf.keras.layers.Lambda(
            lambda x: tf.squeeze(x, axis = [1,3])
        ))
        return model

    def call(self, x):
        return self.model(x)

class ConvolutionalAutoencoder(tf.keras.Model):
    def __init__(self):
        super(ConvolutionalAutoencoder, self).__init__()
        # Extra variables
        self.learning_rate = 0.0003
        self.epochs = 25
        self.model_log_dir = 'model_logs_conv_ae/'
        self.optimizer = tf.keras.optimizers.Adam(learning_rate = self.learning_rate)
        self.num_steps_checkpoint = 1000
        self.num_outputs = 3
        self.sampling_rate = 16000
        
        # Model variables
        print('Building Convolutional Encoder ..')
        self.inference_net = ConvolutionalEncoder()
        print('Building Convolutional Decoder ..')
        self.generative_net = ConvolutionalDecoder()
        print('Built Convolutional Autoencoder!')

    def call(self, inputs):
        return self.generative_net(self.inference_net(inputs))

    def encode(self, x):
        return self.inference_net(x)

    def decode(self, z, apply_sigmoid = False):
        logits = self.generative_net(z)
        if apply_sigmoid:
            probs = tf.sigmoid(logits)
            return probs
        return logits

    def train_step(self, waveform, loss_type = 'MSE'):        
        with tf.GradientTape() as tape:
            encoding = self.inference_net(waveform)
            decoding = self.generative_net(encoding)
            target_wav = tf.squeeze(waveform, axis=2)
            if loss_type == 'MSE':
                loss = tf.keras.losses.MSE(target_wav, decoding)
            else:
                print('TODO - spectral_loss')
        grads = tape.gradient(loss, self.trainable_variables)
        grads_and_vars = zip(grads, self.trainable_variables)
        self.optimizer.apply_gradients(grads_and_vars)
        return decoding, loss, grads

    def train(self, dataset):
        ckpt = tf.train.Checkpoint(step = tf.Variable(1), optimizer = self.optimizer, net = self)
        manager = get_tensorflow_checkpoint(
            ckpt,
            self.optimizer,
            self.model_log_dir
        )
        for i in range(self.epochs):
            print('-------------------- EPOCH ' + str(i) + ' ------------------------')
            for data in dataset:
                output_wav, loss, grads = self.train_step(tf.expand_dims(data['outputs'], axis=-1))
                step = int(ckpt.step)
                log_stuff_to_tensorboard(
                    step,
                    tf.reduce_sum(loss),
                    grads
                )
                if step % self.num_steps_checkpoint == 0:
                    print("============== STEP " + str(step) + " ==============")
                    log_statistics_to_console(
                        tf.reduce_sum(loss)
                    )
                    log_training_audio_to_notebook(
                        data['outputs'],
                        output_wav,
                        num_outputs = self.num_outputs,
                        audio_sampling_rate = self.sampling_rate
                    )
                    save_path = manager.save()
                    print("Saved checkpoint for step {}: {}".format(step, save_path))
                    print("============== STEP END ==============")
                ckpt.step.assign_add(1)
            print('-------------------- EPOCH ' + str(i) + ' END ------------------------')
        self.save('trained_models/conv_ae_model.h5')