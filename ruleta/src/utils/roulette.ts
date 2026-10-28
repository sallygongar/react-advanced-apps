export const calculateFinalRotation = (
  winningDegree: number,
  extraLaps = 5,
): number => {
  const pingAngle = 343;
  const targetDegree = (pingAngle - (winningDegree % 360) + 360) % 360;
  const laps = extraLaps > 0 ? extraLaps : 1;
  return laps * 360 + targetDegree;
};
