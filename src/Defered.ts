/**
 * @description - naive deferred implement
 * @author - huang.jian <hjj491229492@hotmail.com>
 */

export class Deferred<R> {
  public readonly promise: Promise<R>;

  public resolve!: (value: R | PromiseLike<R>) => void;

  public reject!: (reason?: unknown) => void;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
