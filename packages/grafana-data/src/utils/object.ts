// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
﻿export const objRemoveUndefined = (obj: any) => {
  return Object.keys(obj).reduce((acc: any, key) => {
    if (obj[key] !== undefined) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};
