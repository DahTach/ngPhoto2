import { Injectable, ViewChild, ElementRef } from '@angular/core';
import { Camera } from '../lib/camera';

@Injectable({
  providedIn: 'root'
})
export class CameraService {

  constructor() {
  }

  camera: Camera = new Camera
  connected: boolean = false
  device: any
  preview: boolean = false
  ms: number = 2000
  delay = new Promise(res => setTimeout(res, this.ms));


  async showWebUSB() {
    const filters: any = [];
    this.device = await navigator.usb.requestDevice({ 'filters': filters });
    console.log(this.device)
    await this.connectCamera();
  }

  async connectCamera() {
    /** @type {Camera} */
    try {
      await this.camera.connect();
      console.log('Camera connected to camera service');
      this.connected = true
    } catch (e) {
      console.warn(e);
    }
  }


  async drawCanvas(data: Blob, canvas: ElementRef<HTMLCanvasElement>) {
    try {
      const ctx = canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;

      let imageBitmap = await createImageBitmap(data);

      if (ctx) {
        ctx.drawImage(
          imageBitmap,
          0,
          0,
          imageBitmap.width,
          imageBitmap.height,
          0,
          0,
          canvas.nativeElement.width,
          canvas.nativeElement.height
        );
      } else {
        console.error('Failed to get canvas context.');
      }
    } catch (error) {
      console.error('Error drawing blob:', error);
    }
  }

}
