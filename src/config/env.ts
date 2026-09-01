import "dotenv/config";

export const env = {
  port: Number(process.env.PORT || 5000),

  nodeEnv:
    process.env.NODE_ENV || "development",

  databaseUrl:
    process.env.DATABASE_URL!,

  jwtAccessSecret:
    process.env.JWT_ACCESS_SECRET!,

  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET!,

  awsRegion:
    process.env.AWS_REGION!,

  awsAccessKeyId:
    process.env.AWS_ACCESS_KEY_ID!,

  awsSecretAccessKey:
    process.env.AWS_SECRET_ACCESS_KEY!,

  awsBucket:
    process.env.AWS_S3_BUCKET!,
};