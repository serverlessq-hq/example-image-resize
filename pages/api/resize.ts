import { Queue } from "@serverlessq/nextjs";
import { createClient } from "@supabase/supabase-js";

import sharp from "sharp";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default Queue(
  "Image-Resize", // Name of the queue,
  "api/resize", // Path to this queue,
  async (req, res) => {
    // Get the bucket and key from the request body, sent from our upload handler
    const { Bucket, Key } = req.body;

    const { data, error } = await supabase.storage.from(Bucket).download(Key);

    const imageData = await data.arrayBuffer();

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
      supabase.storage.from(Bucket).upload(`thumbnails/${Key}`, thumbnail),
      supabase.storage.from(Bucket).upload(`avatars/${Key}`, avatar),
      supabase.storage.from(Bucket).upload(`large/${Key}`, large),
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
