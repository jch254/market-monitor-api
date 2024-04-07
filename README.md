# [Market-monitor-api](https://market-monitor.603.nz/pingo)

![Build Status](https://codebuild.ap-southeast-2.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoieDBLRm92M01yMmQxT3JuOEtsNDlPRjVjR3c3T2FIaFpDTDVkVzdFVWFQUWVpYXBscUVvQ0NCYTdQd3I0cXVVVzZKd3BNZnpERWQ5QklxdE9POUJNU1BrPSIsIml2UGFyYW1ldGVyU3BlYyI6IlZrcHdzU0JrZk1rd1VmdUQiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=master)

API powered by Serverless, TypeScript, Webpack, Node.js and DynamoDB to power the [Discogs Market Monitor](https://github.com/jch254/discogs-market-monitor) sign up [UI](https://github.com/jch254/market-monitor-ui).

---

## Running locally (with live-reloading and local DynamoDB server)

### Environment variables

- **VALID_API_TOKENS** - Comma separated API auth tokens
- **SENDGRID_API_KEY** (req) - Auth for SendGrid account
- **SENDER_EMAIL** (req) - Email address to send from via SendGrid (must be configured via SendGrid)

To run locally you must run two servers - DB and API.

Serverless-webpack, serverless-dynamodb-local and serverless-offline offer great tooling for local Serverless development. To start local servers that mimic AWS API Gateway and DyanamoDB, run the commands below. Both servers will fire up and code will be reloaded upon change so that every request to your API will serve the latest code.

Serverless-dynamodb-local requires Java Runtime Engine (JRE) version 6.x or newer.

**All required environment variables above must be set before `yarn run dev` command below. Optional DYNAMODB_PORT and DYNAMODB_HOST environment variables may be set to override the defaults (localhost:8000).**

E.g. `VALID_API_TOKENS=YOUR_COMMA_SEPARATED_TOKENS yarn run dev`

```
yarn install (serverless dynamodb install included as postinstall script)
yarn run dev
```

Submit requests to http://localhost:3000. The DynamoDB shell console is available at http://localhost:8000/shell.

## Running locally with Docker

Maintaining a Java installation for the sake of running DynamoDB locally is a pain, running in a Docker container is far easier. As above, to run locally you must run two servers - DB and API.

To start the local servers that mimic AWS API Gateway and DyanamoDB using docker, run the commands below.

**VALID_API_TOKENS environment variable must be set before `docker-compose up --build` command below.**

E.g. `VALID_API_TOKENS=YOUR_COMMA_SEPARATED_TOKENS docker-compose up --build`

```
docker-compose up --build
```

Submit requests to http://localhost:3000. The DynamoDB shell console is available at http://localhost:8000/shell.

## Testing

TBC

### Deployment/Infrastructure

Refer to the [/infrastructure](./infrastructure) directory.
