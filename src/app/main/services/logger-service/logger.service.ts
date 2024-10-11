import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export interface ILog {
  message: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private logs: ILog[] = [];

  $logs: BehaviorSubject<ILog[]> = new BehaviorSubject([]);

  pushLog(message: string): void {
    const log: ILog = {
      message,
      timestamp: new Date(),
    };

    this.logs.push(log);
    this.$logs.next(this.logs);
  }
}
