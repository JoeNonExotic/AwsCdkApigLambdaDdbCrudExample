import {
  IResource,
  LambdaIntegration,
  MockIntegration,
  PassthroughBehavior,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

import { ApplicationLambdas } from "../lambda";

/**
 * Props for Apig construct.
 */
export interface ApplicationApigProps {
  applicationLambdas: ApplicationLambdas;
}

/**
 * Custom construct to set up API Gateway.
 */
export class ApplicationApig extends Construct {
  public constructor(
    scope: Construct,
    id: string,
    props: ApplicationApigProps
  ) {
    super(scope, id);

    // setup lambda integration with APIG (proxy mode)
    const createEntryIntegration: LambdaIntegration = new LambdaIntegration(
      props.applicationLambdas.createEntryLambda
    );
    const readEntryIntegration: LambdaIntegration = new LambdaIntegration(
      props.applicationLambdas.readEntryLambda
    );
    const updateEntryIntegration: LambdaIntegration = new LambdaIntegration(
      props.applicationLambdas.updateEntryLambda
    );
    const deleteEntryIntegration: LambdaIntegration = new LambdaIntegration(
      props.applicationLambdas.deleteEntryLambda
    );
    const healthCheckIntegration: LambdaIntegration = new LambdaIntegration(
      props.applicationLambdas.healthCheckLambda
    );

    // Create an API Gateway resource for each of the CRUD operations
    const api = new RestApi(this, "ApplicationApi", {
      restApiName: "Application Service",
    });

    // setup create/update APIs
    const messageCreateResource = api.root.addResource("messages");
    messageCreateResource.addMethod("POST", createEntryIntegration);
    messageCreateResource.addMethod("PUT", updateEntryIntegration);
    this.addCorsOptions(messageCreateResource);

    // setup other APIs.
    const genericMessageResource =
      messageCreateResource.addResource("{messageId}");
    genericMessageResource.addMethod("GET", readEntryIntegration);
    genericMessageResource.addMethod("DELETE", deleteEntryIntegration);
    this.addCorsOptions(genericMessageResource);

    //setup healthcheck
    const healthcheckResource = api.root.addResource("ping");
    healthcheckResource.addMethod("GET", healthCheckIntegration);
  }

  /**
   * Configure CORS for the provided API resource.
   * NOTE: !!!!DO NOT USE FOR PRODUCTION!!!!
   * @param apiResource the API's {@link IResource}
   * @private
   */
  private addCorsOptions(apiResource: IResource) {
    apiResource.addMethod(
      "OPTIONS",
      new MockIntegration({
        integrationResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Headers":
                "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
              // meh - i dont like it, but this is only for demo.
              "method.response.header.Access-Control-Allow-Origin": "'*'",
              // do not want!
              "method.response.header.Access-Control-Allow-Credentials":
                "'false'",
              "method.response.header.Access-Control-Allow-Methods":
                "'OPTIONS,GET,PUT,POST,DELETE'",
            },
          },
        ],
        passthroughBehavior: PassthroughBehavior.NEVER,
        requestTemplates: {
          "application/json": '{"statusCode": 200}',
        },
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Headers": true,
              "method.response.header.Access-Control-Allow-Methods": true,
              "method.response.header.Access-Control-Allow-Credentials": true,
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );
  }
}
