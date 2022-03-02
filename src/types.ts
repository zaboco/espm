import { factory, Id } from '#lib/ts-belt-extra/Id';

export type Command = AddCommand | RemoveCommand;

export interface AddCommand {
  action: 'add';
  packageSpecifiers: readonly PackageSpecifier[];
}

export interface RemoveCommand {
  action: 'remove';
  packageSpecifiers: readonly PackageSpecifier[];
}

export interface TypedefResource {
  relativeUrl: string;
  text: CodeText;
}

export interface Package {
  identifier: PackageIdentifier;
  typedef: TypedefResource;
}

export const TypedefResource = {
  make(relativeUrl: string, text: CodeText): TypedefResource {
    return { relativeUrl, text };
  },
};

export const Package = {
  make(identifier: PackageIdentifier, typedef: TypedefResource): Package {
    return { identifier: identifier, typedef: typedef };
  },
};

export type NewCodeText = string & { __tag: 'CodeText' };
export const makeNewCodeText = (text: string): NewCodeText =>
  text as NewCodeText;

export type CodeText = Id<'CodeText', string>;

export const CodeText = factory<'CodeText', string>('CodeText');

export type PackageSpecifier = PackageName | PackageId;
export type PackageId = `${PackageName}@${PackageVersion}`;

export type PackageName = string & {};
export type PackageVersion = string & {};

export interface Manifest {
  dependencies: Record<PackageName, PackageVersion>;
}

export type PackageIdentifier = { name: PackageName; version: PackageVersion };
