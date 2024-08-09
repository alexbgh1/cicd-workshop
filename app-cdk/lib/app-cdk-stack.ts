import { Stack, StackProps, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";

interface ConsumerProps extends StackProps {
  ecrRepository: ecr.Repository;
}

export class AppCdkStack extends Stack {
  public readonly fargateService: ecsPatterns.ApplicationLoadBalancedFargateService;
  public readonly greenTargetGroup: elbv2.ApplicationTargetGroup;
  public readonly greenLoadBalancerListener: elbv2.ApplicationListener;

  constructor(scope: Construct, id: string, props: ConsumerProps) {
    super(scope, `${id}-app-stack`, props);

    // Create a VPC
    const vpc = new ec2.Vpc(this, `${id}-Vpc`);

    // Create an ECS (Elastic Container Service) cluster
    const cluster = new ecs.Cluster(this, `${id}-EcsCluster`, {
      vpc: vpc,
    });

    if (`${id}` == "prod") {
      // ----- Blue deployment configuration -----
      this.fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, `${id}-FargateService`, {
        cluster: cluster,
        publicLoadBalancer: true,
        memoryLimitMiB: 1024,
        cpu: 512,
        desiredCount: 1,
        taskImageOptions: {
          image: ecs.ContainerImage.fromEcrRepository(props.ecrRepository),
          containerName: "my-app",
          containerPort: 8081,
        },
        deploymentController: {
          type: ecs.DeploymentControllerType.CODE_DEPLOY,
        },
      });

      // ----- Green deployment configuration -----
      // While in the prod condition code block, create and attach an additional Load Balancer listener and target group to the service to route test traffic during deployment
      this.greenLoadBalancerListener = this.fargateService.loadBalancer.addListener(`${id}-GreenLoadBalancerListener`, {
        port: 81,
        protocol: elbv2.ApplicationProtocol.HTTP,
      });

      this.greenTargetGroup = new elbv2.ApplicationTargetGroup(this, `${id}-GreenTargetGroup`, {
        port: 80,
        targetType: elbv2.TargetType.IP,
        vpc: vpc,
      });

      this.greenLoadBalancerListener.addTargetGroups(`${id}-GreenListener`, {
        targetGroups: [this.greenTargetGroup],
      });

      this.greenTargetGroup.configureHealthCheck({
        timeout: Duration.seconds(10),
        unhealthyThresholdCount: 2,
        healthyThresholdCount: 2,
        interval: Duration.seconds(11),
        path: "/my-app",
      });
    } else {
      // ----- Test deployment configuration -----
      this.fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, `${id}-FargateService`, {
        cluster: cluster,
        publicLoadBalancer: true,
        memoryLimitMiB: 1024,
        cpu: 512,
        desiredCount: 1,
        taskImageOptions: {
          image: ecs.ContainerImage.fromEcrRepository(props.ecrRepository),
          containerName: "my-app",
          containerPort: 8081,
        },
      });
    }

    // ----- Health check configuration -----
    // Configure the health check for the target group
    this.fargateService.targetGroup.configureHealthCheck({
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 2,
      timeout: Duration.seconds(10),
      interval: Duration.seconds(11),
      path: "/my-app",
    });

    // Configure the deregistration delay for the target group. This is used to prevent the target from being deregistered too soon
    this.fargateService.targetGroup.setAttribute("deregistration_delay.timeout_seconds", "5");
  }
}
