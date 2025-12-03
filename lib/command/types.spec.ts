import type {
  ExportApplicationPropertiesFromCommand,
  ExportGeneratorOptionsFromCommand,
  ExportStoragePropertiesFromCommand,
} from './types.ts';

const _testCommand = {
  configs: {
    stringRootType: {
      cli: { type: String },
      scope: 'storage',
    },
    booleanCliType: {
      cli: { type: Boolean },
      scope: 'storage',
    },
    none: {
      scope: 'none',
    },
    choiceType: {
      cli: {
        type: String,
      },
      choices: ['foo', 'no'],
      scope: 'storage',
    },
    unknownType: {
      cli: {
        type: () => {},
      },
      scope: 'storage',
    },
  },
} as const;

type TestCommand = typeof _testCommand;

type StorageProperties = ExportStoragePropertiesFromCommand<TestCommand>;

({
  stringRootType: 'foo',
}) satisfies StorageProperties;

({
  // @ts-expect-error invalid value
  stringRootType: false,
}) satisfies StorageProperties;

({
  booleanCliType: false,
}) satisfies StorageProperties;

({
  // @ts-expect-error invalid value
  booleanCliType: 'false',
}) satisfies StorageProperties;

({
  choiceType: 'foo',
}) satisfies StorageProperties;

({
  // @ts-expect-error invalid value
  choiceType: 'bar',
}) satisfies StorageProperties;

({
  unknownType: true,
}) satisfies StorageProperties;

({
  unknownType: 'string',
}) satisfies StorageProperties;

type ApplicationProperties = ExportApplicationPropertiesFromCommand<TestCommand>;

const _applicationChoiceType = {
  choiceType: 'foo',
  // @ts-expect-error missing fields
} satisfies ApplicationProperties;

const _applicationChoiceTypeNo = {
  choiceTypeNo: false,
  // @ts-expect-error missing fields
} satisfies ApplicationProperties;

const _applicationChoiceTypeFoo = {
  choiceTypeFoo: true,
  // @ts-expect-error missing fields
} satisfies ApplicationProperties;

const _applicationChoiceTypeAny = {
  choiceTypeAny: true,
  // @ts-expect-error missing fields
} satisfies ApplicationProperties;

({
  ..._applicationChoiceType,
  ..._applicationChoiceTypeNo,
  ..._applicationChoiceTypeFoo,
  ..._applicationChoiceTypeAny,
}) satisfies ApplicationProperties;

type ApplicationOptions = ExportGeneratorOptionsFromCommand<TestCommand>;

({
  stringRootType: 'foo',
  booleanCliType: false,
  choiceType: 'foo',
  none: 'foo',
}) satisfies ApplicationOptions;

({
  // @ts-expect-error unknown field
  foo: 'bar',
}) satisfies ApplicationOptions;

const _dummyCommand = {
  options: {},
  configs: {},
} as const;

// Check if the type allows any property.
// @ts-expect-error unknown field
(() => {})(({} as ExportApplicationPropertiesFromCommand<typeof _dummyCommand>).nonExisting);
// @ts-expect-error unknown field
(() => {})(({} as ExportStoragePropertiesFromCommand<typeof _dummyCommand>).nonExisting);
