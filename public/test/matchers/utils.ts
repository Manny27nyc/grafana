// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { matcherHint, printExpected, printReceived } from 'jest-matcher-utils';
import { OBSERVABLE_TEST_TIMEOUT_IN_MS } from './types';
import { asapScheduler, Subscription, timer, isObservable } from 'rxjs';

export function forceObservableCompletion(subscription: Subscription, resolve: (args: any) => void) {
  const timeoutObservable = timer(OBSERVABLE_TEST_TIMEOUT_IN_MS, asapScheduler);

  subscription.add(
    timeoutObservable.subscribe(() => {
      subscription.unsubscribe();
      resolve({
        pass: false,
        message: () =>
          `${matcherHint('.toEmitValues')}

    Expected ${printReceived('Observable')} to be ${printExpected(
            `completed within ${OBSERVABLE_TEST_TIMEOUT_IN_MS}ms`
          )} but it did not.`,
      });
    })
  );
}

export function expectObservableToBeDefined(received: any): jest.CustomMatcherResult | null {
  if (received) {
    return null;
  }

  return {
    pass: false,
    message: () => `${matcherHint('.toEmitValues')}

Expected ${printReceived(received)} to be ${printExpected('defined')}.`,
  };
}

export function expectObservableToBeObservable(received: any): jest.CustomMatcherResult | null {
  if (isObservable(received)) {
    return null;
  }

  return {
    pass: false,
    message: () => `${matcherHint('.toEmitValues')}

Expected ${printReceived(received)} to be ${printExpected('an Observable')}.`,
  };
}

export function expectObservable(received: any): jest.CustomMatcherResult | null {
  const toBeDefined = expectObservableToBeDefined(received);
  if (toBeDefined) {
    return toBeDefined;
  }

  const toBeObservable = expectObservableToBeObservable(received);
  if (toBeObservable) {
    return toBeObservable;
  }

  return null;
}
