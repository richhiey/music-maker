import tensorflow as tf
import numpy as np
import os

class SequenceEncoder(tf.keras.Model):
    def __init__(self, params = {}):
        super(SequenceEncoder, self).__init__(params)
        # Instr embedding size - 16
        self.instr_dim_size = 1006
        self.instr_embedding_size = 16

        # Pitch embedding size - 8
        self.pitch_dim_size = 128
        self.pitch_embedding_size = 8

        # Velocity embedding size - 2
        self.vel_dim_size = 128
        self.vel_embedding_size = 2

        # Time embedding size - 4
        self.time_dim_size = 250
        self.time_embedding_size = 4

        self.original_input_size = self.instr_dim_size + self.pitch_dim_size + self.vel_dim_size + self.time_dim_size 
        self.embedding_input_size = self.instr_embedding_size + self.pitch_embedding_size + self.vel_embedding_size + self.time_embedding_size
        self.sequence_generator = self.build_encoder()

    def build_encoder(self, use_embed = True, use_time_embed = True):
        instrument = tf.keras.Input(shape=(None, ), name = 'instrument')
        pitch = tf.keras.Input(shape=(None, ), name = 'pitch')
        velocity = tf.keras.Input(shape=(None, ), name = 'velocity')
        time = tf.keras.Input(shape=(None, ), name = 'time')

        instrument_embed = tf.keras.layers.Embedding(self.instr_dim_size, self.instr_embedding_size)(instrument)
        pitch_embed = tf.keras.layers.Embedding(self.pitch_dim_size, self.pitch_embedding_size)(pitch)
        velocity_embed = tf.keras.layers.Embedding(self.vel_dim_size, self.vel_embedding_size)(velocity)
        time_embed = tf.keras.layers.Embedding(self.time_dim_size, self.time_embedding_size)(time)

        inputs = tf.keras.layers.concatenate([instrument_embed, pitch_embed, velocity_embed, time_embed])

        lstm_1 = tf.keras.layers.LSTM(units = 1024, return_sequences = True)(inputs)
        lstm_2 = tf.keras.layers.LSTM(units = 1024, return_sequences = True)(lstm_1)
        lstm_3 = tf.keras.layers.LSTM(units = 1024, return_sequences = True)(lstm_2)
        output = tf.keras.layers.Dense(128)(lstm_3)
        model = tf.keras.models.Model(inputs = [instrument, pitch, velocity, time], outputs = output)
        return model

    def call(self, instr, pitch, velocity, timesteps, batch_size = 64):
        instrument = tf.stack([instr] * timesteps, axis = 1)
        pitch = tf.stack([pitch] * timesteps, axis = 1)
        velocity = tf.stack([velocity] * timesteps, axis = 1)
        
        def get_time_stuff(timesteps):
            return tf.squeeze(tf.stack([tf.expand_dims(tf.range(1, timesteps + 1, 1), axis = 0)] * batch_size, axis = 0))

        time = get_time_stuff(timesteps)
        return self.sequence_generator([instrument, pitch, velocity, time])