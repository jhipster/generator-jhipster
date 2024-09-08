import type { Entity } from '../../types/base/entity.js';
import type { Field } from '../../types/base/field.js';
import type { Relationship } from '../../types/base/relationship.js';
import type { YO_RC_CONFIG_KEY } from '../../utils/yo-rc.ts';

export type JSONField = Field & Record<string, any>;

export type JSONRelationship = Relationship & Record<string, any>;

export type JSONEntity = Entity<JSONField, JSONRelationship> & Record<string, any>;

type JSONBlueprint = {
  name: string;
  version?: string;
} & Record<string, any>;

type JSONMicrofrontend = {
  baseName: string;
};
type JSONGeneratorJhipsterContentDeployment = {
  appsFolders?: string[];
  clusteredDbApps?: string[];
};

type AbstractJSONGeneratorJhipsterContent = {
  baseName: string;
  applicationType?: string;
} & JSONGeneratorJhipsterContentDeployment &
  Record<string, any>;

type JSONGeneratorJhipsterContent = {
  promptValues?: Partial<JSONGeneratorJhipsterContent>;
  blueprints?: JSONBlueprint[] | null;
  microfrontends?: JSONMicrofrontend[] | null;
} & AbstractJSONGeneratorJhipsterContent;

type PostProcessedJSONGeneratorJhipsterContent = {
  blueprints?: string[];
  microfrontends?: string[];
} & AbstractJSONGeneratorJhipsterContent;

export type PostProcessedJSONRootObject = {
  [YO_RC_CONFIG_KEY]: PostProcessedJSONGeneratorJhipsterContent;
};

export type JHipsterYoRcContent = {
  [YO_RC_CONFIG_KEY]: JSONGeneratorJhipsterContent;
};

export type JHipsterYoRcContentWrapper = {
  application?: PostProcessedJSONRootObject | JHipsterYoRcContent;
};
