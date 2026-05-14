'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const addIndex = async (table, fields, name) => {
      try {
        await queryInterface.addIndex(table, fields, { name });
      } catch {
        // Índice ya existe — ignorar
      }
    };

    const addFk = async (table, field, refTable, name) => {
      try {
        await queryInterface.addConstraint(table, {
          fields: [field],
          type: 'foreign key',
          name,
          references: { table: refTable, field: 'id' },
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
        });
      } catch {
        // FK ya existe — ignorar
      }
    };

    // ── Indexes ──────────────────────────────────────────────
    await addIndex('clientes',      ['ejecutivo_id'],  'idx_clientes_ejecutivo_id');
    await addIndex('clientes',      ['estado_cliente'],'idx_clientes_estado');
    await addIndex('clientes',      ['activo'],        'idx_clientes_activo');

    await addIndex('contactos',     ['cliente_id'],    'idx_contactos_cliente_id');
    await addIndex('contactos',     ['activo'],        'idx_contactos_activo');

    await addIndex('cotizaciones',  ['cliente_id'],    'idx_cotizaciones_cliente_id');
    await addIndex('cotizaciones',  ['ejecutivo_id'],  'idx_cotizaciones_ejecutivo_id');
    await addIndex('cotizaciones',  ['contacto_id'],   'idx_cotizaciones_contacto_id');
    await addIndex('cotizaciones',  ['estado'],        'idx_cotizaciones_estado');

    await addIndex('ordenes',       ['cliente_id'],    'idx_ordenes_cliente_id');
    await addIndex('ordenes',       ['ejecutivo_id'],  'idx_ordenes_ejecutivo_id');
    await addIndex('ordenes',       ['cotizacion_id'], 'idx_ordenes_cotizacion_id');

    await addIndex('facturas',      ['cliente_id'],    'idx_facturas_cliente_id');
    await addIndex('facturas',      ['ejecutivo_id'],  'idx_facturas_ejecutivo_id');
    await addIndex('facturas',      ['orden_id'],      'idx_facturas_orden_id');

    await addIndex('actividades',   ['cliente_id'],    'idx_actividades_cliente_id');
    await addIndex('actividades',   ['ejecutivo_id'],  'idx_actividades_ejecutivo_id');
    await addIndex('actividades',   ['contacto_id'],   'idx_actividades_contacto_id');
    await addIndex('actividades',   ['fecha'],         'idx_actividades_fecha');

    await addIndex('oportunidades', ['cliente_id'],    'idx_oportunidades_cliente_id');
    await addIndex('oportunidades', ['ejecutivo_id'],  'idx_oportunidades_ejecutivo_id');
    await addIndex('oportunidades', ['cotizacion_id'], 'idx_oportunidades_cotizacion_id');
    await addIndex('oportunidades', ['etapa'],         'idx_oportunidades_etapa');

    await addIndex('recordatorios', ['ejecutivo_id'],  'idx_recordatorios_ejecutivo_id');
    await addIndex('recordatorios', ['cliente_id'],    'idx_recordatorios_cliente_id');
    await addIndex('recordatorios', ['completado'],    'idx_recordatorios_completado');

    await addIndex('proveedores',   ['activo'],        'idx_proveedores_activo');
    await addIndex('marcas',        ['activo'],        'idx_marcas_activo');

    // ── FK Constraints ───────────────────────────────────────
    await addFk('clientes',      'ejecutivo_id',  'ejecutivos', 'fk_clientes_ejecutivo');
    await addFk('contactos',     'cliente_id',    'clientes',   'fk_contactos_cliente');
    await addFk('cotizaciones',  'cliente_id',    'clientes',   'fk_cotizaciones_cliente');
    await addFk('cotizaciones',  'ejecutivo_id',  'ejecutivos', 'fk_cotizaciones_ejecutivo');
    await addFk('ordenes',       'cliente_id',    'clientes',   'fk_ordenes_cliente');
    await addFk('ordenes',       'ejecutivo_id',  'ejecutivos', 'fk_ordenes_ejecutivo');
    await addFk('facturas',      'cliente_id',    'clientes',   'fk_facturas_cliente');
    await addFk('facturas',      'ejecutivo_id',  'ejecutivos', 'fk_facturas_ejecutivo');
    await addFk('actividades',   'cliente_id',    'clientes',   'fk_actividades_cliente');
    await addFk('actividades',   'ejecutivo_id',  'ejecutivos', 'fk_actividades_ejecutivo');
    await addFk('oportunidades', 'cliente_id',    'clientes',   'fk_oportunidades_cliente');
    await addFk('oportunidades', 'ejecutivo_id',  'ejecutivos', 'fk_oportunidades_ejecutivo');
    await addFk('recordatorios', 'ejecutivo_id',  'ejecutivos', 'fk_recordatorios_ejecutivo');
  },

  async down(queryInterface) {
    const names = [
      'idx_clientes_ejecutivo_id','idx_clientes_estado','idx_clientes_activo',
      'idx_contactos_cliente_id','idx_contactos_activo',
      'idx_cotizaciones_cliente_id','idx_cotizaciones_ejecutivo_id',
      'idx_cotizaciones_contacto_id','idx_cotizaciones_estado',
      'idx_ordenes_cliente_id','idx_ordenes_ejecutivo_id','idx_ordenes_cotizacion_id',
      'idx_facturas_cliente_id','idx_facturas_ejecutivo_id','idx_facturas_orden_id',
      'idx_actividades_cliente_id','idx_actividades_ejecutivo_id',
      'idx_actividades_contacto_id','idx_actividades_fecha',
      'idx_oportunidades_cliente_id','idx_oportunidades_ejecutivo_id',
      'idx_oportunidades_cotizacion_id','idx_oportunidades_etapa',
      'idx_recordatorios_ejecutivo_id','idx_recordatorios_cliente_id',
      'idx_recordatorios_completado','idx_proveedores_activo','idx_marcas_activo',
    ];
    const fks = [
      ['clientes','fk_clientes_ejecutivo'],['contactos','fk_contactos_cliente'],
      ['cotizaciones','fk_cotizaciones_cliente'],['cotizaciones','fk_cotizaciones_ejecutivo'],
      ['ordenes','fk_ordenes_cliente'],['ordenes','fk_ordenes_ejecutivo'],
      ['facturas','fk_facturas_cliente'],['facturas','fk_facturas_ejecutivo'],
      ['actividades','fk_actividades_cliente'],['actividades','fk_actividades_ejecutivo'],
      ['oportunidades','fk_oportunidades_cliente'],['oportunidades','fk_oportunidades_ejecutivo'],
      ['recordatorios','fk_recordatorios_ejecutivo'],
    ];
    for (const [table, name] of fks) {
      try { await queryInterface.removeConstraint(table, name); } catch {}
    }
    for (const name of names) {
      try { await queryInterface.removeIndex(name.split('_')[1] + 's', name); } catch {}
    }
  },
};
