import { CloudWatchEvents, Lambda } from "aws-sdk";

const cw = new CloudWatchEvents();

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

  const lambda = new Lambda();

  const addPermissionParams = {
    Action: "lambda:InvokeFunction",
    FunctionName: process.env.MARKET_MONITOR_LAMBDA_FUNCTION_ARN || "",
    Principal: "events.amazonaws.com",
    StatementId: `MarketMonitor-${discogsUsername}`,
    SourceArn: RuleArn,
  };

  await lambda.addPermission(addPermissionParams).promise();
};
