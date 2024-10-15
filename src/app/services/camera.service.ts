import { Injectable, signal, computed, effect } from '@angular/core';
import { Camera, CameraState } from '../lib/camera';
import { Observable } from 'rxjs';
import { AlertService } from '@services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class CameraService {

  private camera: Camera = new Camera();
  readonly state = this.camera.state;
  readonly isConnected = computed(() => this.state() === CameraState.READY);
  private previousSignificantState = signal<CameraState>(CameraState.DISCONNECTED);

  constructor(private alertService: AlertService) {
    effect(() => {
      const currentState = this.state();
      if (this.shouldShowAlert(currentState)) {
        this.showStateAlert(currentState);
        this.previousSignificantState.set(currentState);
      }
    }, { allowSignalWrites: true });

    this.camera.events.subscribe(event => {
      if (event === 'camera_disconnected') {
        this.handleDisconnection();
      }
    });
  }

  private handleDisconnection() {
    this.alertService.showAlert({ type: 'warning', message: 'Camera unexpectedly disconnected', timeout: 5000 });
  }

  private shouldShowAlert(currentState: CameraState): boolean {
    // Only show alerts for significant state changes
    if (currentState === CameraState.BUSY) return false;
    if (currentState === CameraState.READY && this.previousSignificantState() === CameraState.BUSY) return false;
    return currentState !== this.previousSignificantState();
  }

  private showStateAlert(state: CameraState) {
    switch (state) {
      case CameraState.READY:
        this.alertService.showAlert({ type: 'success', message: 'Camera connected successfully', timeout: 3000 });
        break;
      case CameraState.DISCONNECTED:
        this.alertService.showAlert({ type: 'info', message: 'Camera disconnected', timeout: 3000 });
        break;
      case CameraState.ERROR:
        this.alertService.showAlert({ type: 'error', message: 'Camera error occurred', dismissible: true });
        break;
    }
  }

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

  async drawCanvas(data: Blob, canvas: HTMLCanvasElement): Promise<{ width: number, height: number }> {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context.');
    }

    const imageBitmap = await createImageBitmap(data);

    // Set canvas dimensions to match the image
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;

    ctx.drawImage(imageBitmap, 0, 0);

    return { width: imageBitmap.width, height: imageBitmap.height };
  }

  cancelCurrentOperation() {
    this.camera.cancelCurrentOperation();
  }
}
