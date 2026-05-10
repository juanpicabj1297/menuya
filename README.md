# MenuYa

PWA de pedidos online para restaurantes locales de Suipacha, Buenos Aires.

## Que incluye esta base

- Next.js con App Router.
- Tailwind CSS para estilos responsive.
- Supabase preparado para autenticacion y base de datos.
- Pantallas iniciales: home, restaurantes, menu, carrito, login y panel.
- Manifest basico para instalar la web como PWA.
- SQL inicial en `supabase/schema.sql`.

## Arquitectura recomendada

La app se divide en dos grandes lados:

1. Cliente final: ve restaurantes, mira menus, arma el carrito y confirma el pedido.
2. Restaurante: inicia sesion, administra menu y revisa pedidos recibidos.

No hay repartidores propios, GPS ni app nativa. El cliente escribe su direccion o elige retiro, y cada restaurante gestiona la entrega.

## Carpetas principales

- `app/`: rutas y pantallas de Next.js.
- `app/restaurantes/`: listado publico y menu de cada restaurante.
- `app/carrito/`: pantalla del carrito y confirmacion.
- `app/restaurante/`: login y panel privado del restaurante.
- `lib/`: funciones compartidas, consultas a Supabase y clientes de Supabase.
- `public/`: archivos publicos de la PWA, como el manifest y el icono.
- `supabase/`: scripts SQL para crear tablas, permisos y datos iniciales.

## Configuracion paso a paso

### 1. Instalar Node.js completo

En esta PC se detecto Node, pero no `npm` en PowerShell. Instala Node.js LTS desde:

https://nodejs.org/

Despues cerra y abri PowerShell, y comproba:

```bash
node --version
npm --version
```

### 2. Instalar dependencias

Dentro de esta carpeta:

```bash
npm install
```

### 3. Crear proyecto en Supabase

1. Entra a https://supabase.com/
2. Crea un proyecto nuevo.
3. Copia la URL del proyecto y la clave `anon public`.
4. Crea un archivo `.env.local` tomando como ejemplo `.env.example`.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

### 4. Crear la base de datos

En Supabase, abri SQL Editor, pega el contenido de:

```bash
supabase/schema.sql
```

y ejecutalo.

Si ya habias ejecutado el esquema anterior, ejecuta tambien:

```bash
supabase/migrations/001_public_catalog_fields.sql
supabase/migrations/002_allow_unclaimed_demo_restaurants.sql
supabase/migrations/003_seed_contract_constraints.sql
supabase/migrations/004_checkout_payment_method.sql
```

Esas migraciones agregan los campos visuales que usa MenuYa, permiten
restaurantes demo sin usuario asignado, crean restricciones para que el seed
pueda actualizar datos sin duplicarlos y agregan el metodo de pago simple al
pedido.

### 4.1. Cargar datos demo

Para ver MenuYa funcionando mientras cargas comercios reales, ejecuta tambien:

```bash
supabase/seed.sql
```

Incluye restaurantes y productos demo de Suipacha con imagenes. Se puede ejecutar
mas de una vez porque evita duplicados.

### 5. Activar autenticacion

En Supabase:

1. Anda a Authentication.
2. Activa login por email y contrasena.
3. Crea un usuario para cada restaurante.
4. Asocia ese usuario a una fila en `restaurant_profiles`.

### 6. Levantar la app

```bash
npm run dev
```

Luego abri:

```bash
http://localhost:3000
```

## Proximos pasos logicos

1. Hacer funcionar el login real del restaurante.
2. Crear formularios para editar perfil, menu y productos.
3. Guardar carrito en estado local o localStorage.
4. Crear pedidos reales en Supabase.
5. Agregar notificacion visual de pedidos nuevos en el panel.
6. Mas adelante, agregar selector de ciudad sin cambiar toda la arquitectura.
