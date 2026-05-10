
import React from 'react';


import { Pressable, Text, StyleSheet } from 'react-native';


export default function SocialButton({

  label,

  onPress,
}) {
  return (
    
    <Pressable style={styles.button} onPress={onPress}>
      {/* Text */}
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}


const styles = StyleSheet.create({

  button: {
    width: 54,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },


  text: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
  },
});
