
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { addProduct } from '../database';

export default function AddProductScreen() {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateInputs = () => {
    if (!name || !quantity) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return false;
    }
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 0) {
      Alert.alert('Erro', 'Quantidade deve ser um número não negativo.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;
    setIsLoading(true);
    try {
      await addProduct(name, parseInt(quantity));
      Alert.alert('Sucesso', 'Produto adicionado com sucesso!');
      setName('');
      setQuantity('');
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      Alert.alert('Erro', 'Falha ao adicionar produto.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar Produto</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome do Produto"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        editable={!isLoading}
      />
      <TextInput
        style={styles.input}
        placeholder="Quantidade"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
        editable={!isLoading}
      />
      <View style={styles.buttonContainer}>
        <Button
          title="Adicionar"
          onPress={handleSubmit}
          color="#FFD700"
          disabled={isLoading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#000000',
  },
  title: {
    fontSize: 28,
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    borderColor: '#FFD700',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    color: '#FFD700',
    backgroundColor: '#333333',
    fontSize: 16,
  },
  buttonContainer: {
    marginVertical: 10,
  },
});
