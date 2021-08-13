import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import {readFileSync} from 'fs';

export class Isucon11PStack extends cdk.Stack {
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
    for (var port of [22, 80, 443, 3306]) {
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
    const instanceType = new ec2.InstanceType('c5.large')

    // NOTE: Ubuntu 20.04 LTS
    const machineImage = ec2.MachineImage.genericLinux({'ap-northeast-1': 'ami-0df99b3a8349462c6'})
    const availabilityZone = vpc.publicSubnets[0].availabilityZone

    // NOTE: レギュレーションに合わせるために論理1coreしか使わないようにする
    // See: https://github.com/isucon/isucon11-prior/blob/main/webapp/doc/MANUAL.md
    const userDataScript = readFileSync('lib/user_data.sh', 'utf-8')
    for (var instanceName of ['isucon']) {
      const instance = new ec2.Instance(this, `${id}-Instance-${instanceName}`, {
        instanceName: instanceName,
        instanceType: instanceType,
        machineImage: machineImage,
        vpc: vpc,
        availabilityZone: availabilityZone,
        securityGroup: securityGroup,
        keyName: keyName,
        role: role,
      })
      instance.addUserData(userDataScript)
    }

    // benchmarker
    new ec2.Instance(this, `${id}-Instance-benchmarker`, {
      instanceName: 'benchmarker',
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
