import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { StatusService } from '../../services/status-service/status.service';
import { ModelService } from '../../services/model-service/model.service';

@Component({
  selector: 'app-train-model',
  standalone: true,
  imports: [
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    FormsModule,
    DividerModule,
  ],
  templateUrl: './train-model.component.html',
  styleUrl: './train-model.component.scss',
})
export class TrainModelComponent {
  @Input() labels: string[] = ['1', '2'];
  @Input() images: { src: string; label: string }[] = [];

  private statusService: StatusService = inject(StatusService);
  private modelService: ModelService = inject(ModelService);

  modelName: string = '';

  trainModel(): void {
    this.modelService.trainModel(this.modelName);
  }

  isTrainingDisable(): boolean {
    if (this.labels.some((label) => !label)) {
      return true;
    }

    if (this.labels.length < 2) {
      return true;
    }

    if (!this.modelName) {
      this.statusService.setStatus('MODEL_NAME_SHOULD_NOT_BE_EMPTY', 'error');
      return true;
    }

    this.statusService.setStatus('READY', 'success');
    return false;
  }
}
