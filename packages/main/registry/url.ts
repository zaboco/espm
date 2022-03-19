import { PackageSpecifier } from '#main/shared/packages';
import { pipe, S } from '@mobily/ts-belt';

const REGISTRY_BASE_URL = `https://cdn.esm.sh/`;

export function buildRegistryUrl(packageSpecifier: PackageSpecifier): string {
  return `${REGISTRY_BASE_URL}${packageSpecifier}`;
}

export function relativePathFromUrl(url: string): string {
  return pipe(url, S.replace(REGISTRY_BASE_URL, ''));
}
