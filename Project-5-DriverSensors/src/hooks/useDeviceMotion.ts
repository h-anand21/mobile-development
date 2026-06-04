import { useEffect, useState } from 'react';
import { DeviceMotion } from 'expo-sensors';
import { useSensorStore } from '../store/sensorStore';

export const useDeviceMotion = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const isTracking = useSensorStore((state) => state.isTracking);
  const updateInterval = useSensorStore((state) => state.updateInterval);
  const setDeviceMotionData = useSensorStore((state) => state.setDeviceMotionData);

  useEffect(() => {
    DeviceMotion.setUpdateInterval(updateInterval);
  }, [updateInterval]);

  const subscribe = () => {
    setSubscription(
      DeviceMotion.addListener((motionData) => {
        setDeviceMotionData({
          acceleration: motionData.acceleration ? {
            x: motionData.acceleration.x,
            y: motionData.acceleration.y,
            z: motionData.acceleration.z,
            timestamp: Date.now()
          } : null,
          accelerationIncludingGravity: motionData.accelerationIncludingGravity ? {
            x: motionData.accelerationIncludingGravity.x,
            y: motionData.accelerationIncludingGravity.y,
            z: motionData.accelerationIncludingGravity.z,
            timestamp: Date.now()
          } : null,
          rotation: motionData.rotation ? {
            alpha: motionData.rotation.alpha,
            beta: motionData.rotation.beta,
            gamma: motionData.rotation.gamma,
          } : null,
          rotationRate: motionData.rotationRate ? {
            alpha: motionData.rotationRate.alpha,
            beta: motionData.rotationRate.beta,
            gamma: motionData.rotationRate.gamma,
          } : null,
          orientation: motionData.orientation,
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
