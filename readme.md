# TokenManager y JWTVerifier con Rotación de Secretos

Este proyecto implementa una gestión segura de JSON Web Tokens (JWT) mediante la **rotación automática de secretos**, utilizando Node.js. La solución permite mejorar la seguridad al limitar la validez de tokens en caso de que sean robados.

---

## Funcionalidad
El sistema incluye dos clases principales:

### 1. **TokenManager**
- Administra los secretos utilizados para firmar y verificar los JWT.
- Mantiene únicamente los últimos 2 secretos activos para equilibrar seguridad y eficiencia.
- **Métodos:**
  - `rotateSecret()`: Genera un nuevo secreto y elimina los más antiguos para mantener solo los 2 más recientes.
  - `getSecrets()`: Devuelve todos los secretos activos en el momento.

### 2. **JWTVerifier**
- Gestiona la firma y verificación de tokens JWT.
- Valida tokens contra todos los secretos activos en `TokenManager`.
- **Métodos:**
  - `sign(payload)`: Firma un nuevo token utilizando el secreto actual.
  - `verify(token)`: Verifica un token contra los secretos activos.

---

## Ejemplo de Uso
El siguiente ejemplo muestra cómo rotar secretos, generar un token y verificarlo:

```javascript
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
```

---

## Instalación
1. Clona este repositorio:
   ```bash
   git clone [<url_del_repositorio>](https://github.com/jaimeirazabal1/rotacion-de-tokens)
   ```
2. Instala las dependencias necesarias:
   ```bash
   npm install jsonwebtoken
   ```

---

## Detalles Técnicos
1. **Rotación de Secretos:**
   - Los secretos se generan con `crypto.randomBytes(32).toString('hex')`.
   - Los más antiguos se eliminan automáticamente después de cada rotación.

2. **Firma de Tokens:**
   - Los tokens tienen una validez de 5 minutos (`{ expiresIn: '5m' }`).
   - Los secretos rotativos permiten verificar tokens generados antes de la última rotación.

3. **Verificación de Tokens:**
   - Intenta verificar un token con cada secreto activo.
   - Lanza un error si el token es inválido o si no coincide con ninguno de los secretos.

---

## Beneficios
- **Seguridad Mejorada:** Los tokens robados quedan inútiles tras la rotación del secreto.
- **Facilidad de Uso:** API limpia para gestionar firma y verificación de tokens.
- **Eficiencia:** Mantiene solo dos secretos activos, reduciendo el impacto en el procesamiento.

---

## Limitaciones
- **Dependencia de sincronización:** Si usas esta lógica en múltiples servidores, deberás sincronizar la rotación de secretos.

---

## Próximos Pasos
- Implementar una base de datos distribuida para compartir secretos entre servidores.
- Incluir decoradores para validación automática en controladores.
- Configurar pruebas unitarias para validar la seguridad y el rendimiento.

---

## Contribuciones
Si tienes sugerencias o mejoras, ¡eres bienvenido a contribuir! Abre un issue o envía un pull request.

---

## Licencia
Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.
