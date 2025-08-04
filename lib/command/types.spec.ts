import type { IsNever } from 'type-fest';

import type {
  ExportApplicationPropertiesFromCommand,
  ExportGeneratorOptionsFromCommand,
  ExportStoragePropertiesFromCommand,
} from './types.ts';

type AssertType<Expected extends true | false, _T2 extends Expected, _T3 extends Expected = Expected> = void;

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

const _choiceType = {
  choiceType: 'foo',
} satisfies StorageProperties;

const _choiceTypeError = {
  // @ts-expect-error invalid value
  choiceType: 'bar',
} satisfies StorageProperties;

const _unknownType = {
  unknownType: true,
} satisfies StorageProperties;

const _unknownType2 = {
  unknownType: 'string',
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
  stringRootType: 'foo',
  booleanCliType: false,
  choiceType: 'foo',
  none: 'foo',
} satisfies ApplicationOptions;

const _applicationOptionsError = {
  // @ts-expect-error unknow field
  foo: 'bar',
} satisfies ApplicationOptions;

const _dummyCommand = {
  options: {},
  configs: {},
} as const;

// Check if the type allows any property.
// @ts-expect-error unknown field
(() => {})(({} as ExportApplicationPropertiesFromCommand<typeof _dummyCommand>).nonExisting);
// @ts-expect-error unknown field
(() => {})(({} as ExportStoragePropertiesFromCommand<typeof _dummyCommand>).nonExisting);

type _DummyCommandAssertions = AssertType<false, IsNever<ExportApplicationPropertiesFromCommand<typeof _dummyCommand>>>;

const _simpleConfig = {
  options: {},
  configs: {
    stringOption: {
      cli: { type: String },
      scope: 'storage',
    },
  },
} as const;

type _SimpleConfigAssertions = AssertType<false, IsNever<ExportApplicationPropertiesFromCommand<typeof _simpleConfig>>>;

const _choiceConfig = {
  options: {},
  configs: {
    stringOption: {
      choices: ['foo', 'bar'],
      scope: 'storage',
    },
  },
} as const;

type _ChoiceConfigAssertions = AssertType<false, IsNever<ExportApplicationPropertiesFromCommand<typeof _choiceConfig>>>;
