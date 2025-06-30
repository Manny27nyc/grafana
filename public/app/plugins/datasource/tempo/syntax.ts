// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { Grammar } from 'prismjs';

export const tokenizer: Grammar = {
  key: {
    pattern: /[^\s]+(?==)/,
    alias: 'attr-name',
  },
  operator: /[=]/,
  value: [
    {
      pattern: /"(.+)"/,
    },
    {
      pattern: /[^\s]+/,
    },
  ],
};
