import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addUser, getUser, getUserByUsernameDebug } from '../database';
import { useAuth } from './context';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setIsAuthenticated } = useAuth();

  const validateInputs = () => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
    if (!username.trim()) {
      setError('O campo usuário é obrigatório.');
      return false;
    }
    if (!usernameRegex.test(username.trim())) {
      setError('Usuário deve ter pelo menos 3 caracteres alfanuméricos.');
      return false;
    }
    if (!password.trim()) {
      setError('O campo senha é obrigatório.');
      return false;
    }
    if (password.trim().length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres.');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    try {
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();
      console.log('Tentando login com:', { trimmedUsername, trimmedPassword });

      // Para depuração: usar getUserByUsernameDebug
      const user = await getUserByUsernameDebug(trimmedUsername);
      // Descomentar após corrigir o erro SQL
      // const user = await getUser(trimmedUsername, trimmedPassword);
      if (user) {
        // Para depuração: ignorar senha temporariamente
        await AsyncStorage.setItem('user', JSON.stringify({ username: trimmedUsername, id: user.id }));
        setIsAuthenticated(true);
        console.log('Login bem-sucedido:', trimmedUsername);
      } else {
        setError('Usuário não encontrado.');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setError(`Falha ao fazer login: ${error.message}`);
    }
  };

  const handleRegister = async () => {
    try {
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();
      console.log('Tentando cadastrar:', { trimmedUsername, trimmedPassword });

      const result = await addUser(trimmedUsername, trimmedPassword);
      if (result) {
        Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');
        setUsername('');
        setPassword('');
        setIsRegistering(false);
        console.log('Cadastro bem-sucedido:', trimmedUsername);
      }
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      if (error.message.includes('UNIQUE constraint failed')) {
        setError('Usuário já existe.');
      } else {
        setError(`Erro ao cadastrar usuário: ${error.message}`);
      }
    }
  };

  const handleSubmit = async () => {
    if (isLoading || !validateInputs()) return;
    setIsLoading(true);
    setError('');
    try {
      if (isRegistering) {
        await handleRegister();
      } else {
        await handleLogin();
      }
    } catch (error) {
      console.error('Erro no submit:', error);
      setError('Erro ao processar solicitação.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setUsername('');
    setPassword('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Controle de Estoque</Text>
      <TextInput
        style={[styles.input, error && username === '' ? styles.inputError : null]}
        placeholder="Usuário"
        value={username}
        onChangeText={text => {
          setUsername(text);
          setError('');
        }}
        autoCapitalize="none"
        editable={!isLoading}
        accessibilityLabel="Campo de usuário"
        accessibilityHint="Digite seu nome de usuário"
      />
      <TextInput
        style={[styles.input, error && password === '' ? styles.inputError : null]}
        placeholder="Senha"
        value={password}
        onChangeText={text => {
          setPassword(text);
          setError('');
        }}
        secureTextEntry
        autoCapitalize="none"
        editable={!isLoading}
        accessibilityLabel="Campo de senha"
        accessibilityHint="Digite sua senha"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {isLoading && <ActivityIndicator size="large" color="#FFD700" style={styles.loader} />}
      <View style={styles.buttonContainer}>
        <Button
          title={isRegistering ? 'Cadastrar' : 'Entrar'}
          onPress={handleSubmit}
          color="#FFD700"
          disabled={isLoading}
          accessibilityLabel={isRegistering ? 'Botão de cadastro' : 'Botão de login'}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title={isRegistering ? 'Já tem conta? Entrar' : 'Criar nova conta'}
          onPress={handleToggleMode}
          color="#FFD700"
          disabled={isLoading}
          accessibilityLabel={isRegistering ? 'Voltar para login' : 'Ir para cadastro'}
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
  inputError: {
    borderColor: '#FF5555',
  },
  error: {
    color: '#FF5555',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
  },
  loader: {
    marginVertical: 15,
  },
  buttonContainer: {
    marginVertical: 10,
  },
});