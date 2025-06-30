// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { Vector } from '../types/vector';

export function vectorToArray<T>(v: Vector<T>): T[] {
  const arr: T[] = Array(v.length);
  for (let i = 0; i < v.length; i++) {
    arr[i] = v.get(i);
  }
  return arr;
}
