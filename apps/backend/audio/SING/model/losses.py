import tensorflow as tf
from .processing import *

def spectral_loss(inputs, outputs, epsilon = 1, sampling_rate = 16000, log_scale = False):
    input_spec = tf.math.log(epsilon + get_spectrogram_for_audio(inputs, sampling_rate, log_scale))
    output_spec = tf.math.log(epsilon + get_spectrogram_for_audio(outputs, sampling_rate, log_scale))
    loss = tf.reduce_sum(tf.math.abs(input_spec - output_spec))
    return loss