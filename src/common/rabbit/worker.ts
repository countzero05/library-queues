import amqp from 'amqplib';
import { ConsumeMessage } from 'amqplib/properties';
import { JSDOM } from 'jsdom';
import { join } from 'path';
import fetch from 'node-fetch';

let i = 0;

export default class Worker {
  private connection: amqp.Connection | undefined;
  private channel: amqp.Channel | undefined;
  private queue!: string;

  constructor( private queueName: string = 'url_queue', private resultQueue = 'result_queue') {

  }

  async init() {
    this.connection = await amqp.connect( 'amqp://localhost' );
    this.channel = await this.connection.createChannel();
    this.queue = (await this.channel.assertQueue( this.queueName )).queue;
    this.channel.prefetch(4);
  }

  async close() {
    this.channel?.close();
    this.connection?.close();
  }

  async consume() {
    this.channel?.consume(this.queue, async (rawMessage: ConsumeMessage | null) => {
      if (!rawMessage) {
        console.error('empty message catch!');
        return;
      }
      const message = JSON.parse(rawMessage.content.toString());

      if (++i % 100 === 0) {
        console.log('processed urls ', i);
      }
      // console.log('processing url: ', message.url)

      const urls = await this.parse(message.url);

      this.channel?.sendToQueue(this.resultQueue, Buffer.from(JSON.stringify({urls})));

      // const found = processTask(
      // )
      // if ( found ) {
      //   console.log(`Found! => ${found}`)
      //   await channel.sendToQueue('results_queue',
      //     Buffer.from(`Found: ${found}`))
      // }
      await this.channel?.ack(rawMessage)
    })
  }

  async process() {
    await this.init();

    await this.consume();

    // await this.close()
  }

  private async parse(url: string) {
    const content = await parse(url);

    return this.parseContent( url, content );
  }

  private parseContent( baseUrl: string, content: string ): string[] {
    const urls: string[] = [];

    if ( !content ) {
      return [];
    }

    const dom = new JSDOM( content );
    dom.window.document.querySelectorAll( 'a' ).forEach( link => {
      urls.push( decodeURI( link.href ) );
    } );

    const filteredUrls = this.filterUrls( baseUrl, urls );
    return this.transformUrls( baseUrl, filteredUrls );
  }

  private filterUrls( baseUrl: string, urls: string[] ): string[] {
    return urls.filter( url => {
      if ( url.startsWith( './.' ) ) {
        return false;
      }

      if ( url.startsWith( './' ) ) {
        return true;
      }

      if ( !url.startsWith( baseUrl ) ) {
        return false;
      }

      return false;
    } )
  }

  private transformUrls( baseUrl: string, urls: string[] ): string[] {
    return urls.map( url => join( baseUrl, url ) );
  }

}

(async () => {
  await new Worker().process();
})().catch(e => console.error(e));

async function parse( url: string = '' ) {
  const urlObj = new URL( url );

  const filename = urlObj.pathname;
  const extension = filename
    .split( '.' )
    .filter( Boolean )
    .slice( 1 )
    .join( '.' );

  if ( !extension || extension.toLowerCase().startsWith( 'htm' ) || extension.toLowerCase() === 'txt') {
    try {
      const response = await fetch( url );
      return await response.text();
    } catch ( error ) {
      if ( error instanceof Error ) {
        console.error( 'failed with ' + error.message );
      } else {
        console.error( 'Unknown exception thrown: ', error );
      }
      return '';
    }
  }

  return '';
}
