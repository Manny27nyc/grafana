// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
export const arrayMove = <T>(array: T[], fromIndex: number, toIndex: number): T[] => {
  array.splice(toIndex, 0, array.splice(fromIndex, 1)[0]);
  return array;
};
