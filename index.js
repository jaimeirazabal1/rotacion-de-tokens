const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Clase para gestionar la rotación de secretos
class TokenManager {
  static #secretsMap = new Map();

  static async rotateSecret() {
    const newSecret = crypto.randomBytes(32).toString('hex');
    const timestamp = Date.now();
    this.#secretsMap.set(timestamp, newSecret);

    // Mantener solo los últimos 2 secretos
    const keys = Array.from(this.#secretsMap.keys()).sort();
    while (keys.length > 2) {
      this.#secretsMap.delete(keys.shift());
    }

    console.log('Secretos actuales:', Array.from(this.#secretsMap.values()));
    return newSecret;
  }

  static getSecrets() {
    return Array.from(this.#secretsMap.values());
  }
}

// Clase para manejar JWT con secretos rotativos
class JWTVerifier {
  static async verify(token) {
    const secrets = TokenManager.getSecrets();

    for (const secret of secrets) {
      try {
        return jwt.verify(token, secret);
      } catch {
        continue;
      }
    }
    throw new Error('Token inválido o expirado');
  }

  static async sign(payload) {
    const currentSecret = Array.from(TokenManager.getSecrets())[0];
    if (!currentSecret) {
      throw new Error('No hay un secreto activo para firmar tokens.');
    }
    return jwt.sign(payload, currentSecret, { expiresIn: '5m' });
  }
}

// Simulación de uso
(async () => {
  // Rotar secreto y generar un token
  console.log('Rotando secreto...');
  await TokenManager.rotateSecret();

  const payload = { userId: 123, role: 'admin' };
  const token = await JWTVerifier.sign(payload);
  console.log('Token generado:', token);

  // Verificar el token generado
  try {
    const decoded = await JWTVerifier.verify(token);
    console.log('Token verificado:', decoded);
  } catch (error) {
    console.error('Error al verificar token:', error.message);
  }

  // Rotar secreto y volver a intentar la verificación
  console.log('\nRotando secreto nuevamente...');
  await TokenManager.rotateSecret();

  try {
    const decoded = await JWTVerifier.verify(token);
    console.log('Token verificado después de rotación:', decoded);
  } catch (error) {
    console.error('Error al verificar token tras rotación:', error.message);
  }
})();
