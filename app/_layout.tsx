import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

function BrandTitle() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: 220 }}>
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 11,
          backgroundColor: '#101D48',
          borderWidth: 1.5,
          borderColor: '#62E9FF',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 9,
          shadowColor: '#2D7CFF',
          shadowOpacity: 0.35,
          shadowRadius: 7,
        }}
      >
        <Text style={{ color: '#62E9FF', fontSize: 15, fontWeight: '900' }}>SC</Text>
      </View>
      <View>
        <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '900', letterSpacing: 0.2 }}>
          SmartCalc <Text style={{ color: '#62E9FF' }}>AI</Text>
        </Text>
        <Text style={{ color: '#A8B7D8', fontSize: 9, fontWeight: '700', marginTop: 1 }}>
          by Suraj Rai · Calculate Anything
        </Text>
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#071230' },
        headerTintColor: '#FFFFFF',
        headerShadowVisible: false,
        headerTitleAlign: 'left',
        headerTitle: () => <BrandTitle />,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'SmartCalc AI' }} />
    </Stack>
  );
}
