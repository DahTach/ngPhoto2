import { Injectable, signal, computed } from '@angular/core';
import { Camera, CameraState } from '../lib/camera';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  private camera: Camera = new Camera();

  readonly state = this.camera.state;

  readonly isConnected = computed(() => this.state() === CameraState.READY);

  constructor() { }

  get events$(): Observable<string> {
    return this.camera.events.asObservable();
  }

  async showWebUSB() {
    await Camera.showPicker();
    await this.connectCamera();
  }

  async connectCamera() {
    try {
      await this.camera.connect();
    } catch (e) {
      console.warn('Failed to connect camera:', e);
    }
  }

  async disconnectCamera() {
    await this.camera.disconnect();
  }

  async capturePreviewAsBlob(): Promise<Blob> {
    return this.camera.capturePreviewAsBlob();
  }

  async captureImageAsFile(): Promise<Blob> {
    return this.camera.captureImageAsFile();
  }

  async drawCanvas(data: Blob, canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context.');
    }

    const imageBitmap = await createImageBitmap(data);
    ctx.drawImage(
      imageBitmap,
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  cancelCurrentOperation() {
    this.camera.cancelCurrentOperation();
  }
}
