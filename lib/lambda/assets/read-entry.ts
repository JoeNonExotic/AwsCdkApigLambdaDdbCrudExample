import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import * as AWS from "aws-sdk";

import { shouldProcessEvent } from "./utils";

// define constants
const TABLE_NAME = process.env.TABLE_NAME ?? "";
const PARTITION_KEY = process.env.PARTITION_KEY ?? "";
const ddbDocumentClient = new AWS.DynamoDB.DocumentClient();

import GetItemInput = AWS.DynamoDB.DocumentClient.GetItemInput;
import GetItemOutput = AWS.DynamoDB.DocumentClient.GetItemOutput;

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
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
  const params: GetItemInput = {
    TableName: TABLE_NAME,
    Key: {
      [PARTITION_KEY]: requestedItemId,
    },
  };
  try {
    const response: GetItemOutput = await ddbDocumentClient
      .get(params)
      .promise();
    console.log("Get response", response);
    if (response.Item) {
      return { statusCode: 200, body: JSON.stringify(response.Item) };
    }
    return { statusCode: 404, body: "Item not found" };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify(err) };
  }
};
