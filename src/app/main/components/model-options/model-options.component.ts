import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DropdownModule } from 'primeng/dropdown';
import { DividerModule } from 'primeng/divider';
import { ModelService } from '../../services/model-service/model.service';
import { TrainModelComponent } from '../train-model/train-model.component';

@Component({
  selector: 'app-model-options',
  standalone: true,
  imports: [
    InputNumberModule,
    ButtonModule,
    ReactiveFormsModule,
    TooltipModule,
    SelectButtonModule,
    DropdownModule,
    DividerModule,
    TrainModelComponent,
  ],
  templateUrl: './model-options.component.html',
  styleUrl: './model-options.component.scss',
})
export class ModelOptionsComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private modelService: ModelService = inject(ModelService);

  modelOptionsForm = null;

  layersOptions = [
    { label: '3 (Faster)', value: 3 },
    { label: '7 (Slower)', value: 7 },
  ];

  renderingOptions = [
    { label: 'WebGL', value: 'webgl' },
    { label: 'WASM', value: 'cpu' },
  ];

  optimizers = [
    { label: 'SGD', value: 'sgd' },
    { label: 'AdaGrad', value: 'adagrad' },
    { label: 'RMSprop', value: 'rmsprop' },
    { label: 'Adadelta', value: 'adadelta' },
    { label: 'Adam', value: 'adam' },
    { label: 'AdaMax', value: 'adamax' },
    { label: 'Nadam', value: 'nadam' },
    { label: 'FTRL', value: 'ftrl' },
  ];

  loss = [
    { label: 'Mean Squared Error', value: 'meanSquaredError' },
    { label: 'Mean Absolute Error', value: 'meanAbsoluteError' },
    {
      label: 'Mean Absolute Percentage Error',
      value: 'meanAbsolutePercentageError',
    },
    {
      label: 'Mean Squared Logarithmic Error',
      value: 'meanSquaredLogarithmicError',
    },
    { label: 'Squared Hinge', value: 'squaredHinge' },
    { label: 'Hinge', value: 'hinge' },
    { label: 'Categorical Hinge', value: 'categoricalHinge' },
    { label: 'Logcosh', value: 'logcosh' },
    { label: 'Categorical Crossentropy', value: 'categoricalCrossentropy' },
    {
      label: 'Sparse Categorical Crossentropy',
      value: 'sparseCategoricalCrossentropy',
    },
    {
      label: 'Kullback Leibler Divergence',
      value: 'kullbackLeiblerDivergence',
    },
    { label: 'Poisson', value: 'poisson' },
    { label: 'Cosine Proximity', value: 'cosineProximity' },
  ];

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.modelOptionsForm = this.fb.group({
      neurons: new FormControl<number>(64),
      epochs: new FormControl<number>(5),
      shapeh: new FormControl<number>(128),
      shapew: new FormControl<number>(128),
      layers: new FormControl<number>(3),
      rendering: new FormControl<string>('webgl'),
      optimizer: new FormControl<string>('adam'),
      loss: new FormControl<string>('categoricalCrossentropy'),
    });

    this.modelOptionsForm.valueChanges.subscribe((value) => {
      this.modelService.saveModelOptions(value);
    });
    this.modelService.saveModelOptions(this.modelOptionsForm.value);
  }
}
