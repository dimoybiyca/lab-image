import { Injectable } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { Subject, take } from 'rxjs';
import { TModelData } from '../../types/model.type';
import { TModelOptions } from '../../types/model-options.type';

@Injectable({
  providedIn: 'root',
})
export class ModelService {
  private modelOptions: TModelOptions = null;
  private images: { src: string; label: string }[] = [];
  private labels: string[] = [];
  model: TModelData = null;

  $isModel = new Subject<boolean>();

  saveModelOptions(modelOptions: TModelOptions): void {
    this.modelOptions = modelOptions;
  }

  getModelOptions(): any {
    return this.modelOptions;
  }

  saveImages(images: { src: string; label: string }[]): void {
    this.images = images;
    this.labels = Array.from(new Set(this.images.map((image) => image.label)));
  }

  trainModel(modelName: string): void {
    console.log(modelName);
    console.log(this.modelOptions);

    this.trainOptimizedModel(modelName).then(() => {});
    return;

    if (this.modelOptions.layers === 7) {
      this.trainModel7L(modelName).then(() => {});
    } else {
      this.trainModel3L(modelName).then(() => {});
    }
  }

  async trainOptimizedModel(modelName: string): Promise<void> {
    const model = tf.sequential();
    const xs: tf.Tensor[] = [];
    const ys: tf.Tensor[] = [];

    const labelsSet = new Set<string>();
    this.images.forEach((image) => labelsSet.add(image.label));
    const labelsArray = Array.from(labelsSet);
    const numClasses = labelsArray.length;

    for (const image of this.images) {
      const img = new Image();
      img.src = image.src;
      await new Promise<void>((resolve) => {
        img.onload = () => {
          const tensor = tf.browser.fromPixels(img);
          const resizedTensor = tf.image.resizeBilinear(tensor, [
            this.modelOptions.shapeh,
            this.modelOptions.shapew,
          ]);
          // Normalize the pixel values (0-255) to (0-1)
          const normalizedTensor = resizedTensor.div(tf.scalar(255));
          xs.push(normalizedTensor);

          const labelIndex = this.getLabelIndex(image.label);
          const oneHotLabel = tf.oneHot(
            tf.tensor1d([labelIndex], 'int32'),
            numClasses
          );
          ys.push(oneHotLabel);
          resolve();
        };
      });
    }

    const xsTensor = tf.stack(xs);
    const ysTensor = tf.stack(ys).reshape([-1, numClasses]);

    // Optimized model with convolutional and pooling layers
    model.add(
      tf.layers.conv2d({
        inputShape: [this.modelOptions.shapeh, this.modelOptions.shapew, 3],
        filters: 32,
        kernelSize: 3,
        activation: 'relu',
      })
    );
    model.add(tf.layers.maxPooling2d({ poolSize: [2, 2] }));

    model.add(
      tf.layers.conv2d({
        filters: 64,
        kernelSize: 3,
        activation: 'relu',
      })
    );
    model.add(tf.layers.maxPooling2d({ poolSize: [2, 2] }));

    model.add(tf.layers.flatten());

    model.add(
      tf.layers.dense({ units: this.modelOptions.neurons, activation: 'relu' })
    );

    // Add dropout to reduce overfitting
    model.add(tf.layers.dropout({ rate: 0.5 }));

    model.add(tf.layers.dense({ units: numClasses, activation: 'softmax' }));

    // Compile the model with Adam optimizer
    model.compile({
      optimizer: tf.train.adam(0.001), // Learning rate 0.001
      loss: this.modelOptions.loss,
      metrics: ['accuracy'],
    });

    // Train the model
    await model.fit(xsTensor, ysTensor, {
      epochs: this.modelOptions.epochs,
      batchSize: 128,
    });

    this.model = {
      model,
      labels: this.labels,
      name: modelName,
      options: this.modelOptions,
    };
    this.$isModel.next(true);
    console.log('Optimized Model saved');
  }

  async trainModel3L(modelName: string): Promise<void> {
    const model = tf.sequential();
    const xs: tf.Tensor[] = [];
    const ys: tf.Tensor[] = [];

    const labelsSet = new Set<string>();
    this.images.forEach((image) => labelsSet.add(image.label));
    const labelsArray = Array.from(labelsSet);
    const numClasses = labelsArray.length;

    for (const image of this.images) {
      const img = new Image();
      img.src = image.src;
      await new Promise<void>((resolve) => {
        img.onload = () => {
          const tensor = tf.browser.fromPixels(img);
          const resizedTensor = tf.image.resizeBilinear(tensor, [
            this.modelOptions.shapeh,
            this.modelOptions.shapew,
          ]);
          xs.push(resizedTensor);

          const labelIndex = this.getLabelIndex(image.label);
          const oneHotLabel = tf.oneHot(
            tf.tensor1d([labelIndex], 'int32'),
            numClasses
          );
          ys.push(oneHotLabel);
          resolve();
        };
      });
    }

    const xsTensor = tf.stack(xs);
    const ysTensor = tf.stack(ys).reshape([-1, numClasses]);

    model.add(
      tf.layers.flatten({
        inputShape: [this.modelOptions.shapeh, this.modelOptions.shapew, 3],
      })
    );
    model.add(
      tf.layers.dense({ units: this.modelOptions.neurons, activation: 'relu' })
    );
    model.add(tf.layers.dense({ units: numClasses, activation: 'softmax' }));

    model.compile({
      optimizer: this.modelOptions.optimizer,
      loss: this.modelOptions.loss,
      metrics: ['accuracy'],
    });

    await model.fit(xsTensor, ysTensor, { epochs: this.modelOptions.epochs });

    this.model = {
      model,
      labels: this.labels,
      name: modelName,
      options: this.modelOptions,
    };
    this.$isModel.next(true);
    console.log('Model saved');
  }

  async trainModel7L(modelName: string): Promise<void> {
    console.log('Training model with 7 layers');

    const model = tf.sequential();
    const xs: tf.Tensor[] = [];
    const ys: tf.Tensor[] = [];

    const labelsSet = new Set<string>();
    this.images.forEach((image) => labelsSet.add(image.label));
    const labelsArray = Array.from(labelsSet);
    const numClasses = labelsArray.length;

    for (const image of this.images) {
      const img = new Image();
      img.src = image.src;
      await new Promise<void>((resolve) => {
        img.onload = () => {
          const tensor = tf.browser.fromPixels(img);
          const resizedTensor = tf.image.resizeBilinear(tensor, [
            this.modelOptions.shapeh,
            this.modelOptions.shapew,
          ]);
          xs.push(resizedTensor);

          const labelIndex = this.getLabelIndex(image.label);
          const oneHotLabel = tf.oneHot(
            tf.tensor1d([labelIndex], 'int32'),
            numClasses
          );
          ys.push(oneHotLabel);
          resolve();
        };
      });
    }

    const xsTensor = tf.stack(xs);
    const ysTensor = tf.stack(ys).reshape([-1, numClasses]);

    model.add(
      tf.layers.conv2d({
        inputShape: [this.modelOptions.shapeh, this.modelOptions.shapew, 3],
        filters: 32,
        kernelSize: 3,
        activation: 'relu',
      })
    );
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    model.add(
      tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu' })
    );
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    model.add(tf.layers.flatten());
    model.add(
      tf.layers.dense({ units: this.modelOptions.neurons, activation: 'relu' })
    );
    model.add(tf.layers.dense({ units: numClasses, activation: 'softmax' }));

    model.compile({
      optimizer: this.modelOptions.optimizer,
      loss: this.modelOptions.loss,
      metrics: ['accuracy'],
    });

    await model.fit(xsTensor, ysTensor, { epochs: this.modelOptions.epochs });

    this.model = {
      model,
      labels: this.labels,
      name: modelName,
      options: this.modelOptions,
    };
    this.$isModel.next(true);
    console.log('Model saved');
  }

  getLabelIndex(label: string): number {
    return this.labels.indexOf(label);
  }
}
