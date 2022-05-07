import { PackageIdentifier } from '#main/shared/packages';
import { CodeText } from '#main/shared/codeText';

export interface Package {
  identifier: PackageIdentifier;
  typedef: TopLevelResource;
}

export interface Resource {
  path: string;
  code: CodeText;
}

export interface TopLevelResource extends Resource {
  indexCode: CodeText;
  imports: readonly Resource[];
}
