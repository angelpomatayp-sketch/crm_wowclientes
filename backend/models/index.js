const sequelize = require('../config/database');
const Ejecutivo = require('./Ejecutivo');
const Cliente = require('./Cliente');
const Contacto = require('./Contacto');
const Cotizacion = require('./Cotizacion');
const CotizacionItem = require('./CotizacionItem');
const Orden = require('./Orden');
const Factura = require('./Factura');
const Actividad = require('./Actividad');
const Oportunidad = require('./Oportunidad');
const Recordatorio = require('./Recordatorio');
const Categoria = require('./Categoria');
const TipoCliente = require('./TipoCliente');
const Proveedor = require('./Proveedor');
const ProveedorContacto = require('./ProveedorContacto');
const Marca = require('./Marca');
const MarcaContacto = require('./MarcaContacto');

// Ejecutivo -> Clientes
Ejecutivo.hasMany(Cliente, { foreignKey: 'ejecutivo_id', as: 'clientes' });
Cliente.belongsTo(Ejecutivo, { foreignKey: 'ejecutivo_id', as: 'ejecutivo' });

// Cliente -> Contactos
Cliente.hasMany(Contacto, { foreignKey: 'cliente_id', as: 'contactos', onDelete: 'CASCADE' });
Contacto.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

// Cliente -> Cotizaciones
Cliente.hasMany(Cotizacion, { foreignKey: 'cliente_id', as: 'cotizaciones' });
Cotizacion.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
Ejecutivo.hasMany(Cotizacion, { foreignKey: 'ejecutivo_id', as: 'cotizaciones' });
Cotizacion.belongsTo(Ejecutivo, { foreignKey: 'ejecutivo_id', as: 'ejecutivo' });
Contacto.hasMany(Cotizacion, { foreignKey: 'contacto_id', as: 'cotizaciones' });
Cotizacion.belongsTo(Contacto, { foreignKey: 'contacto_id', as: 'contacto' });

// Cotizacion -> Items
Cotizacion.hasMany(CotizacionItem, { foreignKey: 'cotizacion_id', as: 'items', onDelete: 'CASCADE' });
CotizacionItem.belongsTo(Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });

// Cotizacion -> Orden
Cotizacion.hasOne(Orden, { foreignKey: 'cotizacion_id', as: 'orden' });
Orden.belongsTo(Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });
Cliente.hasMany(Orden, { foreignKey: 'cliente_id', as: 'ordenes' });
Orden.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
Ejecutivo.hasMany(Orden, { foreignKey: 'ejecutivo_id', as: 'ordenes' });
Orden.belongsTo(Ejecutivo, { foreignKey: 'ejecutivo_id', as: 'ejecutivo' });

// Orden -> Factura
Orden.hasOne(Factura, { foreignKey: 'orden_id', as: 'factura' });
Factura.belongsTo(Orden, { foreignKey: 'orden_id', as: 'orden' });
Cliente.hasMany(Factura, { foreignKey: 'cliente_id', as: 'facturas' });
Factura.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
Ejecutivo.hasMany(Factura, { foreignKey: 'ejecutivo_id', as: 'facturas' });
Factura.belongsTo(Ejecutivo, { foreignKey: 'ejecutivo_id', as: 'ejecutivo' });

// Actividades
Cliente.hasMany(Actividad, { foreignKey: 'cliente_id', as: 'actividades' });
Actividad.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
Ejecutivo.hasMany(Actividad, { foreignKey: 'ejecutivo_id', as: 'actividades' });
Actividad.belongsTo(Ejecutivo, { foreignKey: 'ejecutivo_id', as: 'ejecutivo' });
Contacto.hasMany(Actividad, { foreignKey: 'contacto_id', as: 'actividades' });
Actividad.belongsTo(Contacto, { foreignKey: 'contacto_id', as: 'contacto' });

// Oportunidades
Cliente.hasMany(Oportunidad, { foreignKey: 'cliente_id', as: 'oportunidades' });
Oportunidad.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
Ejecutivo.hasMany(Oportunidad, { foreignKey: 'ejecutivo_id', as: 'oportunidades' });
Oportunidad.belongsTo(Ejecutivo, { foreignKey: 'ejecutivo_id', as: 'ejecutivo' });
Cotizacion.hasOne(Oportunidad, { foreignKey: 'cotizacion_id', as: 'oportunidad' });
Oportunidad.belongsTo(Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });

// Recordatorios
Ejecutivo.hasMany(Recordatorio, { foreignKey: 'ejecutivo_id', as: 'recordatorios' });
Recordatorio.belongsTo(Ejecutivo, { foreignKey: 'ejecutivo_id', as: 'ejecutivo' });
Cliente.hasMany(Recordatorio, { foreignKey: 'cliente_id', as: 'recordatorios' });
Recordatorio.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

// Proveedores -> Contactos
Proveedor.hasMany(ProveedorContacto, { foreignKey: 'proveedor_id', as: 'contactos', onDelete: 'CASCADE' });
ProveedorContacto.belongsTo(Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' });

// Marcas -> Contactos
Marca.hasMany(MarcaContacto, { foreignKey: 'marca_id', as: 'contactos', onDelete: 'CASCADE' });
MarcaContacto.belongsTo(Marca, { foreignKey: 'marca_id', as: 'marca' });

// TipoCliente -> Categorias (constraints:false evita FK a nivel BD con ALTER TABLE)
TipoCliente.hasMany(Categoria, { foreignKey: 'tipo_cliente_id', as: 'categorias', constraints: false });
Categoria.belongsTo(TipoCliente, { foreignKey: 'tipo_cliente_id', as: 'tipo', constraints: false });

module.exports = {
  sequelize,
  Ejecutivo,
  Cliente,
  Contacto,
  Cotizacion,
  CotizacionItem,
  Orden,
  Factura,
  Actividad,
  Oportunidad,
  Recordatorio,
  Categoria,
  TipoCliente,
  Proveedor,
  ProveedorContacto,
  Marca,
  MarcaContacto,
};
