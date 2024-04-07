import { CloudWatchEvents, Lambda } from "aws-sdk";

const cw = new CloudWatchEvents();
const lambda = new Lambda();

export const createCloudWatchEventSchedule = async (
  discogsUsername: string,
  shipsFrom: string,
  destinationEmail: string
) => {
  var params = {
    Name: `MarketMonitor-${discogsUsername}`,
    ScheduleExpression: "rate(12 hours)",
    State: "ENABLED",
    Description: `Discogs Market Monitor Event Rule for ${discogsUsername}`,
  };

  const { RuleArn } = await cw.putRule(params).promise();

  const targetParams = {
    Rule: `MarketMonitor-${discogsUsername}`,
    Targets: [
      {
        Arn: process.env.MARKET_MONITOR_LAMBDA_FUNCTION_ARN || "",
        Id: "RunMarketMonitorLambda",
        Input: `{"destinationEmail":"${destinationEmail}", "username":"${discogsUsername}", "shipsFrom":"${shipsFrom}"}`,
      },
    ],
  };

  await cw.putTargets(targetParams).promise();
  await addLambdaPermission(discogsUsername, RuleArn);
};

const addLambdaPermission = async (
  discogsUsername: string,
  sourceArn?: string
) => {
  const addPermissionParams = {
    Action: "lambda:InvokeFunction",
    FunctionName: process.env.MARKET_MONITOR_LAMBDA_FUNCTION_ARN || "",
    Principal: "events.amazonaws.com",
    StatementId: `MarketMonitor-${discogsUsername}`,
    SourceArn: sourceArn,
  };

  try {
    const { Policy } = await lambda
      .getPolicy({ FunctionName: addPermissionParams.FunctionName })
      .promise();

    const policyDocument = JSON.parse(Policy || "");

    const permissionExists = policyDocument.Statement.some(
      (statement: { Sid?: string }) =>
        statement.Sid === addPermissionParams.StatementId
    );

    if (!permissionExists) {
      await lambda.addPermission(addPermissionParams).promise();
    }
  } catch (err: any) {
    if (err.code === "ResourceNotFoundException") {
      await lambda.addPermission(addPermissionParams).promise();
    } else {
      throw err;
    }
  }
};

export const deleteCloudWatchEventSchedule = async (
  discogsUsername: string
) => {
  const deleteRuleParams = {
    Name: `MarketMonitor-${discogsUsername}`,
  };

  await cw.deleteRule(deleteRuleParams).promise();

  const removeTargetsParams = {
    Rule: `MarketMonitor-${discogsUsername}`,
    Ids: ["RunMarketMonitorLambda"],
  };

  await cw.removeTargets(removeTargetsParams).promise();

  const removePermissionParams = {
    FunctionName: process.env.MARKET_MONITOR_LAMBDA_FUNCTION_ARN || "",
    StatementId: `MarketMonitor-${discogsUsername}`,
  };

  await lambda.removePermission(removePermissionParams).promise();
};
