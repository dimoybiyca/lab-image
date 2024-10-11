import * as tf from '@tensorflow/tfjs';
import { TModelOptions } from './model-options.type';

export type TModelData = {
  model: tf.Sequential;
  options: TModelOptions;
  labels: string[];
};
