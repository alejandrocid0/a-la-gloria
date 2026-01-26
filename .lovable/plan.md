

## Plan: Actualizar Terminos y Politica de Privacidad para Comunicaciones Comerciales

### Contexto Legal (Legislacion Espanola)

Segun la **LSSI-CE** (Ley 34/2002) y la **LOPDGDD** (Ley Organica 3/2018), para enviar comunicaciones comerciales por email es necesario:

1. **Consentimiento expreso previo** del usuario (opt-in)
2. **Informacion clara** sobre el uso del email para fines comerciales
3. **Derecho de oposicion** facil y gratuito en cualquier momento
4. **Base legal legitima** documentada (en este caso: consentimiento al registrarse)

---

### Cambios en Terminos y Condiciones

**Archivo**: `src/pages/Terms.tsx`

Anadir nueva seccion entre "Registro de Cuenta" (3) y "Reglas del Juego" (4), renumerando las siguientes:

**Nueva Seccion 4: Comunicaciones Comerciales**

Contenido a incluir:
- Al registrarte, consientes recibir comunicaciones comerciales
- Tipos de comunicaciones: novedades, actualizaciones, promociones, eventos relacionados con la Semana Santa
- Frecuencia razonable (no mas de 2-3 emails mensuales)
- Derecho a darte de baja en cualquier momento
- Enlace para gestionar preferencias en el perfil

---

### Cambios en Politica de Privacidad

**Archivo**: `src/pages/Privacy.tsx`

**Modificacion 1**: Ampliar seccion "2. Como Usamos tu Informacion"
- Anadir punto explicito sobre comunicaciones comerciales

**Nueva Seccion**: "Comunicaciones Comerciales" (insertar como seccion 5, renumerando las siguientes)

Contenido segun LSSI-CE:
- Base legal: consentimiento otorgado al aceptar terminos durante el registro
- Tipos de comunicaciones comerciales que se enviaran
- Derecho de oposicion: como darse de baja (enlace en cada email + desde perfil)
- Gratuidad del ejercicio del derecho
- Referencia a la LSSI-CE articulo 21

---

### Actualizacion de Fecha

Ambos documentos ya muestran la fecha dinamica con `new Date().toLocaleDateString()`, por lo que siempre mostraran la fecha actual automaticamente.

---

### Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/pages/Terms.tsx` | Nueva seccion 4 "Comunicaciones Comerciales", renumerar secciones 4-10 a 5-11 |
| `src/pages/Privacy.tsx` | Ampliar seccion 2, nueva seccion 5 "Comunicaciones Comerciales", renumerar 5-11 a 6-12 |

---

### Texto Legal Propuesto

**Para Terminos (seccion resumida):**
> Al registrarte en A la Gloria, consientes expresamente recibir comunicaciones comerciales electronicas relacionadas con el juego, incluyendo novedades, actualizaciones, promociones y eventos vinculados a la Semana Santa. Puedes revocar este consentimiento en cualquier momento a traves de tu perfil o mediante el enlace de baja incluido en cada comunicacion, sin coste alguno.

**Para Privacidad (seccion completa):**
> Conforme al articulo 21 de la LSSI-CE, al registrarte y aceptar los terminos de uso, nos autorizas a enviarte comunicaciones comerciales electronicas sobre A la Gloria. Esto incluye:
> - Novedades y actualizaciones del juego
> - Promociones y eventos especiales
> - Contenido relacionado con la Semana Santa
> - Informacion sobre nuevas funcionalidades
>
> **Base legal**: Tu consentimiento expreso otorgado durante el registro.
>
> **Derecho de oposicion**: Puedes darte de baja en cualquier momento:
> - Haciendo clic en el enlace "Cancelar suscripcion" incluido en cada email
> - Desde la seccion de preferencias de tu perfil
> - Contactandonos en info@alagloria.es
>
> El ejercicio de este derecho es gratuito y se hara efectivo en un plazo maximo de 10 dias habiles.

