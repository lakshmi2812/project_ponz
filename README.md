# Ponz.io
Building Ponz.io, with its endearingly upside-down-triangle-shaped business model.


Hi.. This is Lakshmi :). Here are the steps to run this project:

Steps to run the project:

1. Fork and clone this repository.
2. cd into this repository and run 'npm install'. This installs all packages in package.json.
3. Type npm run seeds to seed the database.
3. Type nodemon app.js or node app.js in the console to run the project.

About the project:

When a user signs up with Ponz.io, they get a referral link. The people with the referral link can in turn sign up with a custom referral form. So, when the friend sign's up, the 'original person' who referred gets 40 points. If the friend inturn gives the link to another friend of his and he signs up, the friend now gets 40 points and the 'original person' gets 20 points. So, the no. of. points awarded to 'original person' decreases by half with every new person added to the chain of referrals till the points reaches 1.
