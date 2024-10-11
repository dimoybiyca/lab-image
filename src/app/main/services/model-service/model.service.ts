import { inject, Injectable, NgZone } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { Subject, take } from 'rxjs';
import { TModelData } from '../../types/model.type';
import { TModelOptions } from '../../types/model-options.type';
import { LoggerService } from '../logger-service/logger.service';
import { StatusService } from '../status-service/status.service';

@Injectable({
  providedIn: 'root',
})
export class ModelService {
  private ngZone: NgZone = inject(NgZone);
  private loggerService: LoggerService = inject(LoggerService);
  private statusService: StatusService = inject(StatusService);

  private modelOptions: TModelOptions = null;
  images: { src: string; label: string }[] = [];
  labels: string[] = [];
  model: TModelData = null;

  $isModel = new Subject<boolean>();
  $isTraining = new Subject<boolean>();

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

  trainModel(): void {
    this.$isTraining.next(true);
    this.$isModel.next(null);
    this.statusService.setStatus(
      'Training model... It may take some time',
      'info'
    );

    try {
      this.ngZone.runOutsideAngular(() => {
        this.trainOptimizedModel().then(() => {
          this.$isTraining.next(false);
          this.statusService.setStatus('Model trained', 'success');
        });
      });
    } catch (error) {
      this.$isTraining.next(false);
      this.$isModel.next(false);
      this.logStatus(`Error training model`);
    }
  }

  async trainOptimizedModel(): Promise<void> {
    this.logStatus('Start training optimized model');
    const startTime = Date.now();

    const model = tf.sequential();
    const xs: tf.Tensor[] = [];
    const ys: tf.Tensor[] = [];

    const labelsSet = new Set<string>();
    this.images.forEach((image) => labelsSet.add(image.label));
    const labelsArray = Array.from(labelsSet);
    const numClasses = labelsArray.length;

    const imagePromises = this.images.map((image, index) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = image.src;
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

          this.logStatus(`Image ${index + 1} loaded`);
        };
      });
    });
    // Wait for all images to be processed
    await Promise.all(imagePromises);
    this.logStatus('All images loaded');

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

    model.add(tf.layers.dense({ units: numClasses, activation: 'softmax' }));
    this.logStatus('Model created, compiling...');

    // Compile the model with Adam optimizer
    model.compile({
      optimizer: tf.train.adam(0.001), // Learning rate 0.001
      loss: this.modelOptions.loss,
      metrics: ['accuracy'],
    });
    this.logStatus('Model compiled, training...');

    // Train the model
    try {
      await model.fit(xsTensor, ysTensor, {
        epochs: this.modelOptions.epochs,
        batchSize: 64,
      });
    } catch (error) {
      this.processError(error);
      throw new Error('Error training model');
    }

    this.model = {
      model,
      labels: this.labels,
      options: this.modelOptions,
    };
    this.$isModel.next(true);
    this.logStatus(`Model trained, time = ${Date.now() - startTime}ms`);
  }
  processError(error: any) {
    this.ngZone.run(() => {
      this.$isTraining.next(false);
      this.$isModel.next(false);
      this.logStatus(`Error training model`);
      this.statusService.setStatus(
        'Error training model. Try another browser or device',
        'error'
      );
    });
  }

  logStatus(message: string): void {
    this.ngZone.run(() => {
      this.loggerService.pushLog(message);
    });
  }

  getLabelIndex(label: string): number {
    return this.labels.indexOf(label);
  }
}
