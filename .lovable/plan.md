# Actualización de Términos y Política de Privacidad

## Decisiones recogidas
- **Titular**: proyecto personal sin entidad jurídica → se identifica como "A la Gloria" (proyecto personal) con email de contacto.
- **Jurisdicción**: España (RGPD + LOPDGDD + LSSI-CE).
- **Edad mínima**: 14 años (art. 7 LOPDGDD).
- **Servicios externos**: solo Lovable Cloud (Supabase, hosting UE) + futuras notificaciones push (FCM) para la app nativa.
- **Monetización**: gratis ahora, posible monetización futura (cláusula preventiva, sin obligaciones comerciales actuales).
- **Cookies**: solo técnicas/funcionales (sin banner obligatorio).
- **Retención**: mientras la cuenta exista; borrado al eliminar cuenta.
- **Contacto legal/RGPD**: info@alagloria.es.

## Cambios en `src/pages/Terms.tsx`
Reescritura completa con secciones:
1. Aceptación y titular del servicio (proyecto personal A la Gloria, contacto info@alagloria.es).
2. Descripción del servicio (trivia Semana Santa, partidas diarias, torneos, ranking).
3. Edad mínima: **14 años**. Si eres menor, no puedes registrarte.
4. Registro y cuenta (datos requeridos, responsabilidad de credenciales).
5. Reglas de juego (1 partida/día, 10 preguntas, antitrampas).
6. Conducta del usuario y suspensión por incumplimiento.
7. Comunicaciones comerciales (consentimiento expreso, baja).
8. **Servicio gratuito** — cláusula: actualmente sin coste; si en el futuro se introducen funciones de pago se notificará y requerirá aceptación previa.
9. Propiedad intelectual.
10. Disponibilidad y limitación de responsabilidad ("tal cual", sin garantías).
11. Modificaciones del servicio y de los términos.
12. Eliminación de cuenta (in-app desde Acerca → Zona de peligro).
13. Legislación aplicable: España; jurisdicción: tribunales del domicilio del usuario consumidor.
14. Contacto: info@alagloria.es.

## Cambios en `src/pages/Privacy.tsx`
Reescritura completa con secciones:
1. Responsable del tratamiento: A la Gloria (proyecto personal), email info@alagloria.es.
2. Datos recopilados: cuenta (nombre, apellidos cuando aplique en torneos, email, hermandad, contraseña hasheada), juego (puntuaciones, partidas, rachas, logros), inscripciones torneos (teléfono), técnicos mínimos (logs servidor).
3. Finalidades y bases legales:
   - Ejecución del servicio (art. 6.1.b RGPD)
   - Consentimiento para comunicaciones comerciales (art. 6.1.a + LSSI 21)
   - Interés legítimo en seguridad/antifraude (art. 6.1.f)
   - Cumplimiento legal (art. 6.1.c)
4. Encargados/proveedores: **Lovable Cloud (Supabase)** como infraestructura (hosting + base de datos + auth, servidores en UE). Cláusula preventiva sobre **FCM (Google)** para push cuando se publique la app nativa.
5. Datos públicos en la app: nombre + hermandad + puntuación visibles en rankings y torneos.
6. **Cookies**: solo técnicas/funcionales (sesión Supabase, preferencias). Sin cookies analíticas ni publicitarias → no requiere banner.
7. Conservación: mientras la cuenta esté activa; al eliminar cuenta los datos se borran de forma permanente (vía Acerca → Eliminar cuenta). Logs técnicos pueden conservarse hasta 12 meses por seguridad.
8. Derechos RGPD (acceso, rectificación, supresión, portabilidad, oposición, limitación) → ejercitables vía info@alagloria.es o desde la app (editar perfil / eliminar cuenta).
9. Reclamación ante la **AEPD** (www.aepd.es) si el usuario considera vulnerados sus derechos.
10. Edad mínima **14 años** (art. 7 LOPDGDD). Si detectamos cuenta de menor de 14 será eliminada. Padres/tutores pueden solicitar borrado.
11. Seguridad: cifrado HTTPS, contraseñas hasheadas, RLS en base de datos, control de acceso por roles.
12. Transferencias internacionales: datos almacenados en UE; si en el futuro se usa FCM (Google), se aplicarán cláusulas contractuales tipo.
13. **Versión nativa (Android/iOS)**: cuando la app se distribuya en tiendas, podrá usar almacenamiento local del dispositivo, identificadores de instalación y, opcionalmente, notificaciones push (requieren permiso). No se accede a contactos, ubicación, cámara, micrófono ni almacenamiento del usuario.
14. Cambios en la política (notificación in-app de cambios sustanciales).
15. Contacto: info@alagloria.es.

## Cambios menores
- Mantener `info@alagloria.es` como contacto único en ambos archivos.
- Mantener exactamente la misma estructura visual (header, Card, botón Volver, fecha de "Última actualización" dinámica).
- No se tocan otros archivos ni lógica de la app.

## Notas técnicas
- Solo se editan `src/pages/Terms.tsx` y `src/pages/Privacy.tsx`.
- Sin migraciones, sin cambios de backend, sin nuevas dependencias.
- Los textos quedan listos para añadir el wrap con Capacitor sin necesidad de reescribir la política (la sección 13 de privacidad ya cubre el caso nativo).

¿Apruebas este plan para implementarlo?
