import { APIGatewayEvent, Context } from "aws-lambda";
import * as AWS from "aws-sdk";

import { shouldProcessEvent } from "./utils";

// define constants
const TABLE_NAME = process.env.TABLE_NAME ?? "";

const PARTITION_KEY = process.env.PARTITION_KEY ?? "";
const ddbDocumentClient = new AWS.DynamoDB.DocumentClient();

import DeleteItemInput = AWS.DynamoDB.DocumentClient.DeleteItemInput;
import DeleteItemOutput = AWS.DynamoDB.DocumentClient.DeleteItemOutput;

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<any> => {
  // log
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);
  if (!shouldProcessEvent(event)) {
    return {
      statusCode: 400,
      body: "Not so fast!",
    };
  }
  // some primary validation
  if (!event.pathParameters || !event.pathParameters.messageId) {
    return {
      statusCode: 400,
      body: `Error: You are missing the path parameter messageId`,
    };
  }
  const requestedItemId = event.pathParameters.messageId;

  const params: DeleteItemInput = {
    TableName: TABLE_NAME,
    Key: {
      [PARTITION_KEY]: requestedItemId,
    },
  };

  try {
    const result: DeleteItemOutput = await ddbDocumentClient
      .delete(params)
      .promise();
    console.log("Delete result", result);
    return { statusCode: 200, body: "" };
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};
