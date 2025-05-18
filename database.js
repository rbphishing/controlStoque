import * as SQLite from 'expo-sqlite';

// Log inicial do módulo
console.log('SQLite Module:', Object.keys(SQLite));

let db = null;

export const openDatabase = async () => {
  if (db) {
    console.log('Retornando banco de dados em cache');
    return db;
  }
  try {
    console.log('openDatabaseSync available:', !!SQLite.openDatabaseSync);
    console.log('openDatabaseAsync available:', !!SQLite.openDatabaseAsync);
    db = await SQLite.openDatabaseAsync('stockControl.db', {
      useNewConnection: true, // Garante conexão fresca
    });
    console.log('Banco de dados aberto com sucesso');
    return db;
  } catch (error) {
    console.error('Erro ao abrir o banco de dados:', error);
    throw new Error(`Erro ao abrir o banco de dados: ${error.message}`);
  }
};

const executeSql = async (sql, params = []) => {
  try {
    // Validar SQL
    if (typeof sql !== 'string' || !sql.trim()) {
      throw new Error('Consulta SQL inválida');
    }

    // Validar e normalizar parâmetros
    if (!Array.isArray(params)) {
      console.warn('Parâmetros devem ser um array. Usando array vazio.');
      params = [];
    }
    const validatedParams = params.map((param, index) => {
      if (param === null || param === undefined) return null;
      if (typeof param === 'string' || typeof param === 'number') return param;
      console.warn(`Parâmetro inválido no índice ${index}: ${JSON.stringify(param)}. Convertendo para string.`);
      return String(param);
    });
    console.log('Executando SQL:', sql, 'com params:', validatedParams);

    const database = await openDatabase();
    const isSelect = sql.trim().toUpperCase().startsWith('SELECT');

    // Tentar executar a consulta com retry
    let result;
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        if (isSelect) {
          const execResult = await database.getAllAsync(sql, validatedParams);
          result = { rows: execResult || [], insertId: null };
        } else {
          const runResult = await database.runAsync(sql, validatedParams);
          result = { rows: [], insertId: runResult.lastInsertRowId };
        }
        break;
      } catch (error) {
        attempts++;
        console.warn(`Tentativa ${attempts} falhou: ${error.message}`);
        if (attempts === maxAttempts) throw error;
        await new Promise(resolve => setTimeout(resolve, 100)); // Espera 100ms
      }
    }

    console.log('Resultado SQL:', isSelect ? result.rows : result.insertId);
    return result;
  } catch (error) {
    console.error('Erro ao executar SQL:', sql, 'Params:', params, 'Erro:', error);
    throw error;
  }
};

export const initDatabase = async () => {
  try {
    await executeSql(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );`
    );

    // Recriar a tabela products sem a coluna price
    await executeSql(`DROP TABLE IF EXISTS products;`);
    await executeSql(
      `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL
      );`
    );

    console.log('Tabelas criadas ou já existentes');
  } catch (error) {
    console.error('Erro ao inicializar banco:', error);
    throw new Error(`Erro ao inicializar banco: ${error.message}`);
  }
};

export const addUser = async (username, password) => {
  if (!username || !password) {
    throw new Error('Username e password são obrigatórios');
  }
  try {
    await executeSql(
      'INSERT INTO users (username, password) VALUES (?, ?);',
      [String(username), String(password)]
    );
    console.log('Usuário adicionado com sucesso:', username);
    return true;
  } catch (error) {
    console.error('Erro ao adicionar usuário:', error);
    throw new Error(`Erro ao adicionar usuário: ${error.message}`);
  }
};

export const getUser = async (username, password) => {
  if (!username || !password) {
    throw new Error('Username e password são obrigatórios');
  }
  try {
    console.log('Buscando usuário:', { username, password });
    const result = await executeSql(
      'SELECT * FROM users WHERE username = ? AND password = ?;',
      [String(username), String(password)]
    );
    console.log('Resultado getUser:', result);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    throw new Error(`Erro ao buscar usuário: ${error.message}`);
  }
};

// Função de depuração: evita parâmetros
export const getUserByUsernameDebug = async (username) => {
  if (!username) {
    throw new Error('Username é obrigatório');
  }
  try {
    console.log('Buscando usuário por username (debug):', username);
    const escapedUsername = String(username).replace(/'/g, "''");
    const result = await executeSql(
      `SELECT * FROM users WHERE username = '${escapedUsername}';`,
      []
    );
    console.log('Resultado getUserByUsernameDebug:', result);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Erro ao buscar usuário por username (debug):', error);
    throw new Error(`Erro ao buscar usuário por username: ${error.message}`);
  }
};

export const addProduct = async (name, quantity) => {
  if (!name || quantity == null) {
    throw new Error('Nome e quantidade são obrigatórios');
  }
  try {
    await executeSql(
      'INSERT INTO products (name, quantity) VALUES (?, ?);',
      [String(name), Number(quantity)]
    );
    console.log('Produto adicionado com sucesso:', name);
    return true;
  } catch (error) {
    console.error('Erro ao adicionar produto:', error);
    throw new Error(`Erro ao adicionar produto: ${error.message}`);
  }
};

export const getProducts = async () => {
  try {
    console.log('Executando getProducts');
    const result = await executeSql('SELECT * FROM products;', []);
    console.log('Resultado getProducts:', result);
    return result.rows;
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    throw new Error(`Erro ao carregar produtos: ${error.message}`);
  }
};
