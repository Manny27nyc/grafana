// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
// Copyright (c) 2017 Uber Technologies, Inc.
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

jest.mock('./Tween');

import { scrollBy, scrollTo, cancel } from './scroll-page';
import Tween from './Tween';

// keep track of instances, manually
// https://github.com/facebook/jest/issues/5019
const tweenInstances = [];

describe('scroll-by', () => {
  beforeEach(() => {
    window.scrollY = 100;
    tweenInstances.length = 0;
    Tween.mockClear();
    Tween.mockImplementation((opts) => {
      const rv = { to: opts.to, onUpdate: opts.onUpdate };
      Object.keys(Tween.prototype).forEach((name) => {
        if (name !== 'constructor') {
          rv[name] = jest.fn();
        }
      });
      tweenInstances.push(rv);
      return rv;
    });
  });

  afterEach(() => {
    cancel();
  });

  describe('scrollBy()', () => {
    describe('when `appendToLast` is `false`', () => {
      it('scrolls from `window.scrollY` to `window.scrollY + yDelta`', () => {
        const yDelta = 10;
        scrollBy(yDelta);
        const spec = expect.objectContaining({ to: window.scrollY + yDelta });
        expect(Tween.mock.calls).toEqual([[spec]]);
      });
    });

    describe('when `appendToLast` is true', () => {
      it('is the same as `appendToLast === false` without an in-progress scroll', () => {
        const yDelta = 10;
        scrollBy(yDelta, true);
        expect(Tween.mock.calls.length).toBe(1);
        scrollBy(yDelta, false);
        expect(Tween.mock.calls[0]).toEqual(Tween.mock.calls[1]);
      });

      it('is additive when an in-progress scroll is the same direction', () => {
        const yDelta = 10;
        const spec = expect.objectContaining({ to: window.scrollY + 2 * yDelta });
        scrollBy(yDelta);
        scrollBy(yDelta, true);
        expect(Tween.mock.calls.length).toBe(2);
        expect(Tween.mock.calls[1]).toEqual([spec]);
      });

      it('ignores the in-progress scroll is the other direction', () => {
        const yDelta = 10;
        const spec = expect.objectContaining({ to: window.scrollY - yDelta });
        scrollBy(yDelta);
        scrollBy(-yDelta, true);
        expect(Tween.mock.calls.length).toBe(2);
        expect(Tween.mock.calls[1]).toEqual([spec]);
      });
    });
  });

  describe('scrollTo', () => {
    it('scrolls to `y`', () => {
      const to = 10;
      const spec = expect.objectContaining({ to });
      scrollTo(to);
      expect(Tween.mock.calls).toEqual([[spec]]);
    });

    it('ignores the in-progress scroll', () => {
      const to = 10;
      const spec = expect.objectContaining({ to });
      scrollTo(Math.random());
      scrollTo(to);
      expect(Tween.mock.calls.length).toBe(2);
      expect(Tween.mock.calls[1]).toEqual([spec]);
    });
  });

  describe('cancel', () => {
    it('cancels the in-progress scroll', () => {
      scrollTo(10);
      // there is now an in-progress tween
      expect(tweenInstances.length).toBe(1);
      const tw = tweenInstances[0];
      cancel();
      expect(tw.cancel.mock.calls).toEqual([[]]);
    });

    it('is a noop if there is not an in-progress scroll', () => {
      scrollTo(10);
      // there is now an in-progress tween
      expect(tweenInstances.length).toBe(1);
      const tw = tweenInstances[0];
      cancel();
      expect(tw.cancel.mock.calls).toEqual([[]]);
      tw.cancel.mockReset();
      // now, we check to see if `cancel()` has an effect on the last created tween
      cancel();
      expect(tw.cancel.mock.calls.length).toBe(0);
    });
  });

  describe('_onTweenUpdate', () => {
    let oldScrollTo;

    beforeEach(() => {
      oldScrollTo = window.scrollTo;
      window.scrollTo = jest.fn();
    });

    afterEach(() => {
      window.scrollTo = oldScrollTo;
    });

    it('scrolls to `value`', () => {
      const value = 123;
      // cause a `Tween` to be created to get a reference to _onTweenUpdate
      scrollTo(10);
      const { onUpdate } = tweenInstances[0];
      onUpdate({ value, done: false });
      expect(window.scrollTo.mock.calls.length).toBe(1);
      expect(window.scrollTo.mock.calls[0][1]).toBe(value);
    });

    it('discards the in-progress scroll if the scroll is done', () => {
      // cause a `Tween` to be created to get a reference to _onTweenUpdate
      scrollTo(10);
      const { onUpdate, cancel: twCancel } = tweenInstances[0];
      onUpdate({ value: 123, done: true });
      // if the tween is not discarded, `cancel()` will cancel it
      cancel();
      expect(twCancel.mock.calls.length).toBe(0);
    });
  });
});
