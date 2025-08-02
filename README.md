# 💰 Gestor de Finanzas Personales

Una aplicación web moderna y completa para gestionar tus finanzas personales, construida con React, TypeScript y Tailwind CSS. Perfecta para desplegar en Netlify.

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

### 🎨 Diseño Moderno
- Interfaz responsive y mobile-first
- Tema claro y profesional
- Iconos intuitivos
- Experiencia de usuario fluida

## 🚀 Despliegue en Netlify

### Opción 1: Despliegue Directo
1. Haz fork de este repositorio
2. Conecta tu cuenta de Netlify con GitHub
3. Selecciona este repositorio
4. Netlify detectará automáticamente la configuración de Vite
5. ¡Despliega!

### Opción 2: Despliegue Manual
1. Clona el repositorio
2. Instala las dependencias: `npm install`
3. Construye la aplicación: `npm run build`
4. Sube la carpeta `dist` a Netlify

## 🛠️ Desarrollo Local

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd gestor-finanzas-personales

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### Scripts Disponibles
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Preview de la build de producción
- `npm run lint` - Linter de código

## 💾 Almacenamiento de Datos

La aplicación utiliza **localStorage** del navegador para persistir los datos:
- ✅ No requiere base de datos externa
- ✅ Funciona completamente offline
- ✅ Datos privados y seguros
- ✅ Compatible con todos los navegadores modernos

### Datos Almacenados
- Transacciones (ingresos y gastos)
- Pagos recurrentes configurados
- Configuraciones de la aplicación

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

- **React 18** - Framework de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de CSS
- **Chart.js** - Gráficos interactivos
- **Lucide React** - Iconos modernos
- **date-fns** - Manejo de fechas

## 🌟 Funcionalidades Avanzadas

### Automatización Inteligente
- Los pagos recurrentes se procesan automáticamente
- Detección de transacciones duplicadas
- Cálculos automáticos de balances y porcentajes

### Experiencia de Usuario
- Formularios con validación en tiempo real
- Confirmaciones para acciones destructivas
- Estados de carga y feedback visual
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

- **Datos locales**: Toda la información se almacena en tu navegador
- **Sin tracking**: No se recopilan datos personales
- **Sin servidores**: Funciona completamente en el cliente
- **Control total**: Tú tienes el control absoluto de tus datos

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

---

**¡Toma el control de tus finanzas personales hoy mismo! 💪** 