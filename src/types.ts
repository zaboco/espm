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

export interface TypesResource {
  relativeUrl: string;
  text: CodeText;
}

export interface Package {
  identifier: PackageIdentifier;
  types: TypesResource;
}

export const TypesResource = {
  make(relativeUrl: string, text: CodeText): TypesResource {
    return { relativeUrl, text };
  },
};

export const Package = {
  make(identifier: PackageIdentifier, types: TypesResource): Package {
    return { identifier: identifier, types };
  },
};

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
