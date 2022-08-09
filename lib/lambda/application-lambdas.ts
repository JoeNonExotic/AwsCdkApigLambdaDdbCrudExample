import { Table } from "aws-cdk-lib/aws-dynamodb";
import { ManagedPolicy } from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as lambda from "aws-cdk-lib/aws-lambda";
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

  /**
   * Lambda function to read entry from ddb.
   */
  public readonly readEntryLambda: NodejsFunction;

  /**
   * Lambda function to update an entry from ddb.
   */
  public readonly updateEntryLambda: NodejsFunction;

  /**
   * Lambda function to delete entry from ddb.
   */
  public readonly deleteEntryLambda: NodejsFunction;

  /**
   * Lambda function in golang to do healthcheck.
   */
  public readonly healthCheckLambda: lambda.Function;

  public constructor(
    scope: Construct,
    id: string,
    props: ApplicationLambdaFunctionProps
  ) {
    super(scope, id);

    // setup CRUD Lambda functions.
    this.createEntryLambda = this.setupApplicationLambda(
      "CreateEntryLambda",
      "create-entry.ts",
      props
    );
    this.readEntryLambda = this.setupApplicationLambda(
      "ReadEntryLambda",
      "read-entry.ts",
      props
    );
    this.updateEntryLambda = this.setupApplicationLambda(
      "UpdateEntryLambda",
      "update-entry.ts",
      props
    );
    this.deleteEntryLambda = this.setupApplicationLambda(
      "DeleteEntryLambda",
      "delete-entry.ts",
      props
    );

    this.healthCheckLambda = this.setupApplicationGoLambda(
      "HealthCheckLambda",
      "main"
    );
  }

  /**
   * Sets up application lambda based on the provided params with default certain default settings.
   * @param functionId the logical function id
   * @param pathToEntryFile Path to the entry file
   * @param props props for this construct.
   * @return a default inited {@link NodejsFunction}.
   */
  private setupApplicationLambda(
    functionId: string,
    pathToEntryFile: string,
    props: ApplicationLambdaFunctionProps
  ): NodejsFunction {
    const lambdaFunc: NodejsFunction = new NodejsFunction(this, functionId, {
      entry: join(__dirname, "assets", pathToEntryFile),
      ...this.getDefaultNodeJsLambdaFuncProps(props),
    });
    lambdaFunc.role?.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );
    // give lambda permissions to read/write from the message store ddb.
    props.messageEntryTable.grantReadWriteData(lambdaFunc);
    return lambdaFunc;
  }

  /**
   * Sets up application lambda built using golang based on the provided params with default certain default settings.
   * @param functionId the logical function id
   */
  private setupApplicationGoLambda(
    functionId: string,
    handler: string
  ): lambda.Function {
    const environment = {
      CGO_ENABLED: "0",
      GOOS: "linux",
      GOARCH: "amd64",
    };
    const lambdaFunc: lambda.Function = new lambda.Function(this, functionId, {
      code: lambda.Code.fromAsset(join(__dirname, "assets-go"), {
        bundling: {
          image: lambda.Runtime.GO_1_X.bundlingImage,
          user: "root",
          environment,
          command: [
            "bash",
            "-c",
            ["make vendor", "make lambda-build"].join(" && "),
          ],
        },
      }),
      handler,
      runtime: lambda.Runtime.GO_1_X,
    });
    lambdaFunc.role?.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );
    return lambdaFunc;
  }

  /**
   * Obtain default NodeJs lambda function props.
   * @param props props for this construct.
   * @return NodejsFunctionProps an initialized {@link NodejsFunctionProps} with certain defaults.
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
        POOR_MANS_API_KEY: process.env.POOR_MANS_API_KEY,
      },
      runtime: Runtime.NODEJS_14_X,
    } as NodejsFunctionProps;
  }
}
