import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, finalize, Observable, of, switchMap, tap } from 'rxjs';

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
  readonly recentDevices = signal<Device[]>([]);
  readonly selectedDrawableDevice = signal<Device | null>(null);



  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly selectedDeviceMissingInDrawing = signal(false);

  readonly hasQuery = computed(() => this.query().trim().length > 0);
  readonly isEmpty = computed(
    () => this.hasQuery() && !this.isLoading() && this.results().length === 0
  );

  searchDevices(query: string): Observable<Device[]> {
    const normalizedQuery = query.trim();

    this.query.set(query);
    this.errorMessage.set(null);

    if (normalizedQuery.length < 2) {
      this.clearSearch();
      return of([]);
    }

    this.isLoading.set(true);

    return this.deviceApi
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
  }

  selectDevice(device: Device): void {
    this.selectedDevice.set(device);
    this.selectedDeviceMissingInDrawing.set(false);
    this.selectedDrawableDevice.set(null);
  }

  selectDeviceById(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.deviceApi
      .getDeviceById(id)
      .pipe(
        tap((device) => {
          this.selectedDevice.set(device);
          this.selectedDeviceMissingInDrawing.set(false);
          this.selectedDrawableDevice.set(null);
        }),
        catchError(() => {
          this.selectedDevice.set(null);
          this.selectedDrawableDevice.set(null);
          this.errorMessage.set('Device was not found.');
          return of(null);
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe();
  }

  loadDevices(): Observable<Device[]> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    return this.deviceApi.getDevices().pipe(
      catchError(() => {
        this.errorMessage.set('Could not load devices.');
        return of([]);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  confirmDeviceInDrawing(device: Device): void {
    this.selectedDeviceMissingInDrawing.set(false);
    this.selectedDrawableDevice.set(device);
    this.addRecentDevice(device);
  }

  markSelectedDeviceMissingInDrawing(): void {
    this.selectedDeviceMissingInDrawing.set(true);
    this.selectedDrawableDevice.set(null);
  }

  clearSearch(): void {
    this.query.set('');
    this.results.set([]);
    this.errorMessage.set(null);
  }

  clearSelection(): void {
    this.selectedDevice.set(null);
    this.selectedDrawableDevice.set(null);
    this.selectedDeviceMissingInDrawing.set(false);

  }

  private addRecentDevice(device: Device): void {
    const normalizedId = device.id.trim().toLowerCase();

    const withoutDuplicate = this.recentDevices().filter(
      (recent) => recent.id.trim().toLowerCase() !== normalizedId
    );

    this.recentDevices.set([device, ...withoutDuplicate].slice(0, 5));
  }
}