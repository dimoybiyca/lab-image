import { Component, inject } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { ButtonModule } from 'primeng/button';
import { Subject } from 'rxjs';
import { ModelService } from '../../services/model-service/model.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-test-model',
  standalone: true,
  imports: [ButtonModule, AsyncPipe],
  templateUrl: './test-model.component.html',
  styleUrl: './test-model.component.scss',
})
export class TestModelComponent {
  private modelService: ModelService = inject(ModelService);

  predictions: { src: string; label: string }[] = [];
  $isModel: Subject<boolean> = this.modelService.$isModel;

  async onTestFilesSelected(event: Event) {
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

              // Log input shape to verify it's correct
              console.log('Input tensor shape:', resizedTensor.shape); // Should be [1, height, width, 3]

              const prediction = this.modelService?.model?.model.predict(
                resizedTensor
              ) as tf.Tensor;

              // Log the prediction tensor for debugging purposes
              prediction.print(); // Check the prediction tensor output

              // Use argMax to get the predicted index
              const predictedIndex = (await prediction.argMax(-1).data())[0];
              console.log(`Predicted index: ${predictedIndex}`);

              // Get the corresponding label from the labels array
              const predictedLabel =
                this.modelService?.model?.labels[predictedIndex];
              console.log(`Predicted label: ${predictedLabel}`);

              // Add prediction to the array for display
              this.predictions.push({
                src: e.target.result,
                label: predictedLabel,
              });

              resolve();
            };
          });
        };
        reader.readAsDataURL(file);
      }
    }
  }
}
