import { TouchableHighlight, View, Image, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { Colors } from '@/constants/Colors';
import { accountLogout } from '../index';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { isInWishList, wishListSkins } from '../API/valorant-api';
import { Switch } from 'react-native-switch';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationsEnabled, pushNotification, setNotificationsEnabled } from '../API/notifications-api';
import { useNavigation } from '@react-navigation/native';
import { SkinPreview } from '@/components/SkinPreview';

export default function Profile() {
  const [showWishlist, setShowWishlist] = useState<boolean | null>(null);
  const [selectedSkin, setSelectedSkin] = useState<any | null>(null);
  const [videoPreview, setVideoPreview] = useState<any>(null);
  const [inWishlist, setInWishlist] = useState<boolean>(false);
  const [notificationsEnabledF, setNotificationsEnabledF] = useState(true);
  const navigation = useNavigation(); // Acceso al objeto de navegación
  const [PlayerName, SetPlayerName] = useState<string | null>("Player-Name");

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setShowWishlist(false);
      setSelectedSkin(null);
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const getPlayerName = async () => {
      const PlayerName: string | null = await AsyncStorage.getItem('PlayerName');
      SetPlayerName(PlayerName);
    }
    getPlayerName();
  }, []);
  
  useEffect(() => {
    setNotificationsEnabledF(notificationsEnabled);
  }, []);

  const toggleNotifications = async () => {
    const newStatus: any = !notificationsEnabled;
    setNotificationsEnabled(newStatus);
    setNotificationsEnabledF(newStatus);
    await AsyncStorage.setItem('Notify', JSON.stringify(newStatus));
  
    if (newStatus) {
      pushNotification('Notifications enabled! 🔔', undefined, null);
    }
    else {
      
    }

    console.log(newStatus);
  };
  
  
  const handleWishlist = () => {
    if(showWishlist){
      setShowWishlist(false);
    }
    else {
      setShowWishlist(true);
      
    }
  }

  const handleSkinPress = async (skin: any) => {
    setSelectedSkin(skin);
    const lastLevel: any = Object.keys(skin.levels).sort().reverse()[0];
    setVideoPreview(skin.levels[lastLevel].streamedVideo);
  };

  const handleWishlistPress = async (skin: any) => {
    let inWishlist = await isInWishList(skin);
    setInWishlist(inWishlist);
  }


  

  return (
    <View style={{ backgroundColor: Colors.dark.background, flexGrow: 1, justifyContent: 'space-between', alignItems: 'center', padding: 20, gap: 30}}>
      <View style={{flexDirection: 'row', width: '100%', justifyContent: 'center', alignItems: 'center', gap: 10}}>
        <TabBarIcon name='person-circle' size={75} color={Colors.text.active}></TabBarIcon>
        <Text style={{color: Colors.text.active, fontSize: 25, fontFamily: 'Rubik500', textAlign: 'center' }}>{PlayerName}</Text>
      </View>
      <TouchableHighlight onPress={handleWishlist} activeOpacity={0.25} underlayColor='#fffff' style={{ backgroundColor: Colors.light.background, borderRadius: 50, padding: 6, paddingHorizontal: 20}}>
        <View style={{flexDirection: 'row',gap:6}}>
          <Text style={{fontSize: 25, color: Colors.red.color, fontFamily: 'Rubik500'}}>Skins Wishlist</Text>
          <TabBarIcon name='heart' color={Colors.red.color} size={35} style={{justifyContent:'center',alignItems:'center'}}></TabBarIcon>
        </View>
      </TouchableHighlight>
      <Text onPress={accountLogout} style={{ fontSize: 30, fontFamily: 'Rubik600', color: 'white', backgroundColor: Colors.red.color, paddingHorizontal: 20, borderRadius: 5}}>Log Out</Text>

      {showWishlist && (
        <View style={{backgroundColor: Colors.dark.background,position: 'absolute',top: 0,left: 0,right: 0,bottom: 0,justifyContent: 'center',alignItems: 'center',zIndex: 10}}>
          <Text style={{fontFamily: 'Rubik500', color: 'white', fontSize: 30, marginTop: 15}}>Your Wishlist</Text>
          <View style={{flexDirection: 'row', gap: 15, marginVertical: 15, alignItems: 'center'}}>
            <Text style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center',fontFamily: 'Rubik500', color: 'white', fontSize: 22}}>
              Notifications
            </Text>
            <Switch 
                backgroundActive={Colors.red.color}
                backgroundInactive='#767577'
                circleActiveColor={Colors.red.highlighted}
                circleInActiveColor='#f4f3f4'
                circleBorderWidth={2}
                circleBorderActiveColor={Colors.red.color}
                circleBorderInactiveColor='#767577'
                onValueChange={toggleNotifications}
                value={notificationsEnabledF}
                activeText=''
                inActiveText=''
                barHeight={28}
                circleSize={28}
              />
              <MaterialIcons name={notificationsEnabledF ? "notifications-on" : "notifications-off"} size={28} color={notificationsEnabledF ? Colors.red.color : '#f4f3f4'} />
          </View>
          <FlatList
            data={wishListSkins}
            keyExtractor={(item) => item.uuid}
            renderItem={({ item }) => (
              <View style={{justifyContent: 'center', alignItems: 'center', marginBottom: 15 }}>
                <TouchableHighlight
                  key={item.uuid}
                  onPress={() => {handleSkinPress(item); handleWishlistPress(item);}}
                  activeOpacity={0.25}
                  underlayColor={Colors.dark.cardPress}
                  style={{ backgroundColor: Colors.dark.card, borderRadius: 10, width: '90%' }}
                >
                  <View style={{
                    width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'nowrap',
                    justifyContent: 'space-between', alignItems: 'center', padding: 15,
                  }}>
                    <Text style={{width: '60%', fontFamily: 'Rubik500', color: 'white', fontSize: 20, flexWrap: 'wrap'}}>
                      {item.displayName}
                    </Text>
                    <Image source={{ uri: item.levels[0].displayIcon || item.displayIcon }} style={{ width: '40%', resizeMode: 'contain', aspectRatio: 16 / 9 }} />
                  </View>
                </TouchableHighlight>
              </View>
            )}
            style={{ width: '100%', flex: 1, paddingTop: 10}}
            ListEmptyComponent={() => (
              <Text style={{ color: 'white', fontSize: 18, fontFamily: 'Rubik500', textAlign: 'center' }}>No skins in your wishlist add one in Skins Section.</Text>
            )}
          />

          <TouchableHighlight onPress={() => {handleWishlist();}} activeOpacity={0.25} underlayColor='#ff8888' style={{ backgroundColor: '#ff5454', borderRadius: 50, padding: 10, width: '90%',marginVertical: 10}}>
            <Text style={{ fontFamily: 'Rubik500', color: 'white', fontSize: 20, textAlign: 'center' }}>Close</Text>
          </TouchableHighlight>
        </View>
      )}

      {selectedSkin && (SkinPreview({selectedSkin, videoPreview, inWishlist, handleWishlistPress, setSelectedSkin}))}

    </View>
  );
}
