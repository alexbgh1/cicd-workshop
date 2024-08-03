import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as codepipeline_actions from "aws-cdk-lib/aws-codepipeline-actions";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

import { Stack, StackProps, CfnOutput } from "aws-cdk-lib";

export class PipelineCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Recupera el secreto de GitHub
    const githubSecret = secretsmanager.Secret.fromSecretNameV2(this, "GitHubSecret", "github/personal_access_token");

    // Crea un proyecto de CodeBuild

    // Define el pipeline
    const pipeline = new codepipeline.Pipeline(this, "Pipeline", {
      pipelineName: "CICD_Pipeline",
      crossAccountKeys: false,
    });

    const codeBuild = new codebuild.PipelineProject(this, "CodeBuild", {
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        privileged: true,
        computeType: codebuild.ComputeType.LARGE,
      },
    });

    // Define los artefactos
    const sourceOutput = new codepipeline.Artifact();
    const unitTestOutput = new codepipeline.Artifact();

    // Agrega la etapa de origen con GitHub
    pipeline.addStage({
      stageName: "Source",
      actions: [
        new codepipeline_actions.GitHubSourceAction({
          actionName: "GitHub_Source",
          owner: "alexbgh1",
          repo: "cicd-workshop",
          branch: "main",
          oauthToken: githubSecret.secretValue,
          output: sourceOutput,
        }),
      ],
    });

    pipeline.addStage({
      stageName: "Code-Quality-Testing",
      actions: [
        new codepipeline_actions.CodeBuildAction({
          actionName: "Unit-Test",
          project: codeBuild,
          input: sourceOutput,
          outputs: [unitTestOutput],
        }),
      ],
    });

    new CfnOutput(this, "CodeBuildProjectArn", {
      value: codeBuild.projectArn,
    });
  }
}
