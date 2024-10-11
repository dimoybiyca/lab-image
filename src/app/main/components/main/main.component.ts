import { DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import * as tf from '@tensorflow/tfjs';
import { ImagesLoaderComponent } from '../images-loader/images-loader.component';
import { ModelOptionsComponent } from '../model-options/model-options.component';
import { StatusBarComponent } from '../status-bar/status-bar.component';
import { StatusService } from '../../services/status-service/status.service';
import { ButtonModule } from 'primeng/button';
import { TrainModelComponent } from '../train-model/train-model.component';
import { TestModelComponent } from '../test-model/test-model.component';
import { ModelService } from '../../services/model-service/model.service';
import { LoggerService } from '../../services/logger-service/logger.service';
import { LoggerComponent } from '../logger/logger.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    RouterOutlet,
    NgIf,
    NgFor,
    DecimalPipe,
    FormsModule,
    ButtonModule,
    ImagesLoaderComponent,
    ModelOptionsComponent,
    StatusBarComponent,
    NgClass,
    TrainModelComponent,
    TestModelComponent,
    LoggerComponent,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements OnInit {
  private statusService: StatusService = inject(StatusService);
  private modelService: ModelService = inject(ModelService);
  private loggerService: LoggerService = inject(LoggerService);

  onModeSet(mode: string) {
    if (mode === 'test' && !this.modelService.model) {
      return;
    }
    this.mode = mode;
  }

  images: { src: string; label: string }[] = [];
  model: tf.Sequential = null;
  predictions: { src: string; label: string }[] = [];
  labels: string[] = [];
  mode: string = 'data';

  ngOnInit(): void {
    this.setStatus();
    tf.setBackend('webgl');

    if (tf.getBackend() !== 'webgl') {
      this.loggerService.pushLog(
        'WebGL is not available, falling back to CPU backend'
      );
      tf.setBackend('cpu');
    }

    this.loggerService.pushLog('Application started');
    this.loggerService.pushLog(`TensorFlow.js version: ${tf.version_core}`);
    this.loggerService.pushLog(`Using ${tf.getBackend()} backend`);
  }

  onImagesChanged($event: { src: string; label: string }[]): void {
    this.images = $event;
    this.labels = Array.from(new Set(this.images.map((image) => image.label)));

    this.setStatus();
  }

  setStatus(): void {
    if (this.labels.some((label) => !label)) {
      this.statusService.setStatus('LABELS_SHOULD_NOT_BE_EMPTY', 'error');
      return;
    }

    if (this.labels.length < 2) {
      this.statusService.setStatus('NOT_ENOUGH_LABELS', 'error');
      return;
    }

    const minImagesPerLabel = 20;
    const imagesPerLabel = this.labels.map(
      (label) => this.images.filter((image) => image.label === label).length
    );
    if (imagesPerLabel.some((count) => count < minImagesPerLabel)) {
      this.statusService.setStatus('NOT_ENOUGH_IMAGES', 'warning');
      return;
    }

    if (this.model) {
      this.statusService.setStatus('MODEL_TRAINED', 'success');
    }
  }

  async trainModel() {
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
          const resizedTensor = tf.image.resizeBilinear(tensor, [128, 128]);
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

    this.model = tf.sequential();
    this.model.add(
      tf.layers.conv2d({
        inputShape: [128, 128, 3],
        filters: 32,
        kernelSize: 3,
        activation: 'relu',
      })
    );
    this.model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    this.model.add(
      tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu' })
    );
    this.model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    this.model.add(tf.layers.flatten());
    this.model.add(tf.layers.dense({ units: 128, activation: 'relu' }));
    this.model.add(
      tf.layers.dense({ units: numClasses, activation: 'softmax' })
    );

    this.model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });

    await this.model.fit(xsTensor, ysTensor, { epochs: 10 });

    console.log('Model trained');
  }

  getLabelIndex(label: string): number {
    return this.labels.indexOf(label);
  }
}
