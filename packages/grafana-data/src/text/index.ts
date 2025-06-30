// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
export * from './string';
export * from './markdown';
export * from './text';
import { escapeHtml, hasAnsiCodes, sanitize, sanitizeUrl, sanitizeTextPanelContent } from './sanitize';

export const textUtil = {
  escapeHtml,
  hasAnsiCodes,
  sanitize,
  sanitizeTextPanelContent,
  sanitizeUrl,
};
