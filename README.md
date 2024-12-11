# Salable Usage Pricing Demo

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
