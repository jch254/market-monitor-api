import { CloudWatchEvents } from "aws-sdk";

const cw = new CloudWatchEvents();

export const createCloudWatchEventSchedule = async (
  destinationEmail: string,
  username: string,
  shipsFrom: string
) => {
  var params = {
    Name: `MarketMonitor-${username}`,
    ScheduleExpression: "rate(12 hours)",
    State: "ENABLED",
    Description: `Discogs Market Monitor Event Rule for ${username}`,
  };

  await cw.putRule(params).promise();

  const targetParams = {
    Rule: `MarketMonitor-${username}`,
    Targets: [
      {
        Arn: process.env.MARKET_MONITOR_LAMBDA_FUNCTION_ARN || "",
        Id: "RunMarketMonitorLambda",
        Input: `{"destinationEmail":"${destinationEmail}", "username":"${username}", "shipsFrom":"${shipsFrom}"}`,
      },
    ],
  };

  await cw.putTargets(targetParams).promise();
};
