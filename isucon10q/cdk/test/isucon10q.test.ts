import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Isucon10Q from '../lib/isucon10q-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Isucon10Q.Isucon10QStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
