import { CodeText } from '#main/shared/codeText';
import { Option } from '@mobily/ts-belt';

export interface RegistryResource {
  url: string;
  code: CodeText;
}

export interface TopLevelRegistryResource extends RegistryResource {
  imports: readonly RegistryResource[];
}

export interface RegistryPackage {
  originalUrl: string;
  indexSource: CodeText;
  typedef: Option<TopLevelRegistryResource>;
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
