import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync(userId: string) {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    const tokenData = await Notifications.getExpoPushTokenAsync();
    token = tokenData.data;

    if (token && userId) {
      const { error } = await supabase.from('user_devices').upsert({
        user_id: userId,
        fcm_token: token,
        device_platform: Platform.OS,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, fcm_token' });
      
      if (error) console.error('Failed to save device token:', error);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}
