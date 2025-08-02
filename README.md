# 💰 Gestor de Finanzas Personales

Una aplicación web moderna y completa para gestionar tus finanzas personales, construida con React, TypeScript, Tailwind CSS y Supabase. Perfecta para desplegar en Netlify.

## ✨ Características Principales

### 📊 Dashboard Intuitivo
- **Resumen mensual** con ingresos, gastos y balance
- **Comparación** con el mes anterior
- **Gráficos dinámicos** de tendencias mensuales
- **Análisis por categorías** con gráficos de dona
- **Resumen anual** completo

### 💳 Pagos Recurrentes Automáticos
- Configura pagos mensuales automáticos (alquiler, tarjetas, servicios)
- Se agregan automáticamente cada mes en la fecha especificada
- Gestión de pagos activos/inactivos
- Categorización automática

### 📝 Gestión de Transacciones
- Agregar ingresos y gastos manualmente
- Categorización inteligente con iconos
- Búsqueda y filtrado avanzado
- Edición y eliminación de transacciones

### 📈 Análisis Visual
- Gráficos de líneas para tendencias temporales
- Gráficos de dona para distribución por categorías
- Comparativas mes a mes
- Indicadores de crecimiento/decrecimiento

### 🔐 Autenticación y Seguridad
- Sistema de autenticación completo con Supabase
- Datos seguros y privados por usuario
- Row Level Security (RLS) implementado
- Sesiones persistentes

### 🎨 Diseño Moderno
- Interfaz responsive y mobile-first
- Tema claro y profesional
- Iconos intuitivos
- Experiencia de usuario fluida

## 🚀 Configuración y Despliegue

### 📋 Prerrequisitos
- Node.js 18+
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Netlify](https://netlify.com) (opcional)

### 🗄️ Configuración de Supabase

#### 1. Crear Proyecto en Supabase
1. Ve a [Supabase](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Anota la **URL del proyecto** y la **clave anónima**

#### 2. Configurar Base de Datos
1. Ve al **SQL Editor** en tu dashboard de Supabase
2. Copia y ejecuta el contenido del archivo `supabase-schema.sql`
3. Esto creará todas las tablas, políticas de seguridad e índices necesarios

#### 3. Configurar Variables de Entorno
1. Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Completa las variables con tus datos de Supabase:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
   ```

### 🛠️ Desarrollo Local

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd gestor-finanzas-personales

# Instalar dependencias
npm install

# Configurar variables de entorno (ver arriba)
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

### 🌐 Despliegue en Netlify

#### Opción 1: Despliegue Directo desde GitHub
1. Sube tu código a GitHub
2. Conecta tu repositorio con Netlify
3. **Configura las variables de entorno** en Netlify:
   - Ve a Site settings > Environment variables
   - Agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
4. Netlify detectará automáticamente la configuración de Vite
5. ¡Deploy automático!

#### Opción 2: Deploy Manual
```bash
# Construir la aplicación
npm run build

# Subir la carpeta 'dist' a Netlify
# O usar Netlify CLI:
npx netlify deploy --prod --dir=dist
```

### Scripts Disponibles
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Preview de la build de producción
- `npm run lint` - Linter de código

## 💾 Almacenamiento de Datos

La aplicación utiliza **Supabase** como base de datos:
- ✅ Base de datos PostgreSQL en la nube
- ✅ Autenticación integrada y segura
- ✅ Row Level Security (RLS)
- ✅ Sincronización en tiempo real
- ✅ Backups automáticos
- ✅ Acceso desde cualquier dispositivo

### Datos Almacenados
- **Perfiles de usuario** (nombre, email, avatar)
- **Transacciones** (ingresos y gastos con categorización)
- **Pagos recurrentes** configurados
- **Metadatos** de auditoría (fechas de creación/actualización)

## 📱 Categorías Predefinidas

### Gastos
- 🍽️ Alimentación
- 🚗 Transporte  
- 🏠 Vivienda
- 💡 Servicios
- 🏥 Salud
- 🎬 Entretenimiento
- 👕 Ropa
- 📚 Educación
- 💳 Tarjetas de Crédito
- 📝 Otros Gastos

### Ingresos
- 💼 Salario
- 💻 Freelance
- 📈 Inversiones
- 🏪 Negocios
- 🏘️ Alquiler
- 💰 Otros Ingresos

## 🔧 Tecnologías Utilizadas

### Frontend
- **React 18** - Framework de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de CSS
- **Chart.js** - Gráficos interactivos
- **Lucide React** - Iconos modernos
- **date-fns** - Manejo de fechas

### Backend
- **Supabase** - Backend as a Service
- **PostgreSQL** - Base de datos
- **Row Level Security** - Seguridad a nivel de fila
- **Autenticación JWT** - Sistema de autenticación

## 🌟 Funcionalidades Avanzadas

### Automatización Inteligente
- Los pagos recurrentes se procesan automáticamente
- Detección de transacciones duplicadas
- Cálculos automáticos de balances y porcentajes

### Seguridad
- Autenticación robusta con Supabase Auth
- Políticas de seguridad a nivel de base de datos
- Datos encriptados en tránsito y en reposo
- Sesiones seguras con tokens JWT

### Experiencia de Usuario
- Formularios con validación en tiempo real
- Estados de carga y feedback visual
- Manejo de errores elegante
- Navegación intuitiva entre secciones

### Responsive Design
- Optimizado para móviles y tablets
- Navegación adaptativa
- Gráficos que se ajustan al tamaño de pantalla

## 📊 Casos de Uso

### Para Individuos
- Control de gastos mensuales
- Seguimiento de objetivos de ahorro
- Análisis de patrones de gasto
- Planificación financiera personal

### Para Freelancers
- Seguimiento de ingresos variables
- Control de gastos del negocio
- Análisis de rentabilidad mensual

### Para Familias
- Presupuesto familiar compartido
- Control de gastos por categorías
- Planificación de gastos grandes

## 🔒 Privacidad y Seguridad

- **Datos seguros**: Almacenados en Supabase con encriptación
- **Acceso controlado**: Row Level Security garantiza privacidad
- **Autenticación robusta**: Sistema de autenticación completo
- **Sin tracking**: No se recopilan datos personales adicionales
- **Control total**: Tú tienes el control absoluto de tus datos

## 🚨 Solución de Problemas

### Error de conexión a Supabase
- Verifica que las variables de entorno estén configuradas correctamente
- Asegúrate de que el proyecto de Supabase esté activo
- Revisa que las políticas RLS estén configuradas

### Error de autenticación
- Verifica que el email sea válido
- La contraseña debe tener al menos 6 caracteres
- Revisa la configuración de Auth en Supabase

### Datos no se cargan
- Verifica la conexión a internet
- Revisa la consola del navegador para errores
- Asegúrate de estar autenticado

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si encuentras algún problema o tienes sugerencias:
- Abre un issue en GitHub
- Describe el problema detalladamente
- Incluye pasos para reproducirlo
- Menciona tu configuración (navegador, SO, etc.)

---

**¡Toma el control de tus finanzas personales con la seguridad de Supabase! 💪** 