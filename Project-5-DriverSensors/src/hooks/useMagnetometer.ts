import { useEffect, useState } from 'react';
import { Magnetometer } from 'expo-sensors';
import { useSensorStore } from '../store/sensorStore';

export const useMagnetometer = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const isTracking = useSensorStore((state) => state.isTracking);
  const updateInterval = useSensorStore((state) => state.updateInterval);
  const setMagnetometerData = useSensorStore((state) => state.setMagnetometerData);

  useEffect(() => {
    Magnetometer.setUpdateInterval(updateInterval);
  }, [updateInterval]);

  const subscribe = () => {
    setSubscription(
      Magnetometer.addListener((magnetometerData) => {
        setMagnetometerData({
          x: magnetometerData.x,
          y: magnetometerData.y,
          z: magnetometerData.z,
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
