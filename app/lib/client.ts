import { GraphQLClient } from "graphql-request";
import { getSdk } from "../../generated/app.generated";

const client = getSdk(new GraphQLClient(process.env.EXCHANGE_ENDPOINT!));

export default client;
