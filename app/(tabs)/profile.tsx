import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';
import React from 'react';
import { Text } from 'react-native';
import { Colors } from '@/constants/Colors';
import { accountLogout } from '../index';

export default function Profile() {

  return (
    <View style={{ backgroundColor: Colors.dark.background, flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20, gap: 30}}>
      <Text style={{ fontSize: 30, fontFamily: 'Rubik600', color: 'white'}}>VER PERFIL</Text>
      <Text onPress={accountLogout} style={{ fontSize: 30, fontFamily: 'Rubik600', color: 'white', backgroundColor: Colors.red.color, paddingHorizontal: 20, borderRadius: 5}}>Log Out</Text>
    </View>
  );
}
