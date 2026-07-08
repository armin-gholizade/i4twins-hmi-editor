import { Injectable } from '@angular/core';
import { DeviceStatus } from '../../devices/models/device';

@Injectable({
  providedIn: 'root',
})
export class StatusColor {
  getColor(status: DeviceStatus): string {
    switch (status) {
      case 'running':
        return '#2e7d32';
      case 'stopped':
        return '#757575';
      case 'fault':
        return '#c62828';
      default:
        return '#f9a825';
    }
  }
}