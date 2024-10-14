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

  constructor(public cameraService: CameraService) {
    effect(() => {
      if (this.cameraService.state() === CameraState.DISCONNECTED) {
        this.preview = false;
      }
    });
  }

  async togglePreview() {
    this.preview = !this.preview;
    if (this.preview) {
      this.streamPreview();
    }
  }

  private async streamPreview() {
    while (this.preview && this.cameraService.isConnected()) {
      try {
        const blob = await this.cameraService.capturePreviewAsBlob();
        await this.cameraService.drawCanvas(blob, this.previewCanvas.nativeElement);
        await new Promise(resolve => requestAnimationFrame(resolve));
      } catch (err) {
        console.error('Could not refresh preview:', err);
        this.preview = false;
      }
    }
  }

}
