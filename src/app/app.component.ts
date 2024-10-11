import { Component } from '@angular/core';
import { MainComponent } from './main/components/main/main.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MainComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  // images: { src: string; label: string }[] = [];
  // model: any = null;
  // predictions: { src: string; label: string }[] = [];
  // onFilesSelected(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files) {
  //     for (let i = 0; i < input.files.length; i++) {
  //       const file = input.files[i];
  //       const reader = new FileReader();
  //       reader.onload = (e: any) => {
  //         this.images.push({ src: e.target.result, label: '' });
  //       };
  //       reader.readAsDataURL(file);
  //     }
  //   }
  // }
  // async trainModel() {
  //   const xs: tf.Tensor[] = [];
  //   const ys: tf.Tensor[] = [];
  //   // Collect unique labels
  //   const labelsSet = new Set<string>();
  //   this.images.forEach((image) => labelsSet.add(image.label));
  //   const labelsArray = Array.from(labelsSet);
  //   const numClasses = labelsArray.length;
  //   for (const image of this.images) {
  //     const img = new Image();
  //     img.src = image.src;
  //     await new Promise<void>((resolve) => {
  //       img.onload = () => {
  //         const tensor = tf.browser.fromPixels(img);
  //         // Resize image to a fixed size (e.g., 128x128)
  //         const resizedTensor = tf.image.resizeBilinear(tensor, [128, 128]);
  //         xs.push(resizedTensor);
  //         // Convert label to one-hot encoding
  //         const labelIndex = this.getLabelIndex(image.label);
  //         const oneHotLabel = tf.oneHot(
  //           tf.tensor1d([labelIndex], 'int32'),
  //           numClasses
  //         );
  //         ys.push(oneHotLabel);
  //         resolve();
  //       };
  //     });
  //   }
  //   // Stack tensors and ensure correct shape
  //   const xsTensor = tf.stack(xs);
  //   const ysTensor = tf.stack(ys).reshape([-1, numClasses]); // Ensure target tensor has shape [batchSize, numClasses]
  //   // Define a simple model
  //   this.model = tf.sequential();
  //   this.model.add(tf.layers.flatten({ inputShape: [128, 128, 3] }));
  //   this.model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
  //   this.model.add(
  //     tf.layers.dense({ units: numClasses, activation: 'softmax' })
  //   );
  //   this.model.compile({
  //     optimizer: 'adam',
  //     loss: 'categoricalCrossentropy',
  //     metrics: ['accuracy'],
  //   });
  //   await this.model.fit(xsTensor, ysTensor, { epochs: 5 });
  //   console.log('Model trained');
  // }
  // getLabelIndex(label: string): number {
  //   // Map labels to indices (simple example)
  //   const labels = ['battleship', 'github', 'bird']; // Update with your own labels
  //   return labels.indexOf(label);
  // }
  // async onTestFilesSelected(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && this.model) {
  //     this.predictions = [];
  //     for (let i = 0; i < input.files.length; i++) {
  //       const file = input.files[i];
  //       const reader = new FileReader();
  //       reader.onload = async (e: any) => {
  //         const img = new Image();
  //         img.src = e.target.result;
  //         await new Promise<void>((resolve) => {
  //           img.onload = async () => {
  //             const tensor = tf.browser.fromPixels(img);
  //             const resizedTensor = tf.image
  //               .resizeBilinear(tensor, [128, 128])
  //               .expandDims(0); // Add batch dimension
  //             const prediction = this.model.predict(resizedTensor) as tf.Tensor;
  //             const predictedIndex = (await prediction.argMax(-1).data())[0];
  //             const labelsArray = ['battleship', 'github', 'bird']; // Update with your own labels
  //             const predictedLabel = labelsArray[predictedIndex];
  //             this.predictions.push({
  //               src: e.target.result,
  //               label: predictedLabel,
  //             });
  //             resolve();
  //           };
  //         });
  //       };
  //       reader.readAsDataURL(file);
  //     }
  //   }
  // }
}
