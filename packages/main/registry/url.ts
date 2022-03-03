import { PackageSpecifier } from '#main/shared/packages';
import { pipe, S } from '@mobily/ts-belt';

export const REGISTRY_BASE_URL = `https://cdn.esm.sh`;

export function buildPackageIndexUrl(
  packageSpecifier: PackageSpecifier,
): string {
  return `${REGISTRY_BASE_URL}/${packageSpecifier}`;
}

export function relativePathFromUrl(url: string): string {
  return pipe(url, S.replace(REGISTRY_BASE_URL, ''));
}
