import React from 'react';
import {View, ActivityIndicator} from 'react-native';

export default function Loading() {
  return (
    <View
      style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
      className="bg-salt">
      <ActivityIndicator size={'large'} color="#D6220E" />
    </View>
  );
}
