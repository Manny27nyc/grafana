// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
export const componentTpl = `import React, { FC } from 'react';

export interface Props {};

export const <%= name %>: FC<Props> = (props) => {
  return (
    <div>Hello world!</div>
  )
};
`;
