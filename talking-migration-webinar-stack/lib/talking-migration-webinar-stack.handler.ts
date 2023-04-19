import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { S3 } from "@aws-sdk/client-s3";
import { LDEvaluationReason, init } from "launchdarkly-node-server-sdk";
import { nanoid } from "nanoid";

const dynamoClient = new DynamoDB.DocumentClient();
const s3Client = new S3({
  region: process.env.REGION ?? "us-east-1",
});

// launchdarkly client initialization
const launchDarklyClient = init(process.env.LAUNCHDARKLY_SDK_KEY || "");

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Headers":
      "Origin,Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Origin": "*",
  };

  const { queryStringParameters } = event;

  console.log("query string parameters", queryStringParameters);

  try {
    // wait for initialization so we know we'll properly evaluate flags
    await launchDarklyClient.waitForInitialization();

    // build up the context for the evaluation rules
    const context = {
      kind: "user",
      key: queryStringParameters?.key || nanoid(),
      browser: queryStringParameters?.browser,
      cpu: queryStringParameters?.cpu,
      device: queryStringParameters?.device,
      engine: queryStringParameters?.engine,
      operatingSystem: queryStringParameters?.operatingSystem,
      name: queryStringParameters?.name,
      timezone: queryStringParameters?.timezone,
    };

    // identify this context as the target in the LaunchDarkly SDK
    launchDarklyClient.identify(context);

    // retrieve the database configuration variation based on the context we've provided
    const databaseConfig: {
      value: {
        dataSource: string;
        tableName: string;
        bucket?: string;
      };
      reason: LDEvaluationReason;
    } = await launchDarklyClient.variationDetail(
      // the name of the feature flag we're evaluating
      "database-connection-config",
      // the context we're providing for evaluation
      context,
      // default values if we can't reach the flag delivery network
      {
        dataSource: "S3",
        tableName: "data3.json",
      }
    );

    console.log("ld DATABASE evaluation reason: ", databaseConfig.reason);

    const apiConfig: {
      value: {
        apiVersion: string;
        baseUrl: string;
      };
      reason: LDEvaluationReason;
    } = await launchDarklyClient.variationDetail(
      "api-connection-configuration",
      context,
      {
        apiVersion: "v1",
        baseUrl:
          "https://a7jovj7go9.execute-api.us-east-1.amazonaws.com/prod/v1",
      }
    );

    console.log("ld API evaluation reason: ", apiConfig.reason);

    const source = {
      database: databaseConfig.value.dataSource,
      table: databaseConfig.value.tableName,
      apiVersion: apiConfig.value.apiVersion,
    };

    // the error for when we had an unsupport configuration with
    if (
      databaseConfig.value.dataSource === "DynamoDB" &&
      apiConfig.value.apiVersion === "v1"
    ) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: {
            message:
              "unsupported configuration. API v1 does not support DynamoDB",
          },
          items: [],
        }),
      };
    } else if (databaseConfig.value.dataSource === "DynamoDB") {
      // return {
      //   statusCode: 403,
      //   headers,
      //   body: JSON.stringify({
      //     error: { message: "Unable to query dynamo table" },
      //     items: [],
      //   }),
      // };

      const dynamoResults = await dynamoClient
        .scan({
          TableName: databaseConfig.value.tableName,
        })
        .promise();

      if (apiConfig.value.apiVersion === "v1") {
        return {
          statusCode: 200,
          body: JSON.stringify({
            source,
            reasons: {
              api: apiConfig.reason,
              db: databaseConfig.reason,
              context,
            },
            items: dynamoResults.Items,
          }),
          headers,
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          meta: {
            source,
            reasons: {
              api: apiConfig.reason,
              db: databaseConfig.reason,
              context,
            },
          },
          data: {
            items: dynamoResults.Items,
          },
        }),
        headers,
      };
    } else {
      const response = await s3Client.selectObjectContent({
        Bucket: databaseConfig.value.bucket,
        Key: databaseConfig.value.tableName,
        ExpressionType: "SQL",
        Expression: "SELECT * from S3Object",
        InputSerialization: {
          JSON: {
            Type: "Document",
          },
        },
        OutputSerialization: {
          JSON: {},
        },
      });

      if (response.Payload === undefined) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            source,
            reasons: {
              api: apiConfig.reason,
              db: databaseConfig.reason,
              context,
            },
            error: { message: "Error: no payload in response" },
            items: [],
          }),
        };
      }

      let count = 0;
      let records = [];

      for await (const item of response.Payload) {
        count++;
        console.log(`processing item ${count}`);
        if (item.Records && item.Records.Payload) {
          records.push(item.Records.Payload);
        }
      }

      let recordsString = Buffer.concat(records).toString("utf-8");

      console.log(`records string: ${recordsString}`);

      const recordSet = JSON.parse(recordsString);

      if (apiConfig.value.apiVersion === "v1") {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            source,
            reasons: {
              api: apiConfig.reason,
              db: databaseConfig.reason,
              context,
            },
            items: recordSet["_1"],
          }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          meta: {
            source,
            reasons: {
              api: apiConfig.reason,
              db: databaseConfig.reason,
              context,
            },
          },
          data: {
            items: recordSet["_1"],
          },
        }),
      };
    }
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "sorry, it is not working",
      }),
    };
  }
}
