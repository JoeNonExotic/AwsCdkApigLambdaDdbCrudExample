import { RemovalPolicy } from "aws-cdk-lib";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

/**
 * Custom construct for message store.
 */
export class ApplicationDdb extends Construct {
  /**
   * DDB based Storage for messages.
   */
  public readonly messageStore: Table;

  public constructor(scope: Construct, id: string) {
    super(scope, id);
    this.messageStore = new Table(this, "MessageStore", {
      partitionKey: {
        name: "MessageId",
        type: AttributeType.STRING,
      },
      readCapacity: 5,
      writeCapacity: 5,
      billingMode: BillingMode.PROVISIONED,
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}
