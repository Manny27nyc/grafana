// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { RefObject, useRef } from 'react';

export function useFocus(): [RefObject<HTMLInputElement>, () => void] {
  const ref = useRef<HTMLInputElement>(null);
  const setFocus = () => {
    ref.current && ref.current.focus();
  };
  return [ref, setFocus];
}
