import { CodeText } from '#main/shared/codeText';
import { Option } from '@mobily/ts-belt';

export interface RegistryResource {
  url: string;
  code: CodeText;
  imports: RegistryResource[];
}

export const Resources = {
  make<RR extends RegistryResource>({ url, code }: RR): RegistryResource {
    return { url, code, imports: [] };
  },
};

export interface RegistryPackage {
  originalUrl: string;
  indexSource: CodeText;
  typedef: Option<RegistryResource>;
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
