import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { S3 } from "@aws-sdk/client-s3";
import { init } from "launchdarkly-node-server-sdk";

const dynamoClient = new DynamoDB.DocumentClient();
const s3Client = new S3({
  region: process.env.REGION ?? "us-east-1",
});

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

  try {
    await launchDarklyClient.waitForInitialization();

    const databaseConfig: {
      dataSource: string;
      tableName: string;
      bucket?: string;
    } = await launchDarklyClient.variation(
      "database-connection-config",
      {
        kind: "multi",
      },
      {
        dataSource: "S3",
        tableName: "data3.json",
      }
    );

    const apiConfig: {
      apiVersion: string;
      baseUrl: string;
    } = await launchDarklyClient.variation(
      "api-connection-configuration",
      {
        kind: "multi",
      },
      {
        apiVersion: "v1",
        baseUrl:
          "https://a7jovj7go9.execute-api.us-east-1.amazonaws.com/prod/v1",
      }
    );

    const source = {
      database: databaseConfig.dataSource,
      table: databaseConfig.tableName,
      apiVersion: apiConfig.apiVersion,
    };

    if (databaseConfig.dataSource === "DynamoDB") {
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
          TableName: databaseConfig.tableName,
        })
        .promise();
      return {
        statusCode: 200,
        body: JSON.stringify({
          source,
          items: dynamoResults.Items,
        }),
        headers,
      };
    } else {
      const response = await s3Client.selectObjectContent({
        Bucket: databaseConfig.bucket,
        Key: databaseConfig.tableName,
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

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ source, items: recordSet["_1"] }),
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
