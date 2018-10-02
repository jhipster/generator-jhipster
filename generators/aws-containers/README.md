# JHipster sub-generator for AWS Fargate

## AWS

### ECR

#### Authentication Token

The token received by ECR to authenticate is structured as follows. We'll only take the first object.

```json
{
    "authorizationToken": "AUTHORIZATION_TOKEN",
    "expiresAt": "2017-12-12T10:52:24.810Z",
    "proxyEndpoint": "https://foo.ecr.region.amazonaws.com"
}
```

## Development

### Dependencies

```
# NPM
npm i --save-dev aws-sdk@2.167.0 progress@2.0.0 ora@1.3.0

# Yarn
yarn add --dev aws-sdk@2.167.0 progress@2.0.0 ora@1.3.0
```
