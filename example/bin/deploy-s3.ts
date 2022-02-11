import { promises as fs } from 'fs';
import { join } from 'path';
import AWS from 'aws-sdk';
import { BundleFile } from "../../src";

type UploadOptions = {
  keyPrefix: string;
  bucket: string;
};

const aws = new AWS.S3({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
});

export const uploadFile = async (
  { destinationPath: filePath, name }: BundleFile,
  { keyPrefix, bucket }: UploadOptions,
): Promise<void> => {
  const file = await fs.readFile(filePath);
  const s3Path = join(keyPrefix, name);

  console.log(`Uploading ${filePath} to ${s3Path}`);

  return new Promise((resolve, reject) => {
    aws.upload(
      {
        Bucket: bucket,
        Key: s3Path,
        Body: file,
        ACL: 'public-read',
      },
      (err, data) => {
        if (err) reject(err);
        console.log(`Succesfully uploaded ${name} to ${data.Location}`);
        resolve();
      },
    );
  });
};
