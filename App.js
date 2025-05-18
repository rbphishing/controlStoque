import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaView, StatusBar, Image, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/LoginScreen';
import AddProductScreen from './screens/AddProductScreen';
import StockScreen from './screens/StockScreen';
import { initDatabase } from './database';
import { AuthProvider, useAuth } from './screens/context';

const Drawer = createDrawerNavigator();

function Routes() {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDatabase();
        const user = await AsyncStorage.getItem('user');
        if (user) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Erro ao inicializar:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, [setIsAuthenticated]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.logoContainer}>
          <Image source={require('./assets/logopx.png')} style={styles.logo} />
        </View>
      </View>
    );
  }

  return (
    <Drawer.Navigator
      initialRouteName={isAuthenticated ? 'Stock' : 'Login'}
      screenOptions={{
        headerStyle: { backgroundColor: '#000000' },
        headerTintColor: '#FFD700',
      }}
    >
      {!isAuthenticated ? (
        <Drawer.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Drawer.Screen
            name="Stock"
            component={StockScreen}
            options={{ title: 'Estoque' }}
          />
          <Drawer.Screen
            name="Add Product"
            component={AddProductScreen}
            options={{ title: 'Adicionar Produto' }}
          />
        </>
      )}
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.logoContainer}>
          <Image source={require('./assets/logopx.png')} style={styles.logo} />
        </View>
        <NavigationContainer>
          <Routes />
        </NavigationContainer>
      </SafeAreaView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
});