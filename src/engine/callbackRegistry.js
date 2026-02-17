import { EventEmitter } from "events";

class CallbackRegistry {
  constructor() {
    console.log(`CallbackRegistry started`);
    this.emitter = new EventEmitter();
  }

  waitFor(jobId, timeoutMs = 80000) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.log(`timeout ${jobId}`);
        reject(new Error(`Job ${jobId} timed out`));
      }, timeoutMs);

      this.emitter.once(`${jobId}:success`, (data) => {
        clearTimeout(timeout);
        resolve(data);
      });

      this.emitter.once(`${jobId}:failed`, (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  success(jobId, payload) {
    console.log(`success ${jobId}`);
    this.emitter.emit(`${jobId}:success`, payload);
  }

  failed(jobId, error) {
    console.log(`failed ${jobId}`);
    this.emitter.emit(`${jobId}:failed`, error);
  }
}

export const callbackRegistry = new CallbackRegistry();
