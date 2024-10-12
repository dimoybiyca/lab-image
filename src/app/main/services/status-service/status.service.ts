import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { TStatus, TStatusType } from '../../types/status.type';

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  $status: BehaviorSubject<TStatus> = new BehaviorSubject({
    type: 'info',
    message: 'Loading...',
  });

  private readonly STATUS_MAPPING = {
    NOT_ENOUGH_LABELS:
      'Need at least 2 non empty datasets with unique labels for training',
    NOT_ENOUGH_IMAGES:
      'It is recomended to use at least 5 images of each type for training',
    LABELS_SHOULD_NOT_BE_EMPTY: 'Labels cant be blank',
    MODEL_NAME_SHOULD_NOT_BE_EMPTY: 'Model name should not be empty',
    READY: 'Ready for training',
    MODEL_TRAINED: 'Model has been trained',
  };

  setStatus(mes: string, type: TStatusType): void {
    const status = {
      message: (this.STATUS_MAPPING[mes] as string) || mes,
      type,
    };

    this.$status.next(status);
  }

  getStatus(): Observable<TStatus> {
    return this.$status.asObservable();
  }
}
