/// <reference types="w3c-web-usb" />
import initModule, { Context } from '@lib/libapi';
import { WritableSignal, signal, effect } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum CameraState {
  DISCONNECTED,
  CONNECTING,
  READY,
  BUSY,
  ERROR
}

// Distinguish critical errors from library errors.
export function rethrowIfCritical(err: any): boolean {
  // If it's precisely Error, it's a custom error;
  // anything else - SyntaxError, WebAssembly.RuntimeError, TypeError, etc. -
  // is treated as critical here.
  if (err?.constructor !== Error) {
    throw err;
  }
  return false;
}

const INTERFACE_CLASS = 6; // PTP
const INTERFACE_SUBCLASS = 1; // MTP
let ModulePromise: any

export class Camera {

  #queue = Promise.resolve();
  #context: Context | null = null;
  public state: WritableSignal<CameraState> = signal(CameraState.DISCONNECTED)
  public events = new BehaviorSubject<string>('');

  constructor() {
    effect(() => {
      if (this.state() === CameraState.ERROR) {
        this.handleError();
      }
    });
  }

  private handleError() {
    console.error('Camera entered ERROR state');
    this.events.next('Camera error occurred');
    // Attempt to recover or notify user
    setTimeout(() => this.attemptRecovery(), 5000);
  }

  private attemptRecovery() {
    if (this.state() === CameraState.ERROR) {
      this.disconnect().then(() => this.connect());
    }
  }

  static async showPicker() {
    await navigator.usb.requestDevice({
      filters: [
        {
          classCode: INTERFACE_CLASS,
          subclassCode: INTERFACE_SUBCLASS
        }
      ]
    });
  }

  async connect() {
    if (this.state() !== CameraState.DISCONNECTED) {
      throw new Error('Camera is already connected or connecting');
    }
    this.state.set(CameraState.CONNECTING);
    try {
      if (!ModulePromise) {
        ModulePromise = initModule();
      }
      let Module = await ModulePromise;
      this.#context = await new Module.Context();
      this.state.set(CameraState.READY);
      this.events.next('Camera connected');
    } catch (error: any) {
      this.state.set(CameraState.ERROR);
      this.events.next(`Connection error: ${error.message}`);
      throw error;
    }
  }

  async #schedule<T>(op: (context: Context) => Promise<T>): Promise<T> {
    if (this.state() !== CameraState.READY) {
      throw new Error('Camera is not ready');
    }
    this.state.set(CameraState.BUSY);
    let res = this.#queue.then(() => op(this.#context!)).finally(() => {
      this.state.set(CameraState.READY);
    });
    this.#queue = res.catch(err => {
      if (rethrowIfCritical(err)) {
        this.state.set(CameraState.ERROR);
      }
      throw err;
    }).then(() => { });
    return res;
  }

  async disconnect() {
    if (this.#context && !this.#context.isDeleted()) {
      this.#context.delete();
    }
    this.#context = null;
    this.state.set(CameraState.DISCONNECTED);
    this.events.next('Camera disconnected');
  }

  cancelCurrentOperation() {
    // This is a basic implementation. You might need to adjust based on your specific needs.
    this.#queue = Promise.resolve();
    this.state.set(CameraState.READY);
    this.events.next('Current operation cancelled');
  }

  async getConfig() {
    return this.#schedule((context: Context) => context.configToJS());
  }

  async getSupportedOps() {
    if (this.#context) {
      return this.#context.supportedOps();
    }
    throw new Error('You need to connect to the camera first');
  }

  async setConfigValue(name: string, value: any) {
    return this.#schedule(async (context: Context) => {
      await context.setConfigValue(name, value);
      // Instead of using a timeout, poll the camera state until the change is reflected, still pretty ugly though.
      let retries = 0;
      while (retries < 10) {
        const config = await context.configToJS();
        if (config.name === value) {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }
      if (retries === 10) {
        throw new Error('Config value did not update in time');
      }
    });
  }

  async capturePreviewAsBlob() {
    return this.#schedule((context: Context) => {
      this.events.next('Capturing preview');
      return context.capturePreviewAsBlob();
    });
  }

  async captureImageAsFile() {
    return this.#schedule((context: Context) => {
      this.events.next('Capturing image');
      return context.captureImageAsFile();
    });
  }

  async consumeEvents() {
    return this.#schedule((context: Context) => context.consumeEvents());
  }

}
