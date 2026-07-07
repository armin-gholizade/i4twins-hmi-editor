import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, finalize, of, switchMap, tap } from 'rxjs';

import { Device } from '../models/device';
import { DeviceApi } from './device-api';

@Injectable({
  providedIn: 'root',
})
export class DeviceStore {
  private readonly deviceApi = inject(DeviceApi);

  readonly query = signal('');
  readonly results = signal<Device[]>([]);
  readonly selectedDevice = signal<Device | null>(null);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly hasQuery = computed(() => this.query().trim().length > 0);
  readonly isEmpty = computed(
    () => this.hasQuery() && !this.isLoading() && this.results().length === 0
  );

  search(query: string): void {
    const normalizedQuery = query.trim();

    this.query.set(query);
    this.errorMessage.set(null);

    if (!normalizedQuery) {
      this.results.set([]);
      return;
    }

    this.isLoading.set(true);

    this.deviceApi
      .searchDevices(normalizedQuery)
      .pipe(
        tap((devices) => this.results.set(devices)),
        catchError(() => {
          this.results.set([]);
          this.errorMessage.set('Could not load devices.');
          return of([]);
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe();
  }

  selectDevice(device: Device): void {
    this.selectedDevice.set(device);
  }

  selectDeviceById(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.deviceApi
      .getDeviceById(id)
      .pipe(
        tap((device) => this.selectedDevice.set(device)),
        catchError(() => {
          this.selectedDevice.set(null);
          this.errorMessage.set('Device was not found.');
          return of(null);
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe();
  }

  clearSelection(): void {
    this.selectedDevice.set(null);
  }
}