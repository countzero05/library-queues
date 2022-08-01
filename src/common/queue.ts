class SequenceQueue implements Iterable<string> {
  private queue: string[] = [];
  private index: number = 0;

  // async* [ Symbol.asyncIterator ]() {
  //   while ( this.index < this.queue.length ) {
  //     let url: string | undefined = this.queue[ this.index++ ];
  //     if ( !url ) {
  //       continue;
  //     }
  //
  //     yield url;
  //   }
  // }
  //
  [ Symbol.iterator ]() {
    const self = this;
    return {
      next() {
        if ( self.index < self.queue.length ) {
          let url: string | undefined = self.queue[ self.index++ ];
          if ( !url ) {
            return { done: false, value: '' };
          }

          return { done: false, value: url };
        } else {
          return { done: true };
        }

      }
    } as Iterator<string>;
  }

  add( url: string ) {
    if ( this.queue.indexOf( url ) === -1 ) {
      this.queue.push( url );
    }
  }

  clean() {
    this.queue.length = 0;
    this.index = 0;
  }

}

export default new SequenceQueue();
