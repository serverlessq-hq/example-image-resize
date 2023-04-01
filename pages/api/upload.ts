import { createClient } from "@supabase/supabase-js";
import formidable, { IncomingForm } from "formidable";
import { readFile } from "fs/promises";
import type { NextApiRequest, NextApiResponse } from "next";
import ResizeImageQueue from "./resize";

// Create a single supabase client for interacting with your database
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const Bucket = "images";

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

  const { files } = await asyncParse(req);
  const file = files.image as formidable.File;
  const image = await readFile(file.filepath);

  // ... your business logic for image uploading

  const { data, error } = await supabase.storage
    .from(Bucket)
    .upload(`product/${file.originalFilename}`, image);

  if (error) {
    console.log(error);
    return res.status(500).json({ error });
  }

  // Enqueue the job
  await queue.enqueue({
    method: "POST",
    body: {
      Key: data.path,
      Bucket: Bucket,
    },
  });

  res.status(200).end();
}
