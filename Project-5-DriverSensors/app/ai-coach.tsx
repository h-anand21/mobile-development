import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { driveRepository } from '../src/database/repositories/driveRepository';

export default function AICoachRedirect() {
  const { id } = useLocalSearchParams();
  const allDrives = driveRepository.getAllDrives();
  const targetId = id || (allDrives.length > 0 ? allDrives[0].id : null);
  
  if (targetId) {
    return (
      <Redirect 
        href={{ 
          pathname: '/drive-details', 
          params: { id: targetId, activeTab: 'coach' } 
        }} 
      />
    );
  }
  return <Redirect href="/(tabs)" />;
}
