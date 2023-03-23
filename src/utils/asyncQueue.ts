class AsyncQueue {
  private queue: (() => Promise<any>)[];
  private running: number;
  private resolveFinish: (() => void) | undefined;
  public length: number;
  public size: number;
  constructor(size: number) {
    this.length = 0;
    this.queue = [];
    this.running = 0;
    this.size = size;
  }
  async handleItem(item: Promise<any>) {
    await item;
    this.running--;
    let newItem = this.queue.pop();
    if (newItem) {
      this.handleItem(newItem());
      this.running++;
      this.length--;
    } else if (this.running === 0 && this.resolveFinish) {
      this.resolveFinish();
    }
  }
  push(item: () => Promise<any>) {
    if (this.running < this.size) {
      this.running++;
      this.handleItem(item());
    } else {
      this.queue.push(item);
      this.length++;
    }
  }
  async awaitFinish() {
    await new Promise<void>((resolve) => {
      this.resolveFinish = resolve;
      if (this.running === 0) {
        resolve();
      }
    });
  }
}
export default AsyncQueue;
