import { APIGatewayProxyEvent } from "aws-lambda";

const VALIDATION_KEY = "FDL1QdAfI1c2U1gIzkcH";

/**
 * A poor man's way to restrict usage of AWS Resources. That's all imma say about it.
 * @param event Incoming {@link APIGatewayProxyEvent} to validate.
 */
export function shouldProcessEvent(event: APIGatewayProxyEvent): boolean {
  if (
    !event.queryStringParameters ||
    !event.queryStringParameters.validationKey
  ) {
    console.log("validation key is missing");
    return false;
  }
  if (event.queryStringParameters.validationKey !== VALIDATION_KEY) {
    console.log(
      "validation key is present, but invalid",
      event.queryStringParameters.validationKey
    );
    return false;
  }
  return true;
}
