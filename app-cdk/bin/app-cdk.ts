import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AppCdkStack } from "../lib/app-cdk-stack";
import { PipelineCdkStack } from "../lib/pipeline-cdk-stack";
import { EcrCdkStack } from "../lib/ecr-cdk-stack";

const app = new cdk.App();

const ecrCdkStack = new EcrCdkStack(app, "ecr-stack", {});

const testCdkStack = new AppCdkStack(app, "test", {
  // The ECR repository created in the ECR stack is passed to the App stack
  ecrRepository: ecrCdkStack.repository,
});

const pipelineCdkStack = new PipelineCdkStack(app, "pipeline-stack", {
  ecrRepository: ecrCdkStack.repository,
  fargateServiceTest: testCdkStack.fargateService,
});
