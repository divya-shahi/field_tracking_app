import notifee, { EventType } from '@notifee/react-native';
import React, { useEffect, useState } from 'react';
import { Alert, AppState, AppStateStatus, StatusBar } from 'react-native';
import { createAgoraRtcEngine } from 'react-native-agora';
import RNExitApp from 'react-native-exit-app';
import FlashMessage from 'react-native-flash-message';
import { enableFreeze } from 'react-native-screens';
import SplashScreen from 'react-native-splash-screen';
import {
  isMockingLocation,
  MockLocationDetectorError,
} from 'react-native-turbo-mock-location-detector';
import { Provider } from 'react-redux';
import NetworkDebugger from './NetworkLogger';
import strings from './src/constants/lang';
import NavigationService from './src/Navigation/NavigationService';
import Routes from './src/Navigation/Routes';
import {
  saveFcmTokenToRedux,
  saveUserDataToStore,
} from './src/redux/Actions/Auth/AuthActions';
import store from './src/redux/store';
import { Colors } from './src/styles';
import { checkPermission, getCurrentLocation } from './src/utils/helperFunctions';
import {
  notificationListener,
  on_Background,
  on_Foreground,
  requestUserPermission,
} from './src/utils/notificationService';
import { getItem, getUserData } from './src/utils/utils';

enableFreeze(true);

notifee.onBackgroundEvent(async ({type, detail}) => {
  const {notification, pressAction} = detail;
  console.log(
    `[onBackgroundEvent] notification: ${JSON.stringify(notification)}}`,
  );
  if (type === EventType.PRESS) {
    if (notification?.title?.includes('Attendance')) {
      NavigationService.navigate(strings.MARK_ATTENDANCE);
    }
  }
});

const App = () => {
  const engine = createAgoraRtcEngine();
  engine.initialize({appId: '7f458419abca4dc39aa4349f90e8d388'});
  const [locationPermission, setLocationPermission] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      _handleAppStateChange,
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const _handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'background') {
      console.log('App has moved to the background!');
      // NavigationService.resetNavigationToHomeStack();
      // cancelAllAxiosRequests();
    }
  };

  const checkIsMockLocation = async () => {
    isMockingLocation()
      .then(({isLocationMocked}) => {
        console.log('isLocationMocked', isLocationMocked);
        if (isLocationMocked) {
          Alert.alert(
            'Mock location detected',
            'Please remove mock location app to continue.',
            [
              {
                text: 'OK',
                onPress: () => RNExitApp.exitApp(),
              },
            ],
            {cancelable: false},
          );
        }
      })
      .catch((error: MockLocationDetectorError) => {
        console.log('isLocationMocked Error', error);
      });
  };

  useEffect(() => {
    const appStateListener = AppState.addEventListener(
      'change',
      checkIsMockLocation,
    );
    return () => {
      appStateListener.remove();
    };
  }, []);

  useEffect(() => {
    return on_Foreground();
  }, []);

  useEffect(() => {
    return on_Background();
  }, []);

  useEffect(() => {
    getLocation();
    // checkDebuggerMode();
    _saveUserData();
    getItem('FCM_TOKEN').then(cb => {
      console.log(cb, 'FCM_TOKEN getItem');
      if (cb != null) {
        saveFcmTokenToRedux(cb);
      }
    });
    setTimeout(() => {
      SplashScreen.hide();
    }, 1500);
  }, []);

  useEffect(() => {
    requestUserPermission();
    notificationListener();
  }, []);

  useEffect(() => {
    notifee.setBadgeCount(0).then(() => console.log('Badge count removed!'));
    let unsubscribe1 = notifee.onForegroundEvent(({type, detail}) => {
      // if (type === EventType.PRESS) {
      //   if (detail?.notification?.data?.type === 'chat') {
      //     getChatCount()
      //       .then(res => {
      //         console.log(res, 'CHAT_ID res', detail?.notification);
      //         saveChatCounter(res?.data);
      //         getUserData().then(res => {
      //           if (res?.subscription?.subscription_id === 3) {
      //             NavigationService.navigate(navigationString.CHATSCREEN, {
      //               prevData: detail?.notification?.data?.sender_id,
      //             });
      //           } else if (res?.subscription?.subscription_id === 2) {
      //             NavigationService.navigate(navigationString.CHATSCREEN, {
      //               prevData: detail?.notification?.data?.sender_id,
      //             });
      //           }
      //         });
      //       })
      //       .catch(error => {
      //         console.log(error, 'CHAT_ID error');
      //       });
      //   }
      // }
    });
    return () => unsubscribe1();
  }, []);

  const _saveUserData = async () => {
    await getUserData().then((res: Object | any) => {
      saveUserDataToStore(res);
    });
  };

  const getLocation = async () => {
    await checkPermission().then((res: Object | any) => {
      if (res == 'granted') {
        setLocationPermission(true);
        getCurrentLocation();
      } else {
        setLocationPermission(false);
      }
    });
  };

  return (
    <>
      <Provider store={store}>
        <StatusBar backgroundColor={Colors.white} barStyle={'dark-content'} />
        <Routes />
        <FlashMessage position={'top'} animated={true} />
      </Provider>
      {__DEV__ && <NetworkDebugger />}
    </>
  );
};

export default App;
