export default {
  url: process.env.AWS_APPSYNC_GRAPHQL_ENDPOINT,
  region: process.env.AWS_APPSYNC_REGION,
  auth: {
    type: process.env.AWS_APPSYNC_AUTHENTICATION_TYPE,
    apiKey: process.env.AWS_APPSYNC_APIKEY,
  },
};
