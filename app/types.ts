export type EnvVar =
  | "PUBLIC_ALCHEMY_KEY"
  | "PUBLIC_NODE_ENV"
  | "PUBLIC_ENABLE_TESTNETS"
  | "SNAPSHOT_API_URL";

export type Env = {
  [key in EnvVar]: string;
};

export type Optional<T> = T | undefined;
