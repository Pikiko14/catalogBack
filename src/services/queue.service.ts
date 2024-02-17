import Queue from "bull";
import { IJob, IQueue, IQueueOptions } from '../interfaces/queue.interface'

export class BullQueue<I = any> implements IQueue {
    private bullQueue: Queue.Queue;
    constructor(private queueName: string, options?: IQueueOptions) {
        this.bullQueue = new Queue(queueName, {
            redis: {
                host: process.env.REDIS_HOST as string,
                port: Number(process.env.REDIS_PORT),
            },
            ...(options || {}),
        });
    }

    async add(data: I, options?: Queue.JobOptions): Promise<void> {
        await this.bullQueue.add(data, options);
    }

    async process(
        callback: (job: IJob<any>, done: Function) => Promise<any>
    ): Promise<any> {
        return this.bullQueue.process(callback);
    }

    on(event: string, callback: (...args: any[]) => void): void {
        this.bullQueue.on(event, callback);
    }
}