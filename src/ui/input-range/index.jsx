'use client';
import { getTrackBackground, Range } from 'react-range';

/** Read from the brand theme so the slider follows the palette. */
const FILL = 'var(--wf-brand, #5C1028)';
const TRACK = 'var(--wf-line, #E4D3BD)';

const InputRange = ({ STEP, MIN, MAX, values, handleChanges }) => {
  return (
    <>
      <Range
        step={STEP}
        min={MIN}
        max={MAX}
        values={values}
        onChange={vals => handleChanges(vals)}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            key={props.key}
            style={{
              ...props.style,
              height: '3px',
              width: '100%',
              background: getTrackBackground({
                values: values,
                // Palette, not the navy this was copied in with.
                colors: [TRACK, FILL, TRACK],
                min: MIN,
                max: MAX,
              }),
            }}
          >
            {children}
          </div>
        )}
        renderThumb={({ props, isDragged }) => (
          <div
            {...props}
            key={props.key}
            style={{
              ...props.style,
              height: '17px',
              width: '5px',
              // One value either way — the duplicate key this replaced was a
              // no-op that looked like a drag state.
              backgroundColor: FILL,
            }}
          />
        )}
      />
    </>
  );
};

export default InputRange;
