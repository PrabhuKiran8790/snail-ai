import { writable, type Writable } from "svelte/store";

export const currentChatId: Writable<number | null> = writable(null);
export const chatDetailsUpdated: Writable<boolean> = writable(false);
export const isStreaming: Writable<boolean> = writable(false);
export const selectedModel: Writable<string> = writable("");
export const selectedSettingsModel: Writable<string> = writable("");
export const selectedModelProvider: Writable<string> = writable("");
export const modelSelectorOpen: Writable<boolean> = writable(false);

export function debounceStore<T>(initialValue: T, delay: number): Writable<T> {
  const { subscribe, set, update } = writable<T>(initialValue);
  let timeout: ReturnType<typeof setTimeout>;

  const debounceSet = (value: T) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => set(value), delay);
  };

  const debounceUpdate = (fn: (value: T) => T) => {
    let currentValue: T;
    const unsubscribe = subscribe((value) => {
      currentValue = value;
    });
    unsubscribe();

    debounceSet(fn(currentValue!));
  };

  return {
    subscribe,
    set: debounceSet,
    update: debounceUpdate,
  };
}
