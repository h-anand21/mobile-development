import { useEffect, useState } from 'react';
import { Gyroscope } from 'expo-sensors';
import { useSensorStore } from '../store/sensorStore';

export const useGyroscope = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const isTracking = useSensorStore((state) => state.isTracking);
  const updateInterval = useSensorStore((state) => state.updateInterval);
  const setGyroscopeData = useSensorStore((state) => state.setGyroscopeData);

  useEffect(() => {
    Gyroscope.setUpdateInterval(updateInterval);
  }, [updateInterval]);

  const subscribe = () => {
    setSubscription(
      Gyroscope.addListener((gyroscopeData) => {
        setGyroscopeData({
          x: gyroscopeData.x,
          y: gyroscopeData.y,
          z: gyroscopeData.z,
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
