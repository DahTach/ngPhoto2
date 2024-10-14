import { Component } from '@angular/core';
import { CaptureComponent } from '@components/capture/capture.component';
import { PairingComponent } from '@components/pairing/pairing.component';
import { PreviewComponent } from '@components/preview/preview.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PairingComponent, PreviewComponent, CaptureComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
