import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

if ('serviceWorker' in navigator && environment.production) {
  navigator.serviceWorker.register('/ngPhoto2/ngsw-worker.js')
    .then(reg => console.log('Angular Service worker registered', reg))
    .catch(err => console.log('Error registering Angular service worker', err));
}

