import tensorflow as tf
import numpy as np
import os
import librosa
from model.conv_ae import ConvolutionalAutoencoder

def power_spectrogram(waveform):
	stft = librosa.stft(waveform, n_fft = 1024, hop_length = 256)

def spectral_loss(x, y):
	log_spec_x = tf.log(eps + power_spectrogram(x))
	log_spec_y = tf.log(eps + power_spectrogram(y))
	return tf.keras.losses.mse(log_spec_y, log_spec_x)

# Prepare NSynth TFRecordDataset to pass to model
def prepare_nsynth_dataset(dataset):
    def process_parsed_features(point):
        instrument = tf.one_hot(point['instrument'], 1006)
        pitch = tf.one_hot(point['pitch'], 21)
        velocity = tf.one_hot(point['velocity'], 5)
        audio = point['audio']
        inputs = tf.concat([instrument, pitch, velocity], axis = 0)
        return {'inputs': inputs, 'outputs': audio}

    def parse_nsynth(example_proto):
        features = {
            "audio": tf.io.FixedLenFeature((4 * 16000), tf.float32),
            "note": tf.io.FixedLenFeature((), dtype = tf.int64),
            "note_str": tf.io.FixedLenFeature((), dtype = tf.string),
            "instrument": tf.io.FixedLenFeature((), dtype = tf.int64),
            "instrument_str": tf.io.FixedLenFeature((), dtype = tf.string),
            "instrument_source": tf.io.FixedLenFeature((), dtype = tf.int64),
            "instrument_source_str": tf.io.FixedLenFeature((), dtype = tf.string),
            "instrument_family_str": tf.io.FixedLenFeature((), dtype = tf.string),
            "sample_rate": tf.io.FixedLenFeature((), dtype = tf.int64),
            "velocity": tf.io.FixedLenFeature((), dtype = tf.int64),
            "pitch": tf.io.FixedLenFeature((), dtype = tf.int64),
        }
        parsed_features = tf.io.parse_single_example(example_proto, features)
        return process_parsed_features(parsed_features)

    def tfr_dataset_eager(data, batch_size):
        data = data.apply(tf.data.experimental.shuffle_and_repeat(10000))
        data = data.apply(tf.data.experimental.map_and_batch(map_func = parse_nsynth, batch_size = batch_size))
        data = data.prefetch(1)
        return data

    return tfr_dataset_eager(dataset, 1)

def run_training(params):
	dataset = tf.data.TFRecordDataset('/data/NSynth/nsynth-train.tfrecord')
	nsynth_dev = prepare_nsynth_dataset(dataset)

	conv_ae = ConvolutionalAutoencoder()
	conv_ae.train(nsynth_dev)


run_training({})