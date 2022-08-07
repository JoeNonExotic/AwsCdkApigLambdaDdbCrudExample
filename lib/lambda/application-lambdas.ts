import { Table } from "aws-cdk-lib/aws-dynamodb";
import { ManagedPolicy } from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

/**
 * Props for {@link ApplicationLambdas}
 */
export interface ApplicationLambdaFunctionProps {
  messageEntryTable: Table;
}

/**
 * Custom construct to set up application lambdas.
 */
export class ApplicationLambdas extends Construct {
  /**
   * Lambda function to create entry into ddb.
   */
  public readonly createEntryLambda: NodejsFunction;

  public constructor(
    scope: Construct,
    id: string,
    props: ApplicationLambdaFunctionProps
  ) {
    super(scope, id);

    // setup CreateEntry Lambda Function
    this.createEntryLambda = new NodejsFunction(this, "CreateEntryLambda", {
      entry: join(__dirname, "assets", "create-entry.ts"),
      ...this.getDefaultNodeJsLambdaFuncProps(props),
    });

    // setup basic lambda execution role policy.
    this.createEntryLambda.role?.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );

    // give lambda permissions to read/write from the message store ddb.
    props.messageEntryTable.grantReadWriteData(this.createEntryLambda);
  }

  /**
   * Obtain default NodeJs lambda function props.
   */
  private getDefaultNodeJsLambdaFuncProps(
    props: ApplicationLambdaFunctionProps
  ): NodejsFunctionProps {
    return {
      bundling: {
        externalModules: [
          "aws-sdk", // Use the 'aws-sdk' available in the Lambda runtime
        ],
      },
      depsLockFilePath: join(__dirname, "assets", "package-lock.json"),
      environment: {
        PARTITION_KEY: "MessageId",
        TABLE_NAME: props.messageEntryTable.tableName,
      },
      runtime: Runtime.NODEJS_14_X,
    } as NodejsFunctionProps;
  }
}
