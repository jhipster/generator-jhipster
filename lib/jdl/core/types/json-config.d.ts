import type { ApplicationConfiguration, YoRcContent } from '../../../types/application/yo-rc.js';
import type { Entity } from '../../../types/base/entity.js';
import type { Field } from '../../../types/base/field.js';
import type { Relationship } from '../../../types/base/relationship.js';

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

type AbstractJSONGeneratorJhipsterContent = ApplicationConfiguration & JSONGeneratorJhipsterContentDeployment & Record<string, any>;

type JSONGeneratorJhipsterContent = {
  promptValues?: Partial<JSONGeneratorJhipsterContent>;
  blueprints?: JSONBlueprint[] | null;
} & AbstractJSONGeneratorJhipsterContent;

type PostProcessedJSONGeneratorJhipsterContent = {
  blueprints?: string[];
  microfrontends?: string[];
} & AbstractJSONGeneratorJhipsterContent;

export type PostProcessedJSONRootObject = YoRcContent<
  Omit<PostProcessedJSONGeneratorJhipsterContent, 'blueprints' | 'microfrontends'> & {
    blueprints?: string[];
    microfrontends?: string[];
  }
>;

export type JHipsterYoRcContent = YoRcContent<JSONGeneratorJhipsterContent>;

export type JHipsterYoRcContentWrapper = {
  application?: PostProcessedJSONRootObject | JHipsterYoRcContent;
};
