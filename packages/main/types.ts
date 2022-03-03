import { PackageSpecifier } from '#main/shared/packages';

export type Command = AddCommand;

export interface AddCommand {
  action: 'add';
  packageSpecifiers: readonly PackageSpecifier[];
}
