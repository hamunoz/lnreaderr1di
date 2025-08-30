import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TranslationsSettings from '@screens/settings/TranslationsSettings';
import TranslationListScreen from '@screens/settings/TranslationListScreen';
import SettingsTranslationScreen from '@screens/settings/SettingsTranslationScreen';
import TranslationLanguageScreen from '@screens/settings/TranslationLanguageScreen';


const Stack = createStackNavigator();

const SettingsNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="TranslationsSettings"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="TranslationsSettings"
        component={TranslationsSettings}
      />
      <Stack.Screen name="TranslationList" component={TranslationListScreen} />
      <Stack.Screen
        name="SettingsTranslation"
        component={SettingsTranslationScreen}
      />
 <Stack.Screen
        name="TranslationLanguageScreen"
        component={TranslationLanguageScreen}
        options={{ title: 'Idiomas de Traducción' }}
      />
    </Stack.Navigator>
  );
};

export default SettingsNavigator;
