# ServerlessQ Image Resize

This is the accompanying repository for the article about using ServerlessQ in real-world scenarios with our Vercel Integration.

Check out the [article](https://blog.serverlessq.com/vercel-background-functionsjobs-with-serverlessq)

## Deploy on Vercel

You can deploy this project with one button on Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fserverlessq-hq%2Fexample-image-resize)

## Getting Started

First, set your `env` variables locally. For this, copy the provided `.env.example` and rename it to `.env.local` and provide the following information: 

```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET_NAME=
SERVERLESSQ_API_TOKEN=
```

Then, run the development server:

```bash

npm install
npm run dev
# or
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


You should now be able to upload the image and see the results of the processing on the [ServerlessQ Dashboard](https://app.serverlessq.com/queue)

