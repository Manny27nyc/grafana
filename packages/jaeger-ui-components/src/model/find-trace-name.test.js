// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
// Copyright (c) 2020 The Jaeger Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { _getTraceNameImpl as getTraceName } from './trace-viewer';

describe('getTraceName', () => {
  const firstSpanId = 'firstSpanId';
  const secondSpanId = 'secondSpanId';
  const thirdSpanId = 'thirdSpanId';
  const missingSpanId = 'missingSpanId';

  const currentTraceId = 'currentTraceId';

  const serviceName = 'serviceName';
  const operationName = 'operationName';

  const t = 1583758670000;

  // Note: this trace has a loop S1 <- S2 <- S3 <- S1, which is the only way
  // to make the algorithm return an empty string as trace name.
  const spansWithNoRoots = [
    {
      spanID: firstSpanId,
      traceID: currentTraceId,
      startTime: t + 200,
      process: {},
      references: [
        {
          spanID: secondSpanId,
          traceID: currentTraceId,
        },
      ],
    },
    {
      spanID: secondSpanId,
      traceID: currentTraceId,
      startTime: t + 100,
      process: {},
      references: [
        {
          spanID: thirdSpanId,
          traceID: currentTraceId,
        },
      ],
    },
    {
      spanID: thirdSpanId,
      traceID: currentTraceId,
      startTime: t,
      process: {},
      references: [
        {
          spanID: firstSpanId,
          traceID: currentTraceId,
        },
      ],
    },
  ];
  const spansWithMultipleRootsDifferentByStartTime = [
    {
      spanID: firstSpanId,
      traceID: currentTraceId,
      startTime: t + 200,
      process: {},
      references: [
        {
          spanID: thirdSpanId,
          traceID: currentTraceId,
        },
      ],
    },
    {
      spanID: secondSpanId, // may be a root span
      traceID: currentTraceId,
      startTime: t + 100,
      process: {},
      references: [
        {
          spanID: missingSpanId,
          traceID: currentTraceId,
        },
      ],
    },
    {
      spanID: thirdSpanId, // root span (as the earliest)
      traceID: currentTraceId,
      startTime: t,
      operationName,
      process: {
        serviceName,
      },
      references: [
        {
          spanID: missingSpanId,
          traceID: currentTraceId,
        },
      ],
    },
  ];
  const spansWithMultipleRootsWithOneWithoutRefs = [
    {
      spanID: firstSpanId,
      traceID: currentTraceId,
      startTime: t + 200,
      process: {},
      references: [
        {
          spanID: thirdSpanId,
          traceID: currentTraceId,
        },
      ],
    },
    {
      spanID: secondSpanId, // root span (as a span without any refs)
      traceID: currentTraceId,
      startTime: t + 100,
      operationName,
      process: {
        serviceName,
      },
    },
    {
      spanID: thirdSpanId, // may be a root span
      traceID: currentTraceId,
      startTime: t,
      process: {},
      references: [
        {
          spanID: missingSpanId,
          traceID: currentTraceId,
        },
      ],
    },
  ];
  const spansWithOneRootWithRemoteRef = [
    {
      spanID: firstSpanId,
      traceID: currentTraceId,
      startTime: t + 200,
      process: {},
      references: [
        {
          spanID: secondSpanId,
          traceID: currentTraceId,
        },
      ],
    },
    {
      spanID: secondSpanId,
      traceID: currentTraceId,
      startTime: t + 100,
      process: {},
      references: [
        {
          spanID: thirdSpanId,
          traceID: currentTraceId,
        },
      ],
    },
    {
      spanID: thirdSpanId, // effective root span, since its parent is missing
      traceID: currentTraceId,
      startTime: t,
      operationName,
      process: {
        serviceName,
      },
      references: [
        {
          spanID: missingSpanId,
          traceID: currentTraceId,
        },
      ],
    },
  ];
  const spansWithOneRootWithNoRefs = [
    {
      spanID: firstSpanId,
      traceID: currentTraceId,
      startTime: t + 200,
      process: {},
      references: [
        {
          spanID: thirdSpanId,
          traceID: currentTraceId,
        },
      ],
    },
    {
      spanID: secondSpanId, // root span
      traceID: currentTraceId,
      startTime: t + 100,
      operationName,
      process: {
        serviceName,
      },
    },
    {
      spanID: thirdSpanId,
      traceID: currentTraceId,
      startTime: t,
      process: {},
      references: [
        {
          spanID: secondSpanId,
          traceID: currentTraceId,
        },
      ],
    },
  ];

  const fullTraceName = `${serviceName}: ${operationName}`;

  it('returns an empty string if given spans with no root among them', () => {
    expect(getTraceName(spansWithNoRoots)).toEqual('');
  });

  it('returns an id of root span with the earliest startTime', () => {
    expect(getTraceName(spansWithMultipleRootsDifferentByStartTime)).toEqual(fullTraceName);
  });

  it('returns an id of root span without any refs', () => {
    expect(getTraceName(spansWithMultipleRootsWithOneWithoutRefs)).toEqual(fullTraceName);
  });

  it('returns an id of root span with remote ref', () => {
    expect(getTraceName(spansWithOneRootWithRemoteRef)).toEqual(fullTraceName);
  });

  it('returns an id of root span with no refs', () => {
    expect(getTraceName(spansWithOneRootWithNoRefs)).toEqual(fullTraceName);
  });
});
