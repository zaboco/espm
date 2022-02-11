export type Command = AddCommand | RemoveCommand;

export interface AddCommand {
  action: 'add';
  packageIds: readonly GivenPackageId[];
}

export interface RemoveCommand {
  action: 'remove';
  packageIds: readonly GivenPackageId[];
}

export interface Package {
  id: PackageId;
  typesText: Text;
}

export interface PackageWithSource extends Package {
  sourceText: Text;
}

export type Text = string & {};

export type GivenPackageId = PackageName | PackageId;
export type PackageId = `${PackageName}@${PackageVersion}`;

export type PackageName = string & {};
export type PackageVersion = string & {};

export interface Manifest {
  dependencies: Record<PackageName, PackageVersion>;
}

export type PackageDescriptor = { name: PackageName; version: PackageVersion };
