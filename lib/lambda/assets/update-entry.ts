import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import * as AWS from "aws-sdk";

import { shouldProcessEvent } from "./utils";

import UpdateItemInput = AWS.DynamoDB.DocumentClient.UpdateItemInput;
import UpdateItemOutput = AWS.DynamoDB.DocumentClient.UpdateItemOutput;

const TABLE_NAME = process.env.TABLE_NAME ?? "";
const PARTITION_KEY = process.env.PARTITION_KEY ?? "";
const ddbDocumentClient = new AWS.DynamoDB.DocumentClient();

/**
 * Input body format.
 */
export interface UpdateEntryInput {
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
  if (!shouldProcessEvent(event)) {
    return {
      statusCode: 400,
      body: "Not so fast!",
    };
  }
  // some primary validation
  if (!event.body) {
    return {
      statusCode: 400,
      body: "invalid request, missing body",
    };
  }
  const entryToUpdate: UpdateEntryInput = JSON.parse(
    event.body
  ) as UpdateEntryInput;

  if (!entryToUpdate.MessageId || !entryToUpdate.Message) {
    return {
      statusCode: 400,
      body: "invalid request body",
    };
  }

  const params: UpdateItemInput = {
    TableName: TABLE_NAME,
    Key: {
      [PARTITION_KEY]: entryToUpdate.MessageId,
    },
    UpdateExpression: `set Message = :updatedMessage`,
    ExpressionAttributeValues: {
      ":updatedMessage": entryToUpdate.Message,
    },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const result: UpdateItemOutput = await ddbDocumentClient
      .update(params)
      .promise();
    console.log("Item updated", result);
    return { statusCode: 204, body: "" };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};
