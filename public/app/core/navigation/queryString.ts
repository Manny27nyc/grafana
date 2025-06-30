// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
export const queryString = (params: any) => {
  return Object.keys(params)
    .filter((k) => {
      return !!params[k];
    })
    .map((k) => {
      return k + '=' + params[k];
    })
    .join('&');
};
