import {
  AuthResponse,
  APIGatewayEvent,
  Callback,
  Context,
  CustomAuthorizerEvent,
} from "aws-lambda";
import * as jwt from "jsonwebtoken";
import {
  getUserMarketDigests,
  getUserMarketDigestById,
  createUserMarketDigest,
  deleteUserMarketDigest,
} from "./database";
import Response from "./Response";
import ResponseError from "./ResponseError";

export async function pingHandler(event: APIGatewayEvent, context: Context) {
  console.log("pingoHandler");
  console.log("event", JSON.stringify(event));
  console.log("context", JSON.stringify(context));

  try {
    return new Response({ statusCode: 200, body: { message: "Chur" } });
  } catch (err: any) {
    console.log(err);

    throw new ResponseError({ message: err.message });
  }
}

export const authorizer = (
  event: CustomAuthorizerEvent,
  context: Context,
  callback: Callback
) => {
  console.log("authorizer");
  console.log("event", JSON.stringify(event));
  console.log("context", JSON.stringify(context));

  try {
    const authHeader = event.authorizationToken?.split(" ") || [];

    if (authHeader.length === 2 && authHeader[0].toLowerCase() === "bearer") {
      const decoded = jwt.verify(
        authHeader[1],
        process.env.AUTH0_CLIENT_SECRET as string
      ) as { sub: string };

      const authResponse: AuthResponse = {
        policyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Action: "execute-api:Invoke",
              Resource: [event.methodArn],
              Effect: "Allow",
            },
          ],
        },
        principalId: decoded.sub,
      };

      callback(undefined, authResponse);
    } else {
      callback("Unauthorized", undefined);
    }
  } catch (err) {
    console.log(err);
    callback("Unauthorized", undefined);
  }
};

// GET /market-digests
export async function getAllUserMarketDigestsHandler(
  event: APIGatewayEvent,
  context: Context
) {
  console.log("getAllUserMarketDigestsHandler");
  console.log("event", JSON.stringify(event));
  console.log("context", JSON.stringify(context));

  try {
    const marketDigests = await getUserMarketDigests();

    return new Response({ statusCode: 200, body: { marketDigests } });
  } catch (err: any) {
    console.log(err);

    throw new ResponseError({ message: err.message });
  }
}

// GET /market-digests/{id}
export async function getMarketDigestHandler(
  event: APIGatewayEvent,
  context: Context
) {
  console.log("getMarketDigestHandler");
  console.log("event", JSON.stringify(event));
  console.log("context", JSON.stringify(context));

  try {
    const item = await getUserMarketDigestById(event.pathParameters?.id || "");

    return new Response({ statusCode: 200, body: item });
  } catch (err: any) {
    console.log(err);

    throw err instanceof ResponseError
      ? err
      : new ResponseError({ message: err.message });
  }
}

// POST /market-digests
export async function createUserMarketDigestHandler(
  event: APIGatewayEvent,
  context: Context
) {
  console.log("createUserMarketDigestHandler");
  console.log("event", JSON.stringify(event));
  console.log("context", JSON.stringify(context));

  try {
    const { discogsUsername, shipsFrom, destinationEmail } = JSON.parse(
      event.body as string
    );
    const item = await createUserMarketDigest(
      discogsUsername,
      shipsFrom,
      destinationEmail
    );

    return new Response({ statusCode: 201, body: item });
  } catch (err: any) {
    console.log(err);

    throw new ResponseError({ message: err.message });
  }
}

// PATCH /market-digests/{id}
// TODO: Add updateItemHandler

// DELETE /market-digests/{id}
export async function deleteUserMarketDigestHandler(
  event: APIGatewayEvent,
  context: Context
) {
  console.log("deleteUserMarketDigest");
  console.log("event", JSON.stringify(event));
  console.log("context", JSON.stringify(context));

  try {
    await deleteUserMarketDigest(event.pathParameters?.id || "");

    return new Response({ statusCode: 200 });
  } catch (err: any) {
    console.log(err);

    throw err instanceof ResponseError
      ? err
      : new ResponseError({ message: err.message });
  }
}
