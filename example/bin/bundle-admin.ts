/* eslint-disable @typescript-eslint/no-unused-vars */
import { bundle } from '../../src/index.js';

import componentLoader from '../src/components/index.js';
import { uploadFile } from './deploy-s3.js';

(async () => {
  const files = await bundle({
    componentLoader,
    destinationDir: 'src/public',
  });

  console.log(files);
  // do something with built files here
  // example - upload to S3:
  // await Promise.all(files.map(uploadFile));
})();
