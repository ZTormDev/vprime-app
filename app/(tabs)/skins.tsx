import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, View } from 'react-native';
import React from 'react';
import { Text } from 'react-native';
import { Colors } from '@/constants/Colors';


export default function Skins() {
  return (
    <View style={{ backgroundColor: Colors.dark.background, flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20, gap: 30}}>
      <Text style={{color: 'white', fontSize: 25, fontFamily: 'Rubik500', textAlign: 'center' }}>{"Section in development  </>"}</Text>
      <Text style={{color: 'white', fontSize: 18, fontFamily: 'Rubik500', textAlign: 'center' }}>in this section you can search skins and set your wishlist</Text>
    </View>
  );
}