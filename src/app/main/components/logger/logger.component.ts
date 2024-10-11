import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { LoggerService } from '../../services/logger-service/logger.service';
import { AsyncPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-logger',
  standalone: true,
  imports: [AsyncPipe, DatePipe],
  templateUrl: './logger.component.html',
  styleUrl: './logger.component.scss',
})
export class LoggerComponent implements OnInit {
  navigator = navigator;
  ngOnInit(): void {
    this.$logs.subscribe(() => {
      this.scrollToBottom();
    });
  }
  @ViewChild('logsContainer') logsContainer: ElementRef;
  isShowLogs = false;

  onBarClick() {
    this.isShowLogs = !this.isShowLogs;

    if (this.isShowLogs) {
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      if (!this.logsContainer) {
        return;
      }

      this.logsContainer.nativeElement.scrollTop =
        this.logsContainer.nativeElement.scrollHeight;
    });
  }
  private loggerService: LoggerService = inject(LoggerService);
  $logs = this.loggerService.$logs;
}
