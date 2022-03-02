import { factory, Id } from '#lib/ts-belt-extra/Id';
import {
  PackageIdentifier,
  PackageName,
  PackageSpecifier,
  PackageVersion,
} from 'src/shared/shared.types';

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

export type CodeText = Id<'CodeText', string>;

export const CodeText = factory<'CodeText', string>('CodeText');

export interface Manifest {
  dependencies: Record<PackageName, PackageVersion>;
}
