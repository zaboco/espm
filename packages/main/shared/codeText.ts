type Tagged<V, T extends string> = V & { __tag: T };

export type CodeText = Tagged<string, 'CodeText'>;
export const CodeTexts = {
  make: (text: string): CodeText => text as CodeText,
};
