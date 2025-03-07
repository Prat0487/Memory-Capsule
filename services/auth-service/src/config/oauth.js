export default {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID || '459964348020-dt5vpigjfctcchqm34o0okvh5jvc1e76.apps.googleusercontent.com',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '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',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback'
  }
};
