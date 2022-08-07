#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";

import { ApplicationStack } from "../lib";

const app = new cdk.App();
new ApplicationStack(app, "ApplicationStack", {
  description: "Application stack that deploys DDB, Lambda",
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  tags: {
    Stack: "ApplicationStack",
  },
  terminationProtection: false,
});
