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
Ejecutivo.hasMany(Cliente, { foreignKey: 'ejecutivo_id', as: 'clientes', onDelete: 'RESTRICT' });
Cliente.belongsTo(Ejecutivo, { foreignKey: 'ejecutivo_id', as: 'ejecutivo' });

// Cliente -> Contactos
Cliente.hasMany(Contacto, { foreignKey: 'cliente_id', as: 'contactos', onDelete: 'CASCADE' });
Contacto.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

// Cliente -> Cotizaciones
Cliente.hasMany(Cotizacion, { foreignKey: 'cliente_id', as: 'cotizaciones', onDelete: 'RESTRICT' });
Cotizacion.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
Ejecutivo.hasMany(Cotizacion, { foreignKey: 'ejecutivo_id', as: 'cotizaciones', onDelete: 'RESTRICT' });
Cotizacion.belongsTo(Ejecutivo, { foreignKey: 'ejecutivo_id', as: 'ejecutivo' });
Contacto.hasMany(Cotizacion, { foreignKey: 'contacto_id', as: 'cotizaciones', onDelete: 'SET NULL' });
Cotizacion.belongsTo(Contacto, { foreignKey: 'contacto_id', as: 'contacto' });

// Cotizacion -> Items
Cotizacion.hasMany(CotizacionItem, { foreignKey: 'cotizacion_id', as: 'items', onDelete: 'CASCADE' });
CotizacionItem.belongsTo(Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });

// Cotizacion -> Orden
Cotizacion.hasOne(Orden, { foreignKey: 'cotizacion_id', as: 'orden', onDelete: 'SET NULL' });
Orden.belongsTo(Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });
Cliente.hasMany(Orden, { foreignKey: 'cliente_id', as: 'ordenes', onDelete: 'RESTRICT' });
Orden.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
Ejecutivo.hasMany(Orden, { foreignKey: 'ejecutivo_id', as: 'ordenes', onDelete: 'RESTRICT' });
Orden.belongsTo(Ejecutivo, { foreignKey: 'ejecutivo_id', as: 'ejecutivo' });

// Orden -> Factura
Orden.hasOne(Factura, { foreignKey: 'orden_id', as: 'factura', onDelete: 'SET NULL' });
Factura.belongsTo(Orden, { foreignKey: 'orden_id', as: 'orden' });
Cliente.hasMany(Factura, { foreignKey: 'cliente_id', as: 'facturas', onDelete: 'RESTRICT' });
Factura.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
Ejecutivo.hasMany(Factura, { foreignKey: 'ejecutivo_id', as: 'facturas', onDelete: 'RESTRICT' });
Factura.belongsTo(Ejecutivo, { foreignKey: 'ejecutivo_id', as: 'ejecutivo' });

// Actividades
Cliente.hasMany(Actividad, { foreignKey: 'cliente_id', as: 'actividades', onDelete: 'CASCADE' });
Actividad.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
Ejecutivo.hasMany(Actividad, { foreignKey: 'ejecutivo_id', as: 'actividades', onDelete: 'RESTRICT' });
Actividad.belongsTo(Ejecutivo, { foreignKey: 'ejecutivo_id', as: 'ejecutivo' });
Contacto.hasMany(Actividad, { foreignKey: 'contacto_id', as: 'actividades', onDelete: 'SET NULL' });
Actividad.belongsTo(Contacto, { foreignKey: 'contacto_id', as: 'contacto' });

// Oportunidades
Cliente.hasMany(Oportunidad, { foreignKey: 'cliente_id', as: 'oportunidades', onDelete: 'RESTRICT' });
Oportunidad.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
Ejecutivo.hasMany(Oportunidad, { foreignKey: 'ejecutivo_id', as: 'oportunidades', onDelete: 'RESTRICT' });
Oportunidad.belongsTo(Ejecutivo, { foreignKey: 'ejecutivo_id', as: 'ejecutivo' });
Cotizacion.hasOne(Oportunidad, { foreignKey: 'cotizacion_id', as: 'oportunidad', onDelete: 'SET NULL' });
Oportunidad.belongsTo(Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });

// Recordatorios
Ejecutivo.hasMany(Recordatorio, { foreignKey: 'ejecutivo_id', as: 'recordatorios', onDelete: 'CASCADE' });
Recordatorio.belongsTo(Ejecutivo, { foreignKey: 'ejecutivo_id', as: 'ejecutivo' });
Cliente.hasMany(Recordatorio, { foreignKey: 'cliente_id', as: 'recordatorios', onDelete: 'SET NULL' });
Recordatorio.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

// Proveedores -> Contactos
Proveedor.hasMany(ProveedorContacto, { foreignKey: 'proveedor_id', as: 'contactos', onDelete: 'CASCADE' });
ProveedorContacto.belongsTo(Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' });

// Marcas -> Contactos
Marca.hasMany(MarcaContacto, { foreignKey: 'marca_id', as: 'contactos', onDelete: 'CASCADE' });
MarcaContacto.belongsTo(Marca, { foreignKey: 'marca_id', as: 'marca' });

// TipoCliente -> Categorias
TipoCliente.hasMany(Categoria, { foreignKey: 'tipo_cliente_id', as: 'categorias', onDelete: 'SET NULL', constraints: false });
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
