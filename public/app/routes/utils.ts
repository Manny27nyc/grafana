// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
export function isSoloRoute(path: string): boolean {
  return path?.toLowerCase().includes('/d-solo/');
}
