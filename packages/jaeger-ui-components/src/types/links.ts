// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { TraceSpan } from './trace';
import React from 'react';

export type SpanLinkDef = {
  href: string;
  onClick?: (event: any) => void;
  content: React.ReactNode;
};

export type SpanLinkFunc = (span: TraceSpan) => SpanLinkDef | undefined;
