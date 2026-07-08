import { Injectable, computed, inject, signal } from '@angular/core';
import { interval, Subscription, startWith, switchMap } from 'rxjs';

import { Device } from '../../devices/models/device';
import { DeviceStore } from '../../devices/services/device-store';

@Injectable({
  providedIn: 'root',
})
export class Preview {
  private readonly deviceStore = inject(DeviceStore);
  private pollingSubscription: Subscription | null = null;

  readonly isEnabled = signal(false);
  readonly devices = signal<Device[]>([]);

  readonly devicesById = computed(() => {
    const map = new Map<string, Device>();

    for (const device of this.devices()) {
      map.set(device.id.trim().toLowerCase(), device);
    }

    return map;
  });

  start(): void {
    if (this.pollingSubscription) {
      return;
    }

    this.isEnabled.set(true);

    this.pollingSubscription = interval(5000)
      .pipe(
        startWith(0),
        switchMap(() => this.deviceStore.loadDevices())
      )
      .subscribe((devices) => {
        this.devices.set(devices);
      });
  }

  stop(): void {
    this.isEnabled.set(false);
    this.devices.set([]);

    this.pollingSubscription?.unsubscribe();
    this.pollingSubscription = null;
  }

  toggle(enabled: boolean): void {
    if (enabled) {
      this.start();
    } else {
      this.stop();
    }
  }
}