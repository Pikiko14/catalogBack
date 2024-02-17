import { IJob, IQueue } from "../interfaces/queue.interface";

export abstract class IProcessor {
    constructor(protected queue: IQueue) {}

    abstract start(): Promise<void>;

    lyfeCycle() {
        this.queue.on("waiting", (jobId) =>
            console.log(`Job ${jobId} is waiting`)
        );

        this.queue.on("active", (job: IJob) =>
            console.log(`Job ${job.id} is active`)
        );

        this.queue.on("completed", (job: IJob, result) =>
            console.log(
                `Job ${job.id} completed with result ${JSON.stringify(result)}`
            )
        );

        this.queue.on("failed", (job: IJob, err) =>
            console.log(`Job ${job.id} failed with error ${err}`)
        );
    }
}

export class ForecastTodayProcessor extends IProcessor {
    constructor(queue: IQueue) {
        super(queue);
        this.queue = queue;
    }
    async start() {
        this.lyfeCycle();

        return this.queue.process(async (job, done) => {
            try {
                console.log(123)
                done(null, job);
            } catch (error) {
                done(error);
            }
        });
    }
}