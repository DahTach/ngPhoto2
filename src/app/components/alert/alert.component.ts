import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AlertService, Alert } from '../../services/alert.service';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss'
})

export class AlertComponent implements OnInit, OnDestroy {
  alert: Alert | null = null;
  private subscription: Subscription | undefined;

  constructor(private alertService: AlertService) { }

  ngOnInit() {
    this.subscription = this.alertService.getAlerts().subscribe(alert => {
      this.alert = alert;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  closeAlert() {
    this.alertService.clearAlert();
  }

  get alertClasses(): string {
    if (!this.alert) return '';

    const baseClasses = 'p-4 mb-4 rounded-lg';
    const typeClasses = {
      success: 'text-green-800 bg-green-50',
      info: 'text-blue-800 bg-blue-50',
      warning: 'text-yellow-800 bg-yellow-50',
      error: 'text-red-800 bg-red-50'
    };

    return `${baseClasses} ${typeClasses[this.alert.type]}`;
  }
}
