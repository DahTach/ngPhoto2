import { Component, ViewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CameraService } from '@services/camera.service';
import { CameraState } from '@lib/camera';

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

  constructor(
    public cameraService: CameraService,
  ) {
    effect(() => {
      if (this.cameraService.state() === CameraState.DISCONNECTED) {
        this.stopPreview();
      }
    });
  }

  async togglePreview() {
    this.preview = !this.preview;
    if (this.cameraService.isConnected() && this.preview) {
      this.streamPreview();
    } else {
      if (this.cameraService.state() !== CameraState.READY && this.cameraService.state() !== CameraState.BUSY) {
        console.log('No camera connected', CameraState[this.cameraService.state()]);
      }
    }
  }

  private async streamPreview() {
    while (this.preview && this.cameraService.isConnected()) {
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
