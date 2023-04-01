import type { NextApiRequest, NextApiResponse } from "next";
import ResizeImageQueue from "./resize";
import AWS from "aws-sdk";
import formidable, { IncomingForm } from "formidable";
import { createReadStream } from "fs";
import { readFile } from "fs/promises";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
export const config = {
  api: {
    bodyParser: false,
  },
};

const asyncParse: (req: NextApiRequest) => Promise<{
  fields: formidable.Fields;
  files: formidable.Files;
}> = (req) =>
  new Promise((resolve, reject) => {
    const form = new IncomingForm({ multiples: true });
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const queue = await ResizeImageQueue;

  const { fields, files } = await asyncParse(req);
  const file = files.image as formidable.File;
  const image = await readFile(file.filepath);

  console.log({
    file
  });

  // ... your business logic for image uploading
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `images/product/${file.originalFilename}`,
    Body: image,
  };

  const result = await s3.upload(params).promise();

  // Enqueue the job
  await queue.enqueue({
    method: "POST",
    body: {
      Key: result.Key,
      Bucket: result.Bucket,
    },
  });

  res.status(200).end();
}
