'use client';

import { useEffect } from 'react';

type HotkeyCallback = (event: KeyboardEvent) => void;
type HotkeyTuple = [string, HotkeyCallback];

const isModKey = (e: KeyboardEvent) => navigator.platform.includes('Mac') ? e.metaKey : e.ctrlKey;

export function useHotkeys(hotkeys: HotkeyTuple[]) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      hotkeys.forEach(([key, callback]) => {
        const [modifier, letter] = key.toLowerCase().split('+');
        
        if (modifier === 'mod' && isModKey(event) && event.key.toLowerCase() === letter) {
          event.preventDefault();
          callback(event);
        }
      });
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hotkeys]);
}
