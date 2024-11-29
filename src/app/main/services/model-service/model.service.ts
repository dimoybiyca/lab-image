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

    const model = this.buildModel();
    const numClasses = this.prepareLabelSet();

    const { xs, ys } = await this.loadAndProcessImages(numClasses);
    const xsTensor = tf.stack(xs);
    const ysTensor = tf.stack(ys).reshape([-1, numClasses]);

    this.logStatus('Model created, compiling...');
    this.compileModel(model);

    this.logStatus('Model compiled, training...');
    await this.train(model, xsTensor, ysTensor);

    this.model = { model, labels: this.labels, options: this.modelOptions };
    this.$isModel.next(true);
    this.logStatus(`Model trained, time = ${Date.now() - startTime}ms`);
  }

  private buildModel(): tf.Sequential {
    const model = tf.sequential();
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
      tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu' })
    );
    model.add(tf.layers.maxPooling2d({ poolSize: [2, 2] }));
    model.add(tf.layers.flatten());
    model.add(
      tf.layers.dense({ units: this.modelOptions.neurons, activation: 'relu' })
    );
    model.add(
      tf.layers.dense({ units: this.prepareLabelSet(), activation: 'softmax' })
    );
    return model;
  }

  private prepareLabelSet(): number {
    const labelsSet = new Set<string>();
    this.images.forEach((image) => labelsSet.add(image.label));
    this.labels = Array.from(labelsSet);
    return this.labels.length;
  }

  private async loadAndProcessImages(
    numClasses: number
  ): Promise<{ xs: tf.Tensor[]; ys: tf.Tensor[] }> {
    const xs: tf.Tensor[] = [];
    const ys: tf.Tensor[] = [];

    const imagePromises = this.images.map((image, index) =>
      this.processImage(image, index, xs, ys, numClasses)
    );
    await Promise.all(imagePromises);

    this.logStatus('All images loaded');
    return { xs, ys };
  }

  private async processImage(
    image: any,
    index: number,
    xs: tf.Tensor[],
    ys: tf.Tensor[],
    numClasses: number
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.src = image.src;
      img.onload = () => {
        const tensor = tf.browser.fromPixels(img);
        const resizedTensor = tf.image.resizeBilinear(tensor, [
          this.modelOptions.shapeh,
          this.modelOptions.shapew,
        ]);
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
  }

  private compileModel(model: tf.Sequential): void {
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: this.modelOptions.loss,
      metrics: ['accuracy'],
    });
  }

  private async train(
    model: tf.Sequential,
    xsTensor: tf.Tensor,
    ysTensor: tf.Tensor
  ): Promise<void> {
    try {
      await model.fit(xsTensor, ysTensor, {
        epochs: this.modelOptions.epochs,
        batchSize: 64,
      });
    } catch (error) {
      this.processError();
      throw new Error('Error training model');
    }
  }

  processError(): void {
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
