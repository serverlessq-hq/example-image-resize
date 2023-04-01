import { Queue } from "@serverlessq/nextjs";

import AWS from "aws-sdk";
import sharp from "sharp";

const s3 = new AWS.S3();
export default Queue(
  "Image-Resize", // Name of the queue,
  "api/resize", // Path to this queue,
  async (req, res) => {
    // Get the bucket and key from the request body, sent from our upload handler
    const { Bucket, Key } = req.body;

    // Download the image from S3
    const params = {
      Bucket,
      Key,
    };
    const result = await s3.getObject(params).promise();


    const imageData = result.Body as Buffer

    const [thumbnail, avatar, large] = await Promise.all([
      sharp(imageData).resize(120).toBuffer(),
      sharp(imageData).resize(200).toBuffer(),
      sharp(imageData)
        .resize({
          width: 1024,
          height: 768,
        })
        .toBuffer(),
    ]);

    await Promise.all([
      s3
        .upload({
          Bucket,
          Key: `thumbnails/${Key}`,
          Body: thumbnail,
        })
        .promise(),
      s3
        .upload({
          Bucket,
          Key: `avatars/${Key}`,
          Body: avatar,
        })
        .promise(),
      s3
        .upload({
          Bucket,
          Key: `large/${Key}`,
          Body: large,
        })
        .promise(),
    ]);

    res.status(200).json({
      success: true,
      thumbnail: `thumbnails/${Key}`,
      avatar: `avatars/${Key}`,
      large: `large/${Key}`,
    });
  },
  { retries: 2, urlToOverrideWhenRunningLocalhost: "https://mock.codes/200" }
);
