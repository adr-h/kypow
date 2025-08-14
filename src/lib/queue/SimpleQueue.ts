
type Task = () => void | Promise<void>;

type ConstructorProps = {
   onEmpty?: () => void;
   onRunning?: () => void;
}

export class SimpleQueue {
   queue: (Task)[] = [];
   running = false;
   onEmpty?: () => void;
   onRunning?: () => void;

   private waitForEmptyPromise?: Promise<void>;

   constructor({ onEmpty, onRunning }: ConstructorProps = {}) {
      this.onEmpty = onEmpty;
      this.onRunning = onRunning;
   }

   push(task: Task) {
      this.queue.push(task);
      if (!this.running) this.run();
   }

   private async run() {
      this.onRunning?.();
      this.running = true;
      while (this.queue.length) {
         const task = this.queue.shift()!;
         await task();
      }
      this.running = false;
      this.onEmpty?.();

      await this.resolveWaitForEmpty();
   }

   async resolveWaitForEmpty() {
      await this.waitForEmptyPromise;
      this.waitForEmptyPromise = undefined;
   }

   async waitForEmpty(): Promise<void> {
      if (!this.running && this.queue.length === 0) return;
      return new Promise(resolve => {
         this.waitForEmptyPromise = resolve as unknown as Promise<void>;
      });
   }
}