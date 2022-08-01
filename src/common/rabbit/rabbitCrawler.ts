import amqp from 'amqplib'
import { Portal } from 'next/dist/client/portal';
import { JSDOM } from 'jsdom';
import { join } from 'path';
import { ConsumeMessage } from 'amqplib/properties';

class RabbitCrawler {
  private connection: amqp.Connection | undefined;
  private channel: amqp.ConfirmChannel | undefined;
  private urls: string[] = [];

  constructor(
    private baseUrl: string = 'http://192.168.50.242:8080/',
    private urlQueue: string = 'url_queue',
    private resultQueue: string = 'result_queue'
  ) {
  }

  private async init() {
    this.connection = await amqp.connect( 'amqp://localhost' );
    this.channel = await this.connection.createConfirmChannel();
    await this.channel.assertQueue( this.urlQueue );
    await this.channel.assertQueue( this.resultQueue );
  }

  private async close() {
    this.channel?.close();
    this.connection?.close();
  }

  async process( baseUrl: string = '' ) {
    await this.init();

    this.sendToQueue( baseUrl );

    this.channel?.consume( this.resultQueue, async ( rawMessage: ConsumeMessage | null ) => {
      if ( !rawMessage ) {
        console.error( 'empty message catch!' );
        return;
      }
      const message = JSON.parse( rawMessage.content.toString() );

      for ( let url of message.urls ) {
        this.sendToQueue( url );
      }
    } );

    // await new Promise( resolve => setTimeout( resolve, 10000 ) );
    //
    // await this.close();
  }

  private sendToQueue( url: string = '' ) {
    if (this.urls.length % 100 === 0) {
      console.log(this.urls.length);
    }
    // console.log( 'send to queue', url );
    if ( !url ) {
      url = this.baseUrl;
    }

    if ( this.urls.indexOf( url ) !== -1 ) {
      return;
    }

    this.urls.push(url);

    this.channel?.sendToQueue( this.urlQueue, Buffer.from( JSON.stringify( {
      url
    } ) ) );
  }

}

export default new RabbitCrawler();
