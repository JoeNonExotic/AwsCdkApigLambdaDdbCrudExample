import { RemovalPolicy } from "aws-cdk-lib";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

const MAX_READ_CAPACITY = 5;
const MAX_WRITE_CAPACITY = 5;

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
      readCapacity: MAX_READ_CAPACITY,
      writeCapacity: MAX_WRITE_CAPACITY,
      billingMode: BillingMode.PROVISIONED,
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}
