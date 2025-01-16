![Salable Usage Pricing Demo](https://raw.githubusercontent.com/Salable/usage-demo/94992bd38f24dcf5a7e3181f35701320b48ecee0/public/usage-banner.gif)

This demo is to demonstrate using [usage](https://www.salable.app/features/usage-based-pricing) pricing with Salable.

## Tech stack
- [Next.js](http://Next.js)
- [Vercel](https://vercel.com/docs)
- [Iron sessions](https://github.com/vvo/iron-session)
- [Turso (DB)](https://turso.tech/)
- [Prisma (ORM)](https://www.prisma.io/)
- [Turso + Prisma](https://www.prisma.io/docs/orm/overview/databases/turso) (warning: using Turso with Prisma is currently experimental)

## Demo

[View demo](https://usage-demo.vercel.app/)

The product in the demo generates strings with random data which vary in size based on the number of bytes selected. Each byte size has a credit cost which will be charged to your subscription on consumption and billed at the end of the month. To get access to the product a user must sign up and subscribe to a plan. The email of the sign up does not have to be real, this is just for demo purposes. The byte sizes for the strings are feature locked behind different plans. Once a user has subscribed they will be able access some or all of these features depending on what plan they are licensed on.

### Checkout
This instance of Salable is integrated with Stripe in test mode so no real money will ever be taken.
The customer email will be pre-populated with the email you have signed up with
In the Stripe checkout use the card number `4242 4242 4242 4242`, set a date in the future and the `CVC` can be any 3-digit number
Cardholder name can be any name.

## Auth
Custom auth for users which stores passwords in a salt hash in Turso db. The id for the logged-in user is used for the granteeId when a license is created on Salable. The user id is then used in the Salable license check.
If you are creating an app within an ecosystem like trello or slack the auth checks can be swapped with their auth.
If you are creating a standalone app there are other third party auth solutions such as [Clerk](https://clerk.com/) or [Auth.js](http://Auth.js) that can be used instead

### User sessions
Iron session to store user session data. [View docs](https://github.com/vvo/iron-session)

## Getting started
### Project set up
1. Clone the project
2. Run `npm install`
3. Copy `.env.example` and paste as `.env`
4. Add the below to your `.env`
    ```
    TURSO_DATABASE_URL='file:dev.db'
    TURSO_AUTH_TOKEN='xxxxx'
    NEXT_PUBLIC_APP_BASE_URL='http://localhost:3000'
    SESSION_COOKIE_NAME='salable-session-flat-rate'
    SESSION_COOKIE_PASSWORD='Q2cHasU797hca8iQ908vsLTdeXwK3BdY'
    NEXT_PUBLIC_SALABLE_API_BASE_URL='https://api.salable.app'
    ```
5. Run `prisma db push`

### Configure Salable
1. [Sign up](https://salable.app/login) to Salable or [login](https://salable.app/login) if you already have an account.
2. Select `test mode`.
#### Create Product
1. `Select Products` > `Create Product`.
2. Give your product a name
3. Select `Paid Product`.
4. Select the test payment integration that is created for you on sign up. If you already have created a payment integration this can be used instead.
5. The default currency can be your preference.
#### Create Plan
1. `Select Plans` > `Create Plan`
2. Set the plan name as `Basic`
3. Continue to `License type`.
4. For the type of plan select `Standard`.
5. Select `Month` for subscription cycle.
6. Select `Usage` license type.
7. Select `Paid` to make it a paid plan.
8. Currencies will then appear, input the per unit cost. This will be what the customer will be charged per unit of consumption per billing cycle. The charge per billing cycle will be variable based on what the customer consumes.
9. Continue to `Assign values`.
10. This is section is for assigning feature values that can be used on pricing tables. This is not required to get set up.
11. Click continue to `Capabilities`.
12. Create three capabilities of `16`, `32` and `64`. These will be used to lock features behind the license check in the demo app.
13. Create `Plan`.
14. Repeat the above steps for a `Pro` plan but with the changes in the next steps.
15. Set the plan name to `Pro`.
16. Set a higher monthly cost to the `Basic` plan.
17. Select all capabilities `16`, `32` and `64` and create a new capability of `128`.

### Update project .env
1. Go back to `Products`.
2. Select `Api Keys`.
3. Copy the api key that was generated on sign up and assign to `SALABLE_API_KEY`.
4. Select `Products` > Select the product created in the previous steps.
5. Copy the product ID and assign to `NEXT_PUBLIC_PRODUCT_UUID`.
6. Select `Plans`.
7. Copy the ID of the `Basic` plan and assign to `NEXT_PUBLIC_SALABLE_PLAN_UUID`.
8. Copy the ID of the `Pro` plan and assign to `NEXT_PUBLIC_SALABLE_PRO_PLAN_UUID`.
9. Run `npm run dev`

## Need some help?
Get answers and guidance from our own developers and commercial model consultants. If you have an implementation query, or you are not sure which pricing model to use for your app, our people are ready to help.

<a href="https://discord.com/channels/1064480618546737163/1219751191483781214">
<img alt="Join the salable discord" src="https://raw.githubusercontent.com/Salable/usage-demo/refs/heads/main/public/discord-button.png" width="258" />
</a>