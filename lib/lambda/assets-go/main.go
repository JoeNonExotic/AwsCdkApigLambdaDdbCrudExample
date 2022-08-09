package main

import (
	"context"
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"net/http"
)

func HandleRequest(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	fmt.Println(fmt.Sprintf("Received request %v with context %s", req, ctx))
	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Body:       "OK!",
	}, nil
}

func main() {
	lambda.Start(HandleRequest)
}
