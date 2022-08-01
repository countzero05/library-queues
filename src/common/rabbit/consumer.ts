import amqp from 'amqplib';
import { ConsumeMessage } from 'amqplib/properties';

export default class Consumer {
  private connection: amqp.Connection | undefined;
  private channel: amqp.ConfirmChannel | undefined;
  private queue!: string;

  constructor( private queueName: string ) {

  }

  async init() {
    this.connection = await amqp.connect( 'amqp://localhost' )
    this.channel = await this.connection.createConfirmChannel()    // (1)
    this.queue = (await this.channel.assertQueue( this.queueName )).queue;
  }

  async close() {
    this.channel?.close();
    this.connection?.close();
  }

  consume() {
    this.channel.consume(this.queue, async (rawMessage: ConsumeMessage | null) => {
      if (!rawMessage) {
        console.error('empty message catch!');
        return;
      }
      const message = JSON.parse(rawMessage.content.toString())
      const found = processTask(
        )
      if ( found ) {
        console.log(`Found! => ${found}`)
        await channel.sendToQueue('results_queue',
          Buffer.from(`Found: ${found}`))
      }
      await channel.ack(rawMessage)
    })
  }

  async waitForConfirms() {
    return this.channel?.waitForConfirms();
  }
}
