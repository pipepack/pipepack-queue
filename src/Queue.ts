/**
 * @description - optimize for pipepack scenario, inspired by fastq
 * @author - huang.jian <hjj491229492@hotmail.com>
 */

// package
import ptimeout from 'p-timeout';
// internal
import { Deferred } from './Defered';

export interface QueueWorker<T, R> {
  (payload: T): Promise<R>;
}

export interface QueueOptions {
  // limit work parallel
  concurrency: number;
  // reject when task persist considerable long
  timeout: number;
}

// every queue resolve specific and response specific
export class Queue<T, R> {
  // flag of current running task
  private running: number;

  // use array for the moment, consider LinkedList as better choice perhaps
  // zip materials and deferreds for convenience
  private materials: T[];

  private deferreds: Deferred<R>[];

  constructor(
    private readonly worker: QueueWorker<T, R>,
    private readonly options: QueueOptions
  ) {
    this.running = 0;
    this.materials = [];
    this.deferreds = [];
  }

  get size(): number {
    return this.materials.length;
  }

  enqueue(material: T): Promise<R> {
    const deferred = new Deferred<R>();

    this.materials.push(material);
    this.deferreds.push(deferred);

    // just signal of release try
    this.release();

    // shortcut returning
    return deferred.promise;
  }

  release(): void {
    if (this.running < this.options.concurrency) {
      const { timeout } = this.options;
      const material = this.materials.shift();
      const deferred = this.deferreds.shift();

      // execute worker only when material not empty
      if (material && deferred) {
        this.running += 1;

        ptimeout(this.worker(material), timeout)
          .then((response) => deferred.resolve(response))
          .catch((reason) => {
            deferred.reject(reason);
          })
          .finally(() => {
            this.running -= 1;
            // recurse another consume
            this.release();
          });
      }
    }
  }

  // restore queued material
  kill(): void {
    this.materials = [];
    this.deferreds = [];
  }
}
