// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
// import crawler from './../../src/common/crawler';
import crawler from './../../src/common/rabbit/rabbitCrawler';

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { url } = req.query;
  const content = await crawler.process(<string> url );
  res.status( 200 ).json( { name: 'John Doe' } )
}
