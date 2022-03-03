import { PackageIdentifier } from '#main/shared/packages';
import { CodeText } from '#main/shared/codeText';

export interface Package {
  identifier: PackageIdentifier;
  typedef: Resource;
}

export interface Resource {
  path: string;
  code: CodeText;
}
