// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
export function unwrap<T>(value: T | null | undefined): T {
  if (value == null) {
    throw new Error('value must not be nullish');
  }
  return value;
}
