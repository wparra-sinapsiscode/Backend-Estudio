/**
 * Script para probar el flujo de autenticación.
 * Este script envía una solicitud de login, obtiene un token JWT 
 * y luego intenta acceder a una ruta protegida.
 * 
 * Modo de uso:
 * node src/tests/auth-test.js
 */

const axios = require('axios');

// URL base del servidor
const BASE_URL = 'http://localhost:5000/api';

// Función para simular espera (sleep)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Prueba de autenticación
const testAuthentication = async () => {
  try {
    console.log('=== PRUEBA DE AUTENTICACIÓN ===');
    
    // 1. Intentar acceder a una ruta protegida sin token
    console.log('\n1. Intentando acceder a una ruta protegida sin token...');
    try {
      await axios.get(`${BASE_URL}/clients`);
      console.log('✓ Acceso permitido (esto NO debería ocurrir)');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✓ Acceso denegado correctamente (status 401)');
        console.log(`  Mensaje: ${error.response.data.message}`);
      } else {
        console.error('✗ Error inesperado:', error.message);
      }
    }
    
    await sleep(1000);
    
    // 2. Intentar login con credenciales incorrectas
    console.log('\n2. Intentando login con credenciales incorrectas...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        username: 'admin',
        password: 'password_incorrecto'
      });
      console.log('✗ Login exitoso (esto NO debería ocurrir)');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✓ Login fallido correctamente (status 401)');
        console.log(`  Mensaje: ${error.response.data.message}`);
      } else {
        console.error('✗ Error inesperado:', error.message);
      }
    }
    
    await sleep(1000);
    
    // 3. Login con credenciales correctas
    console.log('\n3. Intentando login con credenciales correctas...');
    let token;
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        username: 'admin',
        password: 'admin'
      });
      token = response.data.token;
      console.log('✓ Login exitoso');
      console.log(`  Token: ${token.substring(0, 20)}... (truncado)`);
      console.log(`  Usuario: ${JSON.stringify(response.data.user)}`);
    } catch (error) {
      console.error('✗ Error en login:', error.message);
      if (error.response) {
        console.error('  Detalles:', error.response.data);
      }
      process.exit(1);
    }
    
    await sleep(1000);
    
    // 4. Verificar token
    console.log('\n4. Verificando token...');
    try {
      const response = await axios.get(`${BASE_URL}/auth/verify`, {
        headers: {
          'Authorization': token
        }
      });
      console.log('✓ Token verificado correctamente');
      console.log(`  Usuario: ${JSON.stringify(response.data.user)}`);
    } catch (error) {
      console.error('✗ Error al verificar token:', error.message);
      if (error.response) {
        console.error('  Detalles:', error.response.data);
      }
    }
    
    await sleep(1000);
    
    // 5. Acceder a una ruta protegida con token
    console.log('\n5. Accediendo a una ruta protegida con token...');
    try {
      const response = await axios.get(`${BASE_URL}/clients`, {
        headers: {
          'Authorization': token
        }
      });
      console.log('✓ Acceso permitido correctamente');
      console.log(`  Cantidad de clientes: ${response.data.count}`);
    } catch (error) {
      console.error('✗ Error al acceder a ruta protegida:', error.message);
      if (error.response) {
        console.error('  Detalles:', error.response.data);
      }
    }
    
    console.log('\n=== FIN DE LA PRUEBA ===');
  } catch (error) {
    console.error('Error general en la prueba:', error);
  }
};

// Ejecutar la prueba
testAuthentication();