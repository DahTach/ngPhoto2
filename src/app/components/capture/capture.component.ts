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
  captureDimensions: { width: number, height: number } | null = null;

  constructor(public cameraService: CameraService) { }

  async captureImage() {
    if (this.cameraService.isConnected()) {
      try {
        const capture_blob = await this.cameraService.captureImageAsFile();
        const dimensions = await this.cameraService.drawCanvas(capture_blob, this.captureCanvas.nativeElement);

        this.captureDimensions = dimensions;
        this.adjustCaptureCanvasSize();

        this.mimeType = await this.getBlobMimeType(capture_blob);
      } catch (err) {
        console.error('Could not capture image:', err);
      }
    } else {
      console.log('No Camera Connected');
    }
  }

  private adjustCaptureCanvasSize() {
    if (this.captureDimensions) {
      const canvas = this.captureCanvas.nativeElement;
      const aspectRatio = this.captureDimensions.width / this.captureDimensions.height;

      // Set a maximum width (adjust as needed)
      const maxWidth = Math.min(1200, window.innerWidth * 0.9);

      canvas.style.width = `${maxWidth}px`;
      canvas.style.height = `${maxWidth / aspectRatio}px`;
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
