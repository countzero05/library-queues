import fetch from 'node-fetch';

export default async function parse( url: string = '' ) {
  const urlObj = new URL( url );

  const filename = urlObj.pathname;
  const extension = filename
    .split( '.' )
    .filter( Boolean )
    .slice( 1 )
    .join( '.' );

  if ( !extension || extension.toLowerCase().startsWith( 'htm' ) || extension.toLowerCase() === 'txt' || extension.toLowerCase() === 'zip' ) {
    try {
      const response = await fetch( url );
      if (extension.toLowerCase() === 'zip') {
        return '';
      }
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
