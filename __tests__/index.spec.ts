// package
import delay from 'delay';
// internal
import { Queue } from '../src';

describe('pipepack queue', () => {
  it('should execute worker correctly', async () => {
    const worker = (m: number) => delay(100, { value: m + 1 });
    const queue = new Queue(worker, {
      concurrency: 1,
      timeout: 1000,
    });

    const r1 = await queue.enqueue(10);
    const r2 = await queue.enqueue(20);

    expect(r1).toEqual(11);
    expect(r2).toEqual(21);
  });

  it('should limit concurrency', () => {
    jest.useFakeTimers();

    const worker = (m: number) => delay(100, { value: m + 1 });
    const queue = new Queue(worker, {
      concurrency: 2,
      timeout: 1000,
    });

    // enqueue payload
    queue.enqueue(10);
    queue.enqueue(11);
    queue.enqueue(12);
    queue.enqueue(13);

    expect(queue.size).toEqual(2);

    jest.clearAllTimers();
  });

  it('should support timeout detection', () => {
    const worker = (m: number) => delay(1100, { value: m + 1 });
    const queue = new Queue(worker, {
      concurrency: 2,
      timeout: 1000,
    });

    // enqueue payload
    expect(queue.enqueue(10)).rejects.toThrow();
  });
});
