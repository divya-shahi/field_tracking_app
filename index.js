/**
 * @format
 */

import notifee from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  notifee.setBadgeCount(0).then(() => console.log('Badge count removed!'));

});

AppRegistry.registerComponent(appName, () => App);
