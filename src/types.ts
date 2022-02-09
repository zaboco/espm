export type Command = AddCommand | RemoveCommand;

export interface AddCommand {
  action: 'add';
  packageIds: readonly string[];
}

export interface RemoveCommand {
  action: 'remove';
  packageIds: readonly string[];
}
