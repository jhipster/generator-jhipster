import type { Entity } from '../../../jhipster/types/entity.js';
import type { Field } from '../../../jhipster/types/field.js';
import type { Relationship } from '../../../jhipster/types/relationship.js';
import type { YoRcJHipsterContent } from '../../../jhipster/types/yo-rc.js';

export type JSONField = Field & Record<string, any>;

export type JSONRelationship = Relationship & Record<string, any>;

export type JSONEntity = Entity<JSONField, JSONRelationship> & Record<string, any>;

type JSONBlueprint = {
  name: string;
  version?: string;
} & Record<string, any>;

type JSONGeneratorJhipsterContentDeployment = {
  appsFolders?: string[];
  clusteredDbApps?: string[];
};

type AbstractJSONGeneratorJhipsterContent = JSONGeneratorJhipsterContentDeployment & Record<string, any>;

type JSONGeneratorJhipsterContent = {
  promptValues?: Partial<JSONGeneratorJhipsterContent>;
  blueprints?: JSONBlueprint[] | null;
} & AbstractJSONGeneratorJhipsterContent;

type PostProcessedJSONGeneratorJhipsterContent = {
  blueprints?: string[];
  microfrontends?: string[];
} & AbstractJSONGeneratorJhipsterContent;

export type PostProcessedJSONRootObject = YoRcJHipsterContent<
  Omit<PostProcessedJSONGeneratorJhipsterContent, 'blueprints' | 'microfrontends'> & {
    blueprints?: string[];
    microfrontends?: string[];
  }
>;

export type JHipsterYoRcContent = YoRcJHipsterContent<JSONGeneratorJhipsterContent>;

export type JHipsterYoRcContentWrapper = {
  application?: PostProcessedJSONRootObject | JHipsterYoRcContent;
};
