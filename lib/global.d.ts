import { CopyOptions } from 'mem-fs-editor';

declare module 'mem-fs-editor' {
  interface CopyOptions {
    noGlob?: boolean;
  }
}
