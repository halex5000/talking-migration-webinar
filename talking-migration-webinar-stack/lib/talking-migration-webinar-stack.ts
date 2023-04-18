import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Runtime } from "aws-cdk-lib/aws-lambda";

export class TalkingMigrationWebinarStackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const backend = new NodejsFunction(this, "handler", {
      memorySize: 2048,
      timeout: cdk.Duration.seconds(5),
      runtime: Runtime.NODEJS_18_X,
    });

    const api = new apigateway.LambdaRestApi(this, "talking-migration-api", {
      handler: backend,
      proxy: false,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const versionOne = api.root.addResource("v1", {});
    const versionOneItems = versionOne.addResource("items");
    versionOneItems.addMethod("GET");

    const versionTwo = api.root.addResource("v2", {});
    const versionTwoItems = versionTwo.addResource("items");
    versionTwoItems.addMethod("GET");

    const bucket = new Bucket(this, "talking-migration-webinar-bucket");

    bucket.grantRead(backend);
  }
}
