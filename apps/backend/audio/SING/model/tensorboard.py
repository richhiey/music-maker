import tensorflow as tf

def log_stuff_to_tensorboard(step, loss, grads):
    tf.summary.scalar('Conv_AE_Loss', tf.reduce_sum(loss), step = step)
    # for i, grad in enumerate(grads):
    #     print(i)
    #     tf.summary.histogram('Gradient-' + str(i), grad)
