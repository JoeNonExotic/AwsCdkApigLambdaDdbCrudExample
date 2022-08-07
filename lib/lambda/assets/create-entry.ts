import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import * as AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

import PutItemInput = AWS.DynamoDB.DocumentClient.PutItemInput;
import PutItemOutput = AWS.DynamoDB.DocumentClient.PutItemOutput;

// define constants
const TABLE_NAME = process.env.TABLE_NAME ?? "";
const ddbDocumentClient = new AWS.DynamoDB.DocumentClient();

/**
 * Input body format.
 */
export interface CreateEntryInput {
  // Partition Key
  MessageId: string;
  Message: string;
}

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  // log
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);

  // some preliminary validation (a little more work and a swagger spec can take care of this for you)
  if (!event.body) {
    return {
      statusCode: 400,
      body: "invalid request, you are missing the parameter body",
    };
  }
  const createEntryInput: CreateEntryInput = JSON.parse(
    event.body
  ) as CreateEntryInput;
  if (!createEntryInput.Message) {
    return {
      statusCode: 400,
      body: "Missing message from body",
    } as APIGatewayProxyResult;
  }

  // supply an id with high entropy in case one is not presented
  createEntryInput.MessageId = createEntryInput.MessageId ?? uuidv4();

  // prepare entry for insert
  const params: PutItemInput = {
    TableName: TABLE_NAME,
    Item: createEntryInput,
  };

  try {
    // put item into the table.
    const result: PutItemOutput = await ddbDocumentClient.put(params).promise();
    console.log("Item put result: ", result);
    return {
      statusCode: 200,
      body: "Successfully added entry to the table",
    } as APIGatewayProxyResult;
  } catch (err) {
    return { statusCode: 500, body: err.message } as APIGatewayProxyResult;
  }
};
