import { Component } from '@angular/core';
import { CameraService } from '@services/camera.service';

@Component({
  selector: 'app-pairing',
  standalone: true,
  imports: [],
  templateUrl: './pairing.component.html',
  styleUrl: './pairing.component.scss'
})
export class PairingComponent {

  constructor(private camera: CameraService) { }

  showWebUSB() {
    this.camera.showWebUSB();
  }

}
