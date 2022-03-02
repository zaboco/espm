type Tagged<V, T extends string> = V & { __tag: T };

export type CodeText = Tagged<string, 'CodeText'>;
export const CodeTexts = {
  make: (text: string): CodeText => text as CodeText,
};

export type PackageSpecifier = PackageName | PackageFullName;

export type PackageFullName = `${PackageName}@${PackageVersion}`;

export type PackageName = string & {};

export type PackageVersion = string & {};

export type PackageIdentifier = { name: PackageName; version: PackageVersion };
