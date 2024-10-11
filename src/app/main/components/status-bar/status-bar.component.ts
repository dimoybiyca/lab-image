import { AsyncPipe, NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { StatusService } from '../../services/status-service/status.service';
import { TStatus } from '../../types/status.type';
import { ProgressBarModule } from 'primeng/progressbar';
import { ModelService } from '../../services/model-service/model.service';
import { log } from '@tensorflow/tfjs';

@Component({
  selector: 'app-status-bar',
  standalone: true,
  imports: [AsyncPipe, NgClass, ProgressBarModule],
  templateUrl: './status-bar.component.html',
  styleUrl: './status-bar.component.scss',
})
export class StatusBarComponent implements OnInit {
  private statusService: StatusService = inject(StatusService);
  modelService: ModelService = inject(ModelService);

  $isTraining: Observable<boolean> = this.modelService.$isTraining;
  $status: Observable<TStatus> = null;

  ngOnInit(): void {
    this.$status = this.statusService.getStatus();

    this.$isTraining.subscribe((isTraining) => {
      console.log('isTraining', isTraining);
    });
  }
}
