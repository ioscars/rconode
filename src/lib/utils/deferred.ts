export class Deferred<V, R extends Error> {
  reject!: (reason?: R) => void;
  resolve!: (value: V) => void;
  promise: Promise<V>;
  constructor() {
    this.promise = new Promise<V>((resolve, reject) => {
      this.reject = reject;
      this.resolve = resolve;
    });
  }
}


