import { CodeText } from '#main/shared/codeText';

export interface RegistryResource {
  url: string;
  code: CodeText;
}

export const Resources = {
  make(url: string, code: CodeText): RegistryResource {
    return { url, code };
  },
};

export interface RegistryPackage {
  originalUrl: string;
  indexSource: CodeText;
  typedef: RegistryResource;
}

export const RegistryPackages = {
  make<RP extends RegistryPackage>({
    indexSource,
    typedef,
    originalUrl,
  }: RP): RegistryPackage {
    return { originalUrl, indexSource, typedef };
  },
};
