// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { variableQueryObserver } from './variableQueryObserver';
import { LoadingState } from '@grafana/data';
import { VariableIdentifier } from '../state/types';
import { UpdateOptionsResults } from './VariableQueryRunner';

function getTestContext(args: { next?: UpdateOptionsResults; error?: any; complete?: boolean }) {
  const { next, error, complete } = args;
  const resolve = jest.fn();
  const reject = jest.fn();
  const subscription: any = {
    unsubscribe: jest.fn(),
  };
  const observer = variableQueryObserver(resolve, reject, subscription);

  if (next) {
    observer.next(next);
  }

  if (error) {
    observer.error(error);
  }

  if (complete) {
    observer.complete();
  }

  return { resolve, reject, subscription, observer };
}

const identifier: VariableIdentifier = { id: 'id', type: 'query' };

describe('variableQueryObserver', () => {
  describe('when receiving a Done state', () => {
    it('then it should call unsubscribe', () => {
      const { subscription } = getTestContext({ next: { state: LoadingState.Done, identifier } });

      expect(subscription.unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('then it should call resolve', () => {
      const { resolve } = getTestContext({ next: { state: LoadingState.Done, identifier } });

      expect(resolve).toHaveBeenCalledTimes(1);
    });
  });

  describe('when receiving an Error state', () => {
    it('then it should call unsubscribe', () => {
      const { subscription } = getTestContext({ next: { state: LoadingState.Error, identifier, error: 'An error' } });

      expect(subscription.unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('then it should call reject', () => {
      const { reject } = getTestContext({ next: { state: LoadingState.Error, identifier, error: 'An error' } });

      expect(reject).toHaveBeenCalledTimes(1);
      expect(reject).toHaveBeenCalledWith('An error');
    });
  });

  describe('when receiving an error', () => {
    it('then it should call unsubscribe', () => {
      const { subscription } = getTestContext({ error: 'An error' });

      expect(subscription.unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('then it should call reject', () => {
      const { reject } = getTestContext({ error: 'An error' });

      expect(reject).toHaveBeenCalledTimes(1);
      expect(reject).toHaveBeenCalledWith('An error');
    });
  });

  describe('when receiving complete', () => {
    it('then it should call unsubscribe', () => {
      const { subscription } = getTestContext({ complete: true });

      expect(subscription.unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('then it should call resolve', () => {
      const { resolve } = getTestContext({ complete: true });

      expect(resolve).toHaveBeenCalledTimes(1);
    });
  });
});
