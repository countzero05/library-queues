import sequenceQueue from './queue';
import { JSDOM } from 'jsdom';
import { join } from 'path';
import parse from './parser';

const BASEPATH = 'http://192.168.50.242:8080/';

class Crawler {
  async process( startUrl: string = '' ) {
    console.time('crawl');
    sequenceQueue.clean();
    if ( startUrl ) {
      sequenceQueue.add( startUrl );
    }
    await this.parse();
    console.timeEnd('crawl');
  }

  private async parse() {
    let i = 0;

    for ( let url of sequenceQueue ) {
      i++;
      const content = await parse( url );

      const urls = this.parseContent( url, content );

      for ( let url of urls ) {
        sequenceQueue.add( url );
      }

      if (i % 100 === 0) {
        console.log( 'urls parsed: ' + i );
      }
    }

    console.log( 'urls parsed: ' + i );
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

export default new Crawler();
