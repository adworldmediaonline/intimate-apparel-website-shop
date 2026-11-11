'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

/**
 * Lets the buy box tell the gallery which photographs to show.
 *
 * The two live in different columns of the `.wf-pdp` grid, so they cannot share
 * component state directly. The provider wraps the grid instead and passes the
 * server-rendered markup straight through as `children`.
 *
 * Value and setter are deliberately separate contexts: the buy box only ever
 * writes, and a combined `{ images, setImages }` object would change identity on
 * every write, re-running the buy box's effect and looping.
 */
const ImagesContext = createContext<string[] | null>(null);
const SetImagesContext = createContext<Dispatch<SetStateAction<string[] | null>> | null>(
  null
);

export function VariantMediaProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<string[] | null>(null);
  return (
    <SetImagesContext.Provider value={setImages}>
      <ImagesContext.Provider value={images}>{children}</ImagesContext.Provider>
    </SetImagesContext.Provider>
  );
}

/** The gallery's override, or null when no variant with its own photos is selected. */
export function useVariantImages() {
  return useContext(ImagesContext);
}

/**
 * Stable setter that ignores a repeat of the images already showing, so a
 * re-render cannot bounce the gallery back to its first frame.
 */
export function useSetVariantImages() {
  const setImages = useContext(SetImagesContext);

  return useCallback(
    (next: string[] | null) => {
      if (!setImages) return;
      setImages(previous => {
        const value = next && next.length ? next : null;
        if (previous === value) return previous;
        if (
          previous &&
          value &&
          previous.length === value.length &&
          previous.every((src, i) => src === value[i])
        ) {
          return previous;
        }
        return value;
      });
    },
    [setImages]
  );
}
