import { CopyOptions } from 'mem-fs-editor';

declare module 'yeoman-environment/transform';

declare module 'mem-fs-editor' {
  interface CopyOptions {
    noGlob?: boolean;
  }
}
