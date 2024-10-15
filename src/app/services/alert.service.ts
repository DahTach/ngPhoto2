import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Alert {
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  dismissible?: boolean;
  timeout?: number;
}

@Injectable({
  providedIn: 'root'
})

export class AlertService {
  private alertSubject = new BehaviorSubject<Alert | null>(null);

  getAlerts(): Observable<Alert | null> {
    return this.alertSubject.asObservable();
  }

  showAlert(alert: Alert): void {
    this.alertSubject.next(alert);

    if (alert.timeout) {
      setTimeout(() => this.clearAlert(), alert.timeout);
    }
  }

  clearAlert(): void {
    this.alertSubject.next(null);
  }
}



