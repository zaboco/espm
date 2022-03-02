import { CodeText } from '#main/shared/types';

export interface Resource {
  url: string;
  code: CodeText;
}

export const Resources = {
  make(url: string, code: CodeText): Resource {
    return { url, code };
  },
};

export interface RegistryPackage {
  originalUrl: string;
  indexSource: CodeText;
  typedef: Resource;
}

export const RegistryPackages = {
  make(
    originalUrl: string,
    indexSource: CodeText,
    typedef: Resource,
  ): RegistryPackage {
    return { originalUrl, indexSource, typedef };
  },
};
