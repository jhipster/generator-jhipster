import assert from 'yeoman-assert';
import { jestExpect as expect } from 'mocha-expect-snapshot';

import { basicHelpers as helpers } from '../../test/support/index.mjs';
import { GENERATOR_OPENAPI_CLIENT } from '../generator-list.mjs';

const basePackage = 'src/main/java/com/mycompany/myapp';

const openapiFile = `openapi: "3.0.0"
info:
  version: 1.0.0
  title: Swagger Petstore
  license:
    name: MIT
servers:
  - url: http://petstore.swagger.io/v1
paths:
  /pets:
    get:
      summary: List all pets
      operationId: listPets
      tags:
        - pets
      parameters:
        - name: limit
          in: query
          description: How many items to return at one time (max 100)
          required: false
          schema:
            type: integer
            format: int32
      responses:
        '200':
          description: A paged array of pets
          headers:
            x-next:
              description: A link to the next page of responses
              schema:
                type: string
          content:
            application/json:    
              schema:
                $ref: "#/components/schemas/Pets"
        default:
          description: unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
    post:
      summary: Create a pet
      operationId: createPets
      tags:
        - pets
      responses:
        '201':
          description: Null response
        default:
          description: unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
  /pets/{petId}:
    get:
      summary: Info for a specific pet
      operationId: showPetById
      tags:
        - pets
      parameters:
        - name: petId
          in: path
          required: true
          description: The id of the pet to retrieve
          schema:
            type: string
      responses:
        '200':
          description: Expected response to a valid request
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Pets"
        default:
          description: unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
components:
  schemas:
    Pet:
      required:
        - id
        - name
      properties:
        id:
          type: integer
          format: int64
        name:
          type: string
        tag:
          type: string
    Pets:
      type: array
      items:
        $ref: "#/components/schemas/Pet"
    Error:
      required:
        - code
        - message
      properties:
        code:
          type: integer
          format: int32
        message:
          type: string`;

describe('generator - OpenAPI Client', () => {
  //--------------------------------------------------
  // Spring Cloud Client tests
  //--------------------------------------------------
  describe('Spring: microservice petstore custom endpoint ', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .runJHipster(GENERATOR_OPENAPI_CLIENT)
        .withJHipsterConfig({
          applicationType: 'microservice',
          baseName: 'sampleOpenApiClient',
          enableSwaggerCodegen: true,
        })
        .withAnswers({
          action: 'new',
          specOrigin: 'custom-endpoint',
          customEndpoint: 'petstore-openapi-3.yml',
          cliName: 'petstore',
        });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates .openapi-generator-ignore-file', () => {
      assert.file('.openapi-generator-ignore');
    });
  });

  describe('Spring: microservice petstore regenerate ', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .runJHipster(GENERATOR_OPENAPI_CLIENT)
        .withJHipsterConfig({
          applicationType: 'microservice',
          baseName: 'sampleOpenApiClient',
          enableSwaggerCodegen: true,
          openApiClients: {
            petstore: {
              spec: 'petstore-openapi-3.yml',
              generatorName: 'spring',
            },
          },
        })
        .withFiles({
          [`${basePackage}/client/petstore/api/PetsApiClientOld.java`]: '',
          'petstore-openapi-3.yml': openapiFile,
        })
        .commitFiles()
        .withOptions({ regen: true });
    });

    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('has removed old client file', () => {
      assert.noFile(`${basePackage}/client/petstore/api/PetsApiClientOld.java`);
    });
  });
});
