import {Modal, SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import NetworkLogger from 'react-native-network-logger';
import colors from './src/styles/colors';
import { moderateScale } from './src/styles';

const NetworkDebugger = () => {
  const [showModal, setModalVisibility] = React.useState(false);

  return (
    <View>
      <TouchableOpacity
        onPress={() => setModalVisibility(true)}
        style={{position: 'absolute', bottom: moderateScale(24), left: moderateScale(12)}}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 40 / 2,
            padding: 12,
            backgroundColor: colors.black,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={{fontSize: 14, color: colors.theme, fontWeight: '500'}}>
            D
          </Text>
        </View>
      </TouchableOpacity>
      <Modal animationType="slide" visible={showModal}>
        <SafeAreaView />
        <TouchableOpacity
          onPress={() => setModalVisibility(false)}
          style={{
            flexDirection: 'row',
            backgroundColor: colors.theme,
            justifyContent: 'center',
            padding: 12,
          }}>
          <Text style={{color: 'white', textAlign: 'center'}}>Close</Text>
        </TouchableOpacity>
        <NetworkLogger />
      </Modal>
    </View>
  );
};

export default NetworkDebugger;
