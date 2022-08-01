import amqp from 'amqplib';

export default class Producer {
  private connection: amqp.Connection | undefined;
  private channel: amqp.ConfirmChannel | undefined;

  constructor( private queueName: string ) {

  }

  async init() {
    this.connection = await amqp.connect( 'amqp://localhost' )
    this.channel = await this.connection.createConfirmChannel()    // (1)
    await this.channel.assertQueue( this.queueName )
  }

  async close() {
    this.channel?.close();
    this.connection?.close();
  }

  sendToQueue( msg: any ) {
    return this.channel?.sendToQueue( this.queueName, Buffer.from( JSON.stringify( msg ) ) );
  }

  async waitForConfirms() {
    return this.channel?.waitForConfirms();
  }
}
