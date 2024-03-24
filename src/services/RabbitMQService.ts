// RabbitMQService.ts
import amqp from "amqplib";

class RabbitMQService {
  private queue: string;
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;

  constructor(queue: string) {
    this.queue = queue;
  }

  public async connect(): Promise<void> {
    this.connection = await amqp.connect(`amqp://localhost`);
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue(this.queue, { durable: false });
  }

  public async sendMessage(message: any): Promise<void> {
    if (!this.channel) {
      throw new Error("No hay conexión establecida con RabbitMQ. Primero llama al método 'connect()'.");
    }

    const emit = await this.channel.sendToQueue(this.queue, Buffer.from(JSON.stringify(message)));
    console.log(" [x] Sent '%s'", emit, message);
  }

  public async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
  }
}

export default RabbitMQService;
