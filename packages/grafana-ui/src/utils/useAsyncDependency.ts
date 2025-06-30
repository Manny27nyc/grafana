// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { useAsync } from 'react-use';

// Allows simple dynamic imports in the components
export const useAsyncDependency = (importStatement: Promise<any>) => {
  const state = useAsync(async () => {
    return await importStatement;
  });

  return {
    ...state,
    dependency: state.value,
  };
};
