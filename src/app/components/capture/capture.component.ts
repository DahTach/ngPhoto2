import { Component, ViewChild, ElementRef } from '@angular/core';
import { CameraService } from '@services/camera.service';

@Component({
  selector: 'app-capture',
  standalone: true,
  imports: [],
  templateUrl: './capture.component.html',
  styleUrls: ['./capture.component.scss']
})
export class CaptureComponent {
  @ViewChild('capture_canvas', { static: true }) captureCanvas!: ElementRef<HTMLCanvasElement>;

  mimeType: string | null = null;

  constructor(public cameraService: CameraService) { }

  async captureImage() {
    if (!this.cameraService.isConnected()) {
      console.log('No Camera Connected');
      return;
    }
    try {
      const captureBlob = await this.cameraService.captureImageAsFile();
      await this.cameraService.drawCanvas(captureBlob, this.captureCanvas.nativeElement);
      this.mimeType = await this.getBlobMimeType(captureBlob);
    } catch (err) {
      console.error('Could not capture image:', err);
    }
  }

  private async getBlobMimeType(blob: Blob): Promise<string> {
    try {
      return await this.blobMimeType(blob);
    } catch (error) {
      console.log('Could not check mimeType for captured image, fallback to default:', blob.type, '\nError:', error);
      return blob.type;
    }
  }

  private blobMimeType(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        const uint = new Uint8Array(event.target?.result as ArrayBuffer);
        const bytes = Array.from(uint.slice(0, 4)).map(byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase(); // Fix: Used Array.from to convert Uint8Array to array
        resolve(this.getMimetypeFromSignature(bytes));
      };
      fileReader.onerror = reject;
      fileReader.readAsArrayBuffer(blob.slice(0, 4));
    });
  }

  private getMimetypeFromSignature(signature: string): string {
    const mimeTypes: { [key: string]: string } = {
      '89504E47': 'image/png',
      '47494638': 'image/gif',
      '25504446': 'application/pdf',
      'FFD8FFD': 'image/jpeg',
      'FFD8FFE0': 'image/jpeg',
      'FFD8FFE1': 'image/jpeg',
      '504B0304': 'application/zip'
    };
    return mimeTypes[signature] || 'Unknown filetype';
  }
}
