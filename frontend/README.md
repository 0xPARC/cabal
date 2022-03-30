# Local development

Serve snap

```
cd ../snap
yarn install && yarn build:clean && yarn serve
```

# Next.js + Tailwind CSS Example

This example shows how to use [Tailwind CSS](https://tailwindcss.com/) [(v3.0)](https://tailwindcss.com/blog/tailwindcss-v3) with Next.js. It follows the steps outlined in the official [Tailwind docs](https://tailwindcss.com/docs/guides/nextjs).

## Preview

Preview the example live on [StackBlitz](http://stackblitz.com/):

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/vercel/next.js/tree/canary/examples/with-tailwindcss)

## Deploy your own

Deploy the example using [Vercel](https://vercel.com?utm_source=github&utm_medium=readme&utm_campaign=next-example):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/vercel/next.js/tree/canary/examples/with-tailwindcss&project-name=with-tailwindcss&repository-name=with-tailwindcss)

## How to use

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [npm](https://docs.npmjs.com/cli/init) or [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/) to bootstrap the example:

```bash
npx create-next-app --example with-tailwindcss with-tailwindcss-app
# or
yarn create next-app --example with-tailwindcss with-tailwindcss-app
```

Deploy it to the cloud with [Vercel](https://vercel.com/new?utm_source=github&utm_medium=readme&utm_campaign=next-example) ([Documentation](https://nextjs.org/docs/deployment)).


# Deploying on render
https://cabal.sfo3.digitaloceanspaces.com/tree.json
https://cabal.sfo3.digitaloceanspaces.com/verify_cabal.wasm

wget https://cabal.sfo3.digitaloceanspaces.com/tree.json -O ./frontend/public/tree.json


wget https://cabal.sfo3.digitaloceanspaces.com/verify_cabal_final.zkey -O ./frontend/public/verify_cabal_final.zkey; wget https://cabal.sfo3.digitaloceanspaces.com/verify_cabal.wasm -O ./frontend/public/verify_cabal.wasm; 

# Final frontend command

wget https://cabal.sfo3.digitaloceanspaces.com/tree.json -O ./frontend/public/tree.json; cd frontend; yarn; yarn build;

### Deploying bot

Build:
yarn; npx tsc --project tsconfig.bot.json
Deploy:
npx pm2 start bot.js
List
npx pm2 list

[Deprecated]: yarn bot-prod
