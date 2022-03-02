import { NewCodeText } from 'src/types';

export interface Resource {
  url: string;
  code: NewCodeText;
}

export const Resources = {
  make(url: string, code: NewCodeText): Resource {
    return { url, code };
  },
};

export interface RegistryPackage {
  originalUrl: string;
  indexSource: NewCodeText;
  typedef: Resource;
}

export const RegistryPackages = {
  make(
    originalUrl: string,
    indexSource: NewCodeText,
    typedef: Resource,
  ): RegistryPackage {
    return { originalUrl, indexSource, typedef };
  },
};
