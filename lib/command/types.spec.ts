import type {
  ExportApplicationPropertiesFromCommand,
  ExportGeneratorOptionsFromCommand,
  ExportStoragePropertiesFromCommand,
} from './types.js';

type TestCommand = {
  options: {
    arrayOptionsType: {
      type: ArrayConstructor;
      scope: 'storage';
    };
  };
  configs: {
    stringRootType: {
      cli: { type: StringConstructor };
      scope: 'storage';
    };
    booleanCliType: {
      cli: { type: BooleanConstructor };
      scope: 'storage';
    };
    none: {
      scope: 'none';
    };
    choiceType: {
      cli: {
        type: StringConstructor;
      };
      choices: ['foo', 'no'];
      scope: 'storage';
    };
  };
};

type StorageProperties = ExportStoragePropertiesFromCommand<TestCommand>;

const _stringRootType = {
  stringRootType: 'foo',
} satisfies StorageProperties;

const _stringRootTypeError = {
  // @ts-expect-error invalid value
  stringRootType: false,
} satisfies StorageProperties;

const _booleanCliType = {
  booleanCliType: false,
} satisfies StorageProperties;

const _booleanCliTypeError = {
  // @ts-expect-error invalid value
  booleanCliType: 'false',
} satisfies StorageProperties;

const _arrayCliType = {
  arrayOptionsType: ['false'],
} satisfies StorageProperties;

const _choiceType = {
  choiceType: 'foo',
} satisfies StorageProperties;

const _choiceTypeError = {
  // @ts-expect-error invalid value
  choiceType: 'bar',
} satisfies StorageProperties;

type ApplicationProperties = ExportApplicationPropertiesFromCommand<TestCommand>;

const applicationChoiceType = {
  choiceType: 'foo',
  // @ts-expect-error missing fields
} satisfies ApplicationProperties;

const applicationChoiceTypeNo = {
  choiceTypeNo: false,
  // @ts-expect-error missing fields
} satisfies ApplicationProperties;

const applicationChoiceTypeFoo = {
  choiceTypeFoo: true,
  // @ts-expect-error missing fields
} satisfies ApplicationProperties;

const applicationChoiceTypeAny = {
  choiceTypeAny: true,
  // @ts-expect-error missing fields
} satisfies ApplicationProperties;

const _applicationChoiceComplete = {
  ...applicationChoiceType,
  ...applicationChoiceTypeNo,
  ...applicationChoiceTypeFoo,
  ...applicationChoiceTypeAny,
} satisfies ApplicationProperties;

type ApplicationOptions = ExportGeneratorOptionsFromCommand<TestCommand>;

const _applicationOptions = {
  arrayOptionsType: ['false'],
  stringRootType: 'foo',
  booleanCliType: false,
  choiceType: 'foo',
  none: 'foo',
} satisfies ApplicationOptions;

const _applicationOptionsError = {
  // @ts-expect-error unknow field
  foo: 'bar',
} satisfies ApplicationOptions;
