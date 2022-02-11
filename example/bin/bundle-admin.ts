/* eslint-disable @typescript-eslint/no-unused-vars */
import { bundle } from '../../src';
import { uploadFile } from './deploy-s3';

(async () => {
  const files = await bundle({
    customComponentsInitializationFilePath: 'src/components/index.ts',
    destinationDir: 'src/public',
  });

  console.log(files);
  // do something with built files here
  // example - upload to S3:
  // await Promise.all(files.map(uploadFile));
})();
