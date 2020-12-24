/**
 * @description - optimize for pipepack scenario, inspired by fastq
 * @author - huang.jian <hjj491229492@hotmail.com>
 */

// package
import ptimeout from 'p-timeout';
// internal
import { Deferred } from './Defered';
import { LinkedList } from './LinkedList';

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
  private materials: LinkedList<T>;

  // zip materials and deferreds for convenience
  private deferreds: LinkedList<Deferred<R>>;

  constructor(
    private readonly worker: QueueWorker<T, R>,
    private readonly options: QueueOptions
  ) {
    this.running = 0;
    this.materials = new LinkedList();
    this.deferreds = new LinkedList();
  }

  get size(): number {
    return this.materials.size();
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

        ptimeout(this.worker(material.value), timeout)
          .then((response) => deferred.value.resolve(response))
          .catch((reason) => {
            deferred.value.reject(reason);
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
    this.materials.restore();
    this.deferreds.restore();
  }
}
