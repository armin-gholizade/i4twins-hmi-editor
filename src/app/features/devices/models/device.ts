export type DeviceStatus = 'running' | 'stopped' | 'fault' | 'unknown';

export interface Device {
  id: string;
  code: string;
  name: string;
  type: string;
  area: string;
  status: DeviceStatus;
  lastSeen: string | null;
  vendor: string;
}