import { createContext, useContext, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Point } from 'openseadragon';

interface ActiveMeasurementState {

  phase: 'dragging' | 'committed';

  start: Point;

  end: Point;

  viewportDistance: number;

}

interface IdleMeasurementState {

  phase: 'idle';

}

type MeasurementState = ActiveMeasurementState | IdleMeasurementState;

interface MeasurementContextValue {

  measurement: MeasurementState;

  setMeasurement: Dispatch<SetStateAction<MeasurementState>>;

}

const MeasurementContext = createContext<MeasurementContextValue | undefined>(undefined);

export const MeasurementProvider = ({ children }: { children: React.ReactNode }) => {
  const [measurement, setMeasurement] = useState<MeasurementState>({ phase: 'idle'});

  return (
    <MeasurementContext.Provider value={{ measurement, setMeasurement }}>
      {children}
    </MeasurementContext.Provider>
  )

}

export const useMeasurement = () => {
  const ctx = useContext(MeasurementContext);
  if (!ctx) throw new Error('useMeasurement must be used within a MeasurementProvider');
  return ctx;
}