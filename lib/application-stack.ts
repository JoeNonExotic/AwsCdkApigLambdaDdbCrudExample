import { Stack } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import { ApplicationDdb } from "./dynamo";
import { ApplicationLambdas } from "./lambda";

export class ApplicationStack extends Stack {
  /**
   * Infra for app lambdas.
   * @private
   */
  private readonly applicationLambdas: ApplicationLambdas;

  /**
   * Infra for app store.
   * @private
   */
  private readonly applicationDdb: ApplicationDdb;

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
  }
}
