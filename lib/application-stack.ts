import { Stack } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import { ApplicationApig } from "./apig/application-apig";
import { ApplicationDdb } from "./dynamo";
import { ApplicationLambdas } from "./lambda";

export class ApplicationStack extends Stack {
  /**
   * Infra for application lambdas.
   * @private
   */
  private readonly applicationLambdas: ApplicationLambdas;

  /**
   * Infra for application store.
   * @private
   */
  private readonly applicationDdb: ApplicationDdb;

  /**
   * Infra for API Gateway.
   * @private
   */
  private readonly applicationApig: ApplicationApig;

  public constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.applicationDdb = new ApplicationDdb(this, "ApplicationDdb");
    this.applicationLambdas = new ApplicationLambdas(
      this,
      "ApplicationLambdas",
      {
        messageEntryTable: this.applicationDdb.messageStore,
      }
    );
    this.applicationApig = new ApplicationApig(this, "ApplicationApig", {
      applicationLambdas: this.applicationLambdas,
    });
  }
}
