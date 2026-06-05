export const lowPassFilter = (currentValue: number, previousValue: number, alpha: number = 0.2): number => {
  return previousValue + alpha * (currentValue - previousValue);
};

export const highPassFilter = (currentValue: number, previousValue: number, previousFilteredValue: number, alpha: number = 0.8): number => {
  return alpha * (previousFilteredValue + currentValue - previousValue);
};
