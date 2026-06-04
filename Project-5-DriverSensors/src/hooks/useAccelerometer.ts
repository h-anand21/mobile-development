import { useEffect, useState } from 'react';
import { Accelerometer } from 'expo-sensors';
import { useSensorStore } from '../store/sensorStore';

export const useAccelerometer = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const isTracking = useSensorStore((state) => state.isTracking);
  const updateInterval = useSensorStore((state) => state.updateInterval);
  const setAccelerometerData = useSensorStore((state) => state.setAccelerometerData);

  useEffect(() => {
    Accelerometer.setUpdateInterval(updateInterval);
  }, [updateInterval]);

  const subscribe = () => {
    setSubscription(
      Accelerometer.addListener((accelerometerData) => {
        setAccelerometerData({
          x: accelerometerData.x,
          y: accelerometerData.y,
          z: accelerometerData.z,
          timestamp: Date.now(),
        });
      })
    );
  };

  const unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    if (isTracking) {
      subscribe();
    } else {
      unsubscribe();
    }

    return () => unsubscribe();
  }, [isTracking]);

  return { subscribe, unsubscribe };
};
