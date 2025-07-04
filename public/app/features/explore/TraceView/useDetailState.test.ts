// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { act, renderHook } from '@testing-library/react-hooks';
import { useDetailState } from './useDetailState';
import { TraceLog } from '@jaegertracing/jaeger-ui-components/src/types/trace';
import { DataFrame } from '@grafana/data';

const sampleFrame: DataFrame = {
  name: 'trace',
  fields: [],
  length: 0,
};

describe('useDetailState', () => {
  it('toggles detail', async () => {
    const { result } = renderHook(() => useDetailState(sampleFrame));
    expect(result.current.detailStates.size).toBe(0);

    act(() => result.current.toggleDetail('span1'));
    expect(result.current.detailStates.size).toBe(1);
    expect(result.current.detailStates.has('span1')).toBe(true);

    act(() => result.current.toggleDetail('span1'));
    expect(result.current.detailStates.size).toBe(0);
  });

  it('toggles logs and logs items', async () => {
    const { result } = renderHook(() => useDetailState(sampleFrame));
    act(() => result.current.toggleDetail('span1'));
    act(() => result.current.detailLogsToggle('span1'));
    expect(result.current.detailStates.get('span1')?.logs.isOpen).toBe(true);

    const log = { timestamp: 1 } as TraceLog;
    act(() => result.current.detailLogItemToggle('span1', log));
    expect(result.current.detailStates.get('span1')?.logs.openedItems.has(log)).toBe(true);
  });

  it('toggles warnings', async () => {
    const { result } = renderHook(() => useDetailState(sampleFrame));
    act(() => result.current.toggleDetail('span1'));
    act(() => result.current.detailWarningsToggle('span1'));
    expect(result.current.detailStates.get('span1')?.isWarningsOpen).toBe(true);
  });

  it('toggles references', async () => {
    const { result } = renderHook(() => useDetailState(sampleFrame));
    act(() => result.current.toggleDetail('span1'));
    act(() => result.current.detailReferencesToggle('span1'));
    expect(result.current.detailStates.get('span1')?.isReferencesOpen).toBe(true);
  });

  it('toggles processes', async () => {
    const { result } = renderHook(() => useDetailState(sampleFrame));
    act(() => result.current.toggleDetail('span1'));
    act(() => result.current.detailProcessToggle('span1'));
    expect(result.current.detailStates.get('span1')?.isProcessOpen).toBe(true);
  });

  it('toggles tags', async () => {
    const { result } = renderHook(() => useDetailState(sampleFrame));
    act(() => result.current.toggleDetail('span1'));
    act(() => result.current.detailTagsToggle('span1'));
    expect(result.current.detailStates.get('span1')?.isTagsOpen).toBe(true);
  });
});
