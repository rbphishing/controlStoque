import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProducts } from '../database';
import { useAuth } from './context';
import { useIsFocused } from '@react-navigation/native'; // Adicionado para detectar foco

export default function StockScreen() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setIsAuthenticated } = useAuth();
  const isFocused = useIsFocused(); // Detecta quando a tela ganha foco

  useEffect(() => {
    fetchProducts();
  }, [isFocused]); // Recarrega quando a tela ganha foco

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const products = await getProducts();
      setProducts(products);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      Alert.alert('Erro', 'Falha ao carregar estoque.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Falha ao fazer logout.');
    }
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productDetail}>Quantidade: {item.quantity}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estoque</Text>
      {isLoading ? (
        <Text style={styles.loading}>Carregando...</Text>
      ) : products.length === 0 ? (
        <Text style={styles.empty}>Nenhum produto no estoque.</Text>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      )}
      <View style={styles.buttonContainer}>
        <Button title="Sair" onPress={handleLogout} color="#FF5555" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  loading: {
    color: '#FFD700',
    textAlign: 'center',
    fontSize: 16,
  },
  empty: {
    color: '#FFD700',
    textAlign: 'center',
    fontSize: 16,
  },
  list: {
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  productName: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productDetail: {
    color: '#FFD700',
    fontSize: 14,
    marginBottom: 5,
  },
  buttonContainer: {
    marginVertical: 10,
  },
});