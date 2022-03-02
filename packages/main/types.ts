import {
  CodeText,
  PackageIdentifier,
  PackageSpecifier,
} from '#main/shared/types';

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
