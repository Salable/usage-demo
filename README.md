![Salable Usage Pricing Demo](https://raw.githubusercontent.com/Salable/usage-demo/94992bd38f24dcf5a7e3181f35701320b48ecee0/public/usage-banner.gif)

This demo is to demonstrate using [usage](https://www.salable.app/features/usage-based-pricing) pricing with Salable.

## Tech stack
- [Next.js](https://nextjs.org/)
- [Vercel](https://vercel.com/docs)
- [Iron Session](https://github.com/vvo/iron-session)
- [Prisma (ORM)](https://www.prisma.io/)
- [Neon on Vercel (DB)](https://neon.tech/docs/guides/vercel-overview)

## Demo

[View demo](https://usage-demo.vercel.app/)

The product in the demo generates strings with random data which vary in size based on the number of bytes selected. Each byte size has a credit cost which will be charged to your subscription as consumption and billed at the end of the month. To get access to the product a user must sign up and subscribe to a plan. The email of the sign-up does not have to be real, this is just for demo purposes. The byte sizes for the strings are feature locked behind different plans. Once a user has subscribed they will be able to access some or all of these features depending on what plan they are licensed on.

The email of the sign-up does not have to be real, this is just for demo
purposes.

The demo is integrated with Stripe to handle payments which is running in test
mode so Stripe test cards can be used.

### Demo Card Details

**Card Number**: `4242 4242 4242 4242` \
**Expiry Date**: Any future date (`09/42`) \
**CVC**: Any 3-digit number (`123`) \
**Cardholder Name**: Anything (`Mr John Doe`)

## Auth

User details are stored in a postgres database using Neon with Vercel. Passwords are securely hashed
with unique salts. The ID of the logged-in user is used as the `granteeId` when
creating a license on Salable. It is also used for the license checks. If you're
developing an app within an existing ecosystem like Trello or Slack, you can
swap out the included authentication system with theirs.

### User sessions
Iron session to store user session data. [View docs](https://github.com/vvo/iron-session)

## Project Setup

1. Clone the repo (`git clone git@github.com:Salable/salable-usage-demo.git`)
2. Run `npm install`
3. Create an `.env` file (`cp .env.example .env`)
4. [Install Docker](https://www.docker.com/get-started/). If you already have Docker installed skip this step. If you don't want to run Docker for local development skip to the next stage for an alternative.
5. Run `docker-compose up -d`
6. Run `npx prisma db push`

### Alternative to Docker
If you are using Docker skip to [Configure Salable](#configure-salable).

To remove the requirement of Docker we will change the db provider to `sqlite`.
1. Update the datasource in the `schema.prisma` file in the root of the project to use the provider `"sqlite"`
   ```
   datasource db {  
      provider = "sqlite"  
      url = env("DATABASE_URL")
   }
   ```
2. Update the `DATABASE_URL` var in your `.env` file to be `file:./dev.db`
3. Replace the contents of `./prisma/index.ts` with the code below -
   ```typescript
   import { PrismaClient } from "@prisma/client";
   import { PrismaLibSQL } from "@prisma/adapter-libsql";
   import { createClient } from "@libsql/client";
   import { env } from "@/app/environment";
   
   const libsql = createClient({ url: env.DATABASE_URL });
   const adapter = new PrismaLibSQL(libsql);
   export const prismaClient = new PrismaClient({ adapter });
   ```
4. Run `npx prisma db push`

### Configure Salable

1. [Sign up](https://salable.app/login) for Salable or [login](https://salable.app/login) if you already have an account.
2. Ensure you have `Test Mode` enabled.

#### Create Product

1. Go to the Products page and click the `Create Product` button.
2. Give your product any name.
3. Tick the `Paid Product` checkbox.
4. Select the test payment integration that is created for you on sign up. If you already have created a payment integration this can be used instead.
5. Select whichever default currency you'd prefer.

#### Create Plan

1. Go to the `Plans` tab on the sidebar and select `Create Plan`
2. Set the plan name as `Full Access` and optionally provide a description.
3. Press `Continue` to configure `License Type` information.
4. For the type of plan select `Standard`.
5. Select `Month` for subscription cycle.
6. Select `Usage` license type.
7. Select `Paid` to make it a paid plan.
8. Currencies will then appear, input the per-unit cost. This will be what the customer will be charged per unit of consumption per billing cycle. The charge per billing cycle will be variable based on what the customer consumes.
9. Continue to `Assign values`.
10. This is section is for assigning feature values that can be used on pricing tables. This is not required to get set up.
11. Click `Continue` to `Capabilities`.
12. Create four capabilities of `16`, `32`, `64` and `128`. These will be used to lock features behind the license check in the demo app.
13. Create Plan.

### Update Environment Variables

1. Copy the Product ID from the "General Settings" tab and assign to `NEXT_PUBLIC_PRODUCT_UUID` in the `.env` file.
2. Go to `Plans`. Assign the `Basic` ID to `NEXT_PUBLIC_SALABLE_PLAN_UUID`.
3. Go to `API Keys`.
4. Copy the API Key that was generated on sign up and assign to `SALABLE_API_KEY`.
5. Run `npm run dev`

## Need some help?

Get answers and guidance from our own developers and commercial model consultants. If you have an implementation query, or you are not sure which pricing model to use for your app, our people are ready to help.

<a href="https://discord.com/channels/1064480618546737163/1219751191483781214">
<img alt="Join the salable discord" src="https://raw.githubusercontent.com/Salable/seats-demo/refs/heads/main/public/discord-button.png" width="258" />
</a>
