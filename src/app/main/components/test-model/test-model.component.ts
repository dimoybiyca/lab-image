import { Component, inject } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { ButtonModule } from 'primeng/button';
import { Subject } from 'rxjs';
import { ModelService } from '../../services/model-service/model.service';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { NgZone } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-test-model',
  standalone: true,
  imports: [ButtonModule, AsyncPipe, DecimalPipe, ProgressBarModule],
  templateUrl: './test-model.component.html',
  styleUrl: './test-model.component.scss',
})
export class TestModelComponent {
  private ngZone: NgZone = inject(NgZone);
  private modelService: ModelService = inject(ModelService);

  isLoading: boolean = false;
  total: number = 0;
  loaded: number = 0;

  predictions: {
    src: string;
    label: string;
    probabilities: { label: string; probability: number }[];
  }[] = [];
  $isModel: Subject<boolean> = this.modelService.$isModel;

  async onTestFilesSelected(event: Event) {
    this.isLoading = true;

    const input1 = event.target as HTMLInputElement;
    this.total = input1.files.length;
    this.loaded = 0;

    this.ngZone.runOutsideAngular(() => {
      const input = event.target as HTMLInputElement;
      console.log(input.files);

      if (input.files && this.modelService?.model?.model) {
        // Ensure that model and labels are loaded
        if (
          !this.modelService?.model?.model ||
          !this.modelService?.model?.labels
        ) {
          console.error('Model or labels are not loaded');
          return;
        }

        this.predictions = [];
        for (let i = 0; i < input.files.length; i++) {
          const file = input.files[i];
          const reader = new FileReader();
          reader.onload = async (e: any) => {
            const img = new Image();
            img.src = e.target.result;

            await new Promise<void>((resolve) => {
              img.onload = async () => {
                const tensor = tf.browser.fromPixels(img);

                // Resizing the image to match the model's input shape
                const resizedTensor = tf.image
                  .resizeBilinear(tensor, [
                    this.modelService.model.options.shapeh,
                    this.modelService.model.options.shapew,
                  ])
                  .div(tf.scalar(255)) // Normalize to [0, 1] range (important for consistency)
                  .expandDims(0); // Add batch dimension

                const prediction = this.modelService?.model?.model.predict(
                  resizedTensor
                ) as tf.Tensor;

                // Get raw prediction probabilities (softmax output)
                const predictionData = await prediction.data();

                // Display probabilities for all labels
                const probabilities = Array.from(predictionData);
                const labelProbabilities: {
                  label: string;
                  probability: number;
                }[] = this.modelService?.model?.labels.map((label, index) => ({
                  label: label,
                  probability: probabilities[index],
                }));

                // Find the label with the highest probability
                const predictedIndex = probabilities.indexOf(
                  Math.max(...probabilities)
                );
                const predictedLabel =
                  this.modelService?.model?.labels[predictedIndex];

                // Add to the predictions array
                this.ngZone.run(() => {
                  this.predictions.push({
                    src: e.target.result,
                    label: predictedLabel,
                    probabilities: labelProbabilities,
                  });
                });

                console.log('Predictions:', this.predictions);

                this.ngZone.run(() => {
                  this.loaded++;
                });

                resolve();
              };
            });
          };
          reader.readAsDataURL(file);
        }
      }
    });
  }
}
