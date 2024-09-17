import gql from "graphql-tag";

export const getProposals = gql`
  query GetProposals {
    proposals(
      first: 5
      skip: 0
      where: { space: "treasuregaming.eth" }
      orderBy: "created"
      orderDirection: desc
    ) {
      id
      title
      body
      choices
      link
      state
    }
  }
`;
