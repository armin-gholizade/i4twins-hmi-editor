import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';

import { Device, DeviceStatus } from '../models/device';

interface RawDevice {
  id?: unknown;
  code?: unknown;
  name?: unknown;
  type?: unknown;
  area?: unknown;
  status?: unknown;
  lastSeen?: unknown;
  vendor?: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class DeviceApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3001/api/devices';

  searchDevices(query: string): Observable<Device[]> {
    const params = new HttpParams().set('q', query.trim());

    return this.http
      .get<RawDevice[]>(this.baseUrl, { params })
      .pipe(map((devices) => devices.map((device) => this.normalizeDevice(device))));
  }

  getDeviceById(id: string): Observable<Device> {
    return this.http
      .get<RawDevice>(`${this.baseUrl}/${encodeURIComponent(id)}`)
      .pipe(map((device) => this.normalizeDevice(device)));
  }

  private normalizeDevice(device: RawDevice): Device {
    return {
      id: this.toText(device.id),
      code: this.toText(device.code),
      name: this.toText(device.name) || 'Unnamed device',
      type: this.toText(device.type) || 'unknown',
      area: this.toText(device.area) || 'Unknown area',
      status: this.normalizeStatus(device.status),
      lastSeen: this.normalizeLastSeen(device.lastSeen),
      vendor: this.toText(device.vendor) || 'Unknown vendor',
    };
  }

  private normalizeStatus(value: unknown): DeviceStatus {
    const status = this.toText(value).toLowerCase();

    if (status === 'running' || status === 'stopped' || status === 'fault') {
      return status;
    }

    return 'unknown';
  }

  private normalizeLastSeen(value: unknown): string | null {
    const text = this.toText(value);

    if (!text || text.toLowerCase() === 'n/a') {
      return null;
    }

    return text;
  }

  private toText(value: unknown): string {
    return String(value ?? '').trim();
  }
}
