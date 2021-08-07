import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';

export class Isucon10QStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, `${id}-Vpc`, {
      cidr: '192.168.0.0/16',
      enableDnsHostnames: false,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    })

    const securityGroup = new ec2.SecurityGroup(this, `${id}-SG`, {
      vpc: vpc,
    })

    // NOTE: prefixListId set in ~/.cdk.json
    const prefixListId = this.node.tryGetContext('prefixListId')
    for (var port of [22, 80, 443]) {
      securityGroup.addIngressRule(
        ec2.Peer.prefixList(prefixListId),
        ec2.Port.tcp(port),
      )
    }
    securityGroup.addIngressRule(
      ec2.Peer.ipv4("192.168.0.0/16"),
      ec2.Port.allTcp(),
    )

    const role = new iam.Role(this, `${id}-IAM-Role`, {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
    })

    // NOTE: keyName set in ~/.cdk.json
    const keyName = this.node.tryGetContext('keyName')
    const instanceType = new ec2.InstanceType('t2.small')
    // NOTE: Ubuntu 18.04 LTS
    const machineImage = ec2.MachineImage.genericLinux({'ap-northeast-1': 'ami-07cc9d38cd43d37b0'})
    const availabilityZone = vpc.publicSubnets[0].availabilityZone
    for (var instanceName of ['isucon1', 'isucon2', 'isucon3', 'benchmarker']) {
      new ec2.Instance(this, `${id}-Instance-${instanceName}`, {
        instanceName: instanceName,
        instanceType: instanceType,
        machineImage: machineImage,
        vpc: vpc,
        availabilityZone: availabilityZone,
        securityGroup: securityGroup,
        keyName: keyName,
        role: role,
      })
    }
  }
}
