import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CameraService } from './camera.service';
import { CameraState } from './camera';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent {
  @ViewChild('preview_canvas', { static: true }) previewCanvas!: ElementRef<HTMLCanvasElement>;

  preview = false;
  previewDimensions: { width: number, height: number } | null = null;
  state: BehaviorSubject<CameraState>;

  constructor(
    public cameraService: CameraService,
  ) {
    this.state = new BehaviorSubject<CameraState>(CameraState.DISCONNECTED);
    this.state.subscribe((state) => {
      if (state === CameraState.DISCONNECTED) {
        this.stopPreview();
      }
    });
  }

  async togglePreview() {
    this.preview = !this.preview;
    if (this.cameraService.isConnected && this.preview) {
      this.streamPreview();
    } else {
      if (this.state.value !== CameraState.READY && this.state.value !== CameraState.BUSY) {
        console.log('No camera connected', CameraState[this.cameraService.state.value]);
      }
    }
  }

  private async streamPreview() {
    while (this.preview && this.cameraService.isConnected) {
      try {
        const blob = await this.cameraService.capturePreviewAsBlob();
        const dimensions = await this.cameraService.drawCanvas(blob, this.previewCanvas.nativeElement);

        if (!this.previewDimensions) {
          this.previewDimensions = dimensions;
          this.adjustCanvasSize();
        }

        await new Promise(resolve => requestAnimationFrame(resolve));
      } catch (err) {
        console.error('Could not refresh preview:', err);
        // The camera service will handle the disconnection alert, so we don't need to do it here
        this.stopPreview();
      }
    }
  }

  private stopPreview() {
    this.preview = false;
    this.previewDimensions = null;
  }

  private adjustCanvasSize() {
    if (this.previewDimensions) {
      const canvas = this.previewCanvas.nativeElement;
      const aspectRatio = this.previewDimensions.width / this.previewDimensions.height;

      // Set a maximum width (adjust as needed)
      const maxWidth = Math.min(800, window.innerWidth * 0.8);

      canvas.style.width = `${maxWidth}px`;
      canvas.style.height = `${maxWidth / aspectRatio}px`;
    }
  }


}
