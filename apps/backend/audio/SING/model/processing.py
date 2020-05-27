import os
import tensorflow as tf
import numpy as np
import librosa
import IPython
import matplotlib
import datasets as dataset_utils
import librosa
import librosa.display
import matplotlib.pyplot as plt

def get_tensorflow_checkpoint(ckpt, optimizer, model_checkpoint_dir, max_to_keep = 3):
    manager = tf.train.CheckpointManager(
        ckpt,
        model_checkpoint_dir,
        max_to_keep = max_to_keep
    )
    ckpt.restore(manager.latest_checkpoint)
    if manager.latest_checkpoint:
        print("Restored from {}".format(manager.latest_checkpoint))
    else:
        print("Initializing model from scratch.")
    return manager


def log_statistics_to_console(loss):
    print('Printing to console training statistics -')
    print(loss)
    print('Printing training statistics done!')

def get_all_trainable_variables(trainable_sub_models = []):
    trainable_variables = []
    for model in trainable_sub_models:
        for var in model.trainable_variables:
            trainable_variables.append(var)
    return trainable_variables

def log_training_audio_to_notebook(data, generated_wav, num_outputs = 1, audio_sampling_rate = 16000):
    print('------------- Generating audio ---------------')
    print('Original audio waveforms - ')
    real_wav = data['outputs']
    note_str = data['inputs']['note_str'].numpy()
    instr = data['inputs']['instrument_str'].numpy()
    instr_family = data['inputs']['instrument_family_str'].numpy()
    instr_src = data['inputs']['instrument_source_str'].numpy()
    for j in range(num_outputs):
        print('Instrument - ' + str(instr[j]))
        print('Instrument Family - ' + str(instr_family[j]))
        print('Instrument Source - ' + str(instr_src[j]))
        print('Note - ' + str(note_str[j]))
        spec = get_spectrogram_for_audio(real_wav[j,:])
        plot_spectrogram(spec)
        IPython.display.display(
            IPython.display.Audio(
                real_wav[j,:],
                rate = audio_sampling_rate
            )
        )
        

    print('Generated audio waveforms -')
    for j in range(num_outputs):
        spec = get_spectrogram_for_audio(generated_wav[j,:])
        plot_spectrogram(spec)
        IPython.display.display(
            IPython.display.Audio(
                generated_wav[j,:],
                rate = audio_sampling_rate
            )
        )
    print('--------------- Generated audio! ---------------')

def get_spectrogram_for_audio(audio, log_scale = True, sampling_rate = 16000):
    spec = librosa.feature.melspectrogram(audio.numpy(), sr = sampling_rate, n_mels = 128)
    if log_scale:
        spec = librosa.amplitude_to_db(spec, np.max)
    return spec

def plot_spectrogram(spec, sampling_rate = 16000):
    plt.figure(figsize=(12,4))
    librosa.display.specshow(spec, sr = sampling_rate, x_axis = 'time', y_axis = 'mel')
    plt.title('mel power spectrogram')
    plt.colorbar(format = '%+02.0f dB')
    plt.tight_layout()
    plt.show()