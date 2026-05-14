const cron = require('node-cron');
const { Recordatorio, Ejecutivo, Cliente } = require('../models');
const { Op } = require('sequelize');

const iniciarCron = () => {
  // Cada hora revisa recordatorios pendientes
  cron.schedule('0 * * * *', async () => {
    try {
      const pendientes = await Recordatorio.findAll({
        where: {
          fecha: { [Op.lte]: new Date() },
          completado: false,
          notificado: false,
        },
        include: [
          { model: Ejecutivo, as: 'ejecutivo', attributes: ['nombre', 'email'] },
          { model: Cliente, as: 'cliente', attributes: ['razon_social'] },
        ],
      });

      for (const r of pendientes) {
        console.log(`[RECORDATORIO] Ejecutivo: ${r.ejecutivo.nombre} | Cliente: ${r.cliente?.razon_social || '-'} | ${r.descripcion}`);
        await r.update({ notificado: true });
      }

      if (pendientes.length > 0)
        console.log(`[CRON] ${pendientes.length} recordatorio(s) notificados`);
    } catch (err) {
      console.error('[CRON ERROR]', err.message);
    }
  });

  console.log('[CRON] Scheduler de recordatorios iniciado');
};

module.exports = { iniciarCron };
