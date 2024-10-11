import { AsyncPipe, NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { StatusService } from '../../services/status-service/status.service';
import { TStatus } from '../../types/status.type';

@Component({
  selector: 'app-status-bar',
  standalone: true,
  imports: [AsyncPipe, NgClass],
  templateUrl: './status-bar.component.html',
  styleUrl: './status-bar.component.scss',
})
export class StatusBarComponent implements OnInit {
  private statusService: StatusService = inject(StatusService);
  private cds: ChangeDetectorRef = inject(ChangeDetectorRef);

  $status: Observable<TStatus> = null;

  ngOnInit(): void {
    this.$status = this.statusService.getStatus();

    this.$status.subscribe((status) => {
      setTimeout(() => {
        this.cds.detectChanges();
      });
    });
  }
}
