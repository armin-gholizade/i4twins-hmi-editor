import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Device } from '../../models/device';
import { DeviceStore } from '../../services/device-store';

@Component({
  selector: 'app-device-search',
  imports: [ReactiveFormsModule],
  templateUrl: './device-search.html',
  styleUrl: './device-search.scss',
})
export class DeviceSearch {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly deviceStore = inject(DeviceStore);
  protected readonly searchControl = new FormControl('', { nonNullable: true });

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap((query) => this.deviceStore.search(query)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  protected selectDevice(device: Device): void {
    this.deviceStore.selectDevice(device);
  }
}