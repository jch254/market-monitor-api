import { DynamoDB } from "aws-sdk";
import moment from "moment";
import { v4 } from "uuid";
import UserMarketDigest from "./UserMarketDigest";
import ResponseError from "./ResponseError";

const db = process.env.IS_OFFLINE
  ? new DynamoDB.DocumentClient({
      region: "localhost",
      accessKeyId: "MOCK_ACCESS_KEY_ID",
      secretAccessKey: "MOCK_SECRET_ACCESS_KEY",
      endpoint: `http://${process.env.DYNAMODB_HOST || "localhost"}:${
        process.env.DYNAMODB_PORT || 8000
      }`,
    })
  : new DynamoDB.DocumentClient();

export async function getUserMarketDigests(): Promise<UserMarketDigest[]> {
  const params = {
    TableName: "user-market-digestz",
  };

  const data = await db.scan(params).promise();

  return data.Items as UserMarketDigest[];
}

export async function getUserMarketDigestById(
  userMarketDigestId: string
): Promise<UserMarketDigest> {
  const params = {
    TableName: "user-market-digestz",
    Key: {
      id: userMarketDigestId,
    },
  };

  const data = await db.get(params).promise();

  if (data.Item === undefined) {
    throw new ResponseError({
      statusCode: 404,
      message: `A market digest could not be found with id: ${userMarketDigestId}`,
    });
  }

  return data.Item as UserMarketDigest;
}

export async function createUserMarketDigest(
  discogsUsername: string,
  shipsFrom: string,
  destinationEmail: string
): Promise<UserMarketDigest> {
  const params = {
    TableName: "user-market-digestz",
    ConditionExpression:
      "attribute_not_exists(id) AND attribute_not_exists(discogsUsername)",
    Item: {
      id: v4(),
      discogsUsername,
      shipsFrom,
      destinationEmail,
      createdUtc: moment().utc().toISOString(),
    },
  };

  await db.put(params).promise();

  return params.Item;
}

// TODO: Add update func

export async function deleteUserMarketDigest(
  userMarketDigestId: string
): Promise<void> {
  try {
    const params = {
      TableName: "user-market-digestz",
      ConditionExpression: "attribute_exists(id)",
      Key: {
        id: userMarketDigestId,
      },
    };

    await db.delete(params).promise();
  } catch (err: any) {
    if (err.code === "ConditionalCheckFailedException") {
      throw new ResponseError({
        statusCode: 404,
        message: `An market digest could not be found with id: ${userMarketDigestId}`,
      });
    }

    throw err;
  }
}
