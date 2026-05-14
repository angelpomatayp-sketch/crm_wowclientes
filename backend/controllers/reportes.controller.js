const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { sequelize, Ejecutivo, Cliente, Cotizacion, CotizacionItem, Orden, Factura } = require('../models');

const filtroEjecutivo = (req) => (req.user.rol === 'admin' ? {} : { ejecutivo_id: req.user.id });

const parseRango = (req) => {
  const { desde, hasta } = req.query;
  if (!desde && !hasta) return null;
  const rango = {};
  if (desde) rango[Op.gte] = desde;
  if (hasta) rango[Op.lte] = hasta;
  return rango;
};

const whereConFecha = (req, campoFecha) => {
  const where = { ...filtroEjecutivo(req) };
  const rango = parseRango(req);
  if (rango) where[campoFecha] = rango;
  return where;
};

const buildCotizacionWhere = (req) => {
  const where = {};
  const { cliente_id, estado, tipo, moneda, ejecutivo_id } = req.query;
  if (req.user.rol !== 'admin') {
    where.ejecutivo_id = req.user.id;
  } else if (ejecutivo_id) {
    where.ejecutivo_id = Number(ejecutivo_id);
  }
  if (cliente_id) where.cliente_id = Number(cliente_id);
  if (estado) where.estado = estado;
  if (tipo) where.tipo = tipo;
  if (moneda) where.moneda = moneda;
  const rango = parseRango(req);
  if (rango) where.fecha = rango;
  return where;
};

const formatCantidad = (value) => {
  if (value === null || value === undefined) return '';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return Number.isInteger(num) ? String(num) : num.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

const buildDescripcionItems = (items = []) =>
  items
    .map((i) => {
      const qty = formatCantidad(i.cantidad);
      const desc = (i.descripcion || '').trim();
      if (!desc && !qty) return '';
      if (!qty) return desc;
      return `${qty} x ${desc}`;
    })
    .filter(Boolean)
    .join('; ');

const cargarCorrelativoCotizaciones = async (req) => {
  const cotizaciones = await Cotizacion.findAll({
    where: buildCotizacionWhere(req),
    include: [
      { model: CotizacionItem, as: 'items', attributes: ['descripcion', 'cantidad'] },
      { model: Cliente, as: 'cliente', attributes: ['id', 'razon_social'] },
      { model: Ejecutivo, as: 'ejecutivo', attributes: ['id', 'nombre', 'apellido'] },
    ],
    order: [['fecha', 'DESC'], ['id', 'DESC']],
  });

  return cotizaciones.map((c) => ({
    correlativo: c.numero || '',
    fecha: c.fecha,
    cliente: c.cliente?.razon_social || '',
    descripcion: buildDescripcionItems(c.items || []),
    ejecutivo: `${c.ejecutivo?.nombre || ''} ${c.ejecutivo?.apellido || ''}`.trim(),
    tipo: c.tipo || '',
    prec_venta: Number(c.subtotal || 0),
    igv: Number(c.igv || 0),
    prec_total: Number(c.monto || 0),
    margen: '',
    util_aprox: '',
    probabilidad: '',
    fecha_cierre: '',
    observaciones: c.observaciones || '',
    moneda: c.moneda || 'PEN',
  }));
};

const resumen = async (req, res) => {
  try {
    const whereClientes = { activo: true, ...filtroEjecutivo(req) };
    const whereCotizaciones = whereConFecha(req, 'fecha');
    const whereOrdenes = whereConFecha(req, 'fecha');
    const whereFacturas = whereConFecha(req, 'fecha');

    const [clientes, cotizaciones, cotizacionesAprobadas, ordenes, facturas, totalFacturado] = await Promise.all([
      Cliente.count({ where: whereClientes }),
      Cotizacion.count({ where: whereCotizaciones }),
      Cotizacion.count({ where: { ...whereCotizaciones, estado: 'aprobado' } }),
      Orden.count({ where: whereOrdenes }),
      Factura.count({ where: whereFacturas }),
      Factura.sum('total', { where: whereFacturas }),
    ]);

    const conversion = cotizaciones > 0 ? Number(((cotizacionesAprobadas / cotizaciones) * 100).toFixed(2)) : 0;

    res.json({
      clientes,
      cotizaciones,
      cotizaciones_aprobadas: cotizacionesAprobadas,
      conversion,
      ordenes,
      facturas,
      total_facturado: Number(totalFacturado || 0),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const ventasPorEjecutivo = async (req, res) => {
  try {
    const where = whereConFecha(req, 'fecha');
    const data = await Factura.findAll({
      where,
      attributes: ['ejecutivo_id', [sequelize.fn('COUNT', sequelize.col('Factura.id')), 'cantidad'], [sequelize.fn('SUM', sequelize.col('Factura.total')), 'total']],
      include: [{ model: Ejecutivo, as: 'ejecutivo', attributes: ['id', 'nombre', 'apellido'] }],
      group: ['ejecutivo_id', 'ejecutivo.id'],
      order: [[sequelize.literal('total'), 'DESC']],
      raw: false,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const cotizacionesPorEstado = async (req, res) => {
  try {
    const where = whereConFecha(req, 'fecha');
    const data = await Cotizacion.findAll({
      where,
      attributes: [
        'estado',
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad'],
        [sequelize.fn('SUM', sequelize.col('monto')), 'total'],
      ],
      group: ['estado'],
      raw: true,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const conversionPorEjecutivo = async (req, res) => {
  try {
    const where = whereConFecha(req, 'fecha');
    const rows = await Cotizacion.findAll({
      where,
      attributes: [
        'ejecutivo_id',
        [sequelize.fn('COUNT', sequelize.col('Cotizacion.id')), 'total_cotizaciones'],
        [sequelize.literal("SUM(CASE WHEN estado = 'aprobado' THEN 1 ELSE 0 END)"), 'aprobadas'],
        [sequelize.literal("SUM(CASE WHEN estado = 'rechazado' THEN 1 ELSE 0 END)"), 'rechazadas'],
      ],
      include: [{ model: Ejecutivo, as: 'ejecutivo', attributes: ['id', 'nombre', 'apellido'] }],
      group: ['ejecutivo_id', 'ejecutivo.id'],
      raw: false,
    });

    const data = rows.map((r) => {
      const total = Number(r.get('total_cotizaciones') || 0);
      const aprobadas = Number(r.get('aprobadas') || 0);
      const rechazadas = Number(r.get('rechazadas') || 0);
      const conversion = total > 0 ? Number(((aprobadas / total) * 100).toFixed(2)) : 0;
      return {
        ejecutivo_id: r.ejecutivo_id,
        ejecutivo: r.ejecutivo,
        total_cotizaciones: total,
        aprobadas,
        rechazadas,
        conversion,
      };
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const flujoMensual = async (req, res) => {
  try {
    const meses = Math.max(3, Math.min(24, Number(req.query.meses || 6)));
    const now = new Date();
    const desde = new Date(now.getFullYear(), now.getMonth() - (meses - 1), 1);
    const hasta = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const whereBase = { ...filtroEjecutivo(req) };
    const whereCot = { ...whereBase, fecha: { [Op.between]: [desde, hasta] } };
    const whereOrd = { ...whereBase, fecha: { [Op.between]: [desde, hasta] } };
    const whereFac = { ...whereBase, fecha: { [Op.between]: [desde, hasta] } };

    const [cotizaciones, ordenes, facturas] = await Promise.all([
      Cotizacion.findAll({
        where: whereCot,
        attributes: [[sequelize.fn('DATE_FORMAT', sequelize.col('fecha'), '%Y-%m'), 'periodo'], [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad']],
        group: ['periodo'],
        raw: true,
      }),
      Orden.findAll({
        where: whereOrd,
        attributes: [[sequelize.fn('DATE_FORMAT', sequelize.col('fecha'), '%Y-%m'), 'periodo'], [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad']],
        group: ['periodo'],
        raw: true,
      }),
      Factura.findAll({
        where: whereFac,
        attributes: [
          [sequelize.fn('DATE_FORMAT', sequelize.col('fecha'), '%Y-%m'), 'periodo'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad'],
          [sequelize.fn('SUM', sequelize.col('total')), 'total'],
        ],
        group: ['periodo'],
        raw: true,
      }),
    ]);

    const idx = {};
    for (let i = 0; i < meses; i += 1) {
      const d = new Date(desde.getFullYear(), desde.getMonth() + i, 1);
      const periodo = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      idx[periodo] = {
        periodo,
        cotizaciones: 0,
        ordenes: 0,
        facturas: 0,
        facturacion_total: 0,
      };
    }

    cotizaciones.forEach((r) => { if (idx[r.periodo]) idx[r.periodo].cotizaciones = Number(r.cantidad || 0); });
    ordenes.forEach((r) => { if (idx[r.periodo]) idx[r.periodo].ordenes = Number(r.cantidad || 0); });
    facturas.forEach((r) => {
      if (idx[r.periodo]) {
        idx[r.periodo].facturas = Number(r.cantidad || 0);
        idx[r.periodo].facturacion_total = Number(r.total || 0);
      }
    });

    res.json(Object.values(idx));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const topClientes = async (req, res) => {
  try {
    const limit = Math.max(3, Math.min(20, Number(req.query.limit || 8)));
    const where = whereConFecha(req, 'fecha');
    const data = await Factura.findAll({
      where,
      attributes: [
        'cliente_id',
        [sequelize.fn('COUNT', sequelize.col('Factura.id')), 'facturas'],
        [sequelize.fn('SUM', sequelize.col('Factura.total')), 'total'],
      ],
      include: [{ model: Cliente, as: 'cliente', attributes: ['id', 'razon_social'] }],
      group: ['cliente_id', 'cliente.id'],
      order: [[sequelize.literal('total'), 'DESC']],
      limit,
      raw: false,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const correlativoCotizaciones = async (req, res) => {
  try {
    const data = await cargarCorrelativoCotizaciones(req);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const correlativoCotizacionesPdf = async (req, res) => {
  try {
    const rows = await cargarCorrelativoCotizaciones(req);
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 24 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="correlativo-cotizaciones.pdf"');
    doc.pipe(res);

    let clienteNombre = '';
    let ejecutivoNombre = '';
    if (req.query.cliente_id) {
      const cliente = await Cliente.findByPk(req.query.cliente_id, { attributes: ['razon_social'] });
      clienteNombre = cliente?.razon_social || '';
    }
    if (req.query.ejecutivo_id) {
      const ejecutivo = await Ejecutivo.findByPk(req.query.ejecutivo_id, { attributes: ['nombre', 'apellido'] });
      ejecutivoNombre = [ejecutivo?.nombre, ejecutivo?.apellido].filter(Boolean).join(' ');
    }

    const logoPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'logo.png');
    const title = 'Correlativo de cotizaciones';
    const hoy = new Date();
    const generado = hoy.toLocaleDateString('es-PE');
    const filtros = [];
    if (req.query.desde) filtros.push(`Desde: ${req.query.desde}`);
    if (req.query.hasta) filtros.push(`Hasta: ${req.query.hasta}`);
    if (req.query.cliente_id) filtros.push(`Cliente: ${clienteNombre || req.query.cliente_id}`);
    if (req.query.ejecutivo_id) filtros.push(`Ejecutivo: ${ejecutivoNombre || req.query.ejecutivo_id}`);
    if (req.query.estado) filtros.push(`Estado: ${req.query.estado}`);
    if (req.query.tipo) filtros.push(`Tipo: ${req.query.tipo}`);
    if (req.query.moneda) filtros.push(`Moneda: ${req.query.moneda}`);
    const filtrosTexto = filtros.length > 0 ? filtros.join(' · ') : 'Sin filtros aplicados';

    const cols = [
      { key: 'correlativo', label: 'Correlativo', width: 74 },
      { key: 'fecha', label: 'Fecha', width: 54 },
      { key: 'cliente', label: 'Cliente', width: 132 },
      { key: 'descripcion', label: 'Descripcion', width: 210 },
      { key: 'ejecutivo', label: 'Ejecutivo', width: 84 },
      { key: 'tipo', label: 'Tipo', width: 40 },
      { key: 'prec_venta', label: 'Prec.\nVta', width: 52, align: 'right' },
      { key: 'igv', label: 'IGV', width: 42, align: 'right' },
      { key: 'prec_total', label: 'Prec.\nTot', width: 54, align: 'right' },
      { key: 'margen', label: 'Margen\n%', width: 46 },
      { key: 'util_aprox', label: 'Util Aprox\nSin IGV', width: 72 },
      { key: 'probabilidad', label: 'Prob.\nCierre', width: 50 },
      { key: 'fecha_cierre', label: 'Fecha\nCierre', width: 56 },
      { key: 'observaciones', label: 'Observaciones', width: 96 },
    ];

    const startX = doc.page.margins.left;
    const maxX = doc.page.width - doc.page.margins.right;
    const tableWidth = cols.reduce((s, c) => s + c.width, 0);
    const scale = tableWidth > (maxX - startX) ? (maxX - startX) / tableWidth : 1;
    cols.forEach((c) => { c.width *= scale; });

    const COLOR_PRIMARY = '#1f4e78';
    const COLOR_LIGHT = '#f8fafc';
    const COLOR_BORDER = '#e5e7eb';
    const COLOR_HEADER = '#0f172a';
    const COLOR_HEADER_TEXT = '#ffffff';
    const rowHeightBase = 20;
    const headerFontSize = 7.1;
    let pageNum = 1;

    const drawHeader = () => {
      doc.rect(0, 0, doc.page.width, 62).fill(COLOR_PRIMARY);
      if (fs.existsSync(logoPath)) {
        try {
          doc.image(logoPath, startX, 14, { height: 34 });
        } catch {
          // Si falla el logo, se omite
        }
      }
      doc
        .fillColor(COLOR_HEADER_TEXT)
        .font('Helvetica-Bold')
        .fontSize(14)
        .text(title, 0, 18, { align: 'center' })
        .fontSize(9)
        .font('Helvetica')
        .text(`Generado: ${generado}`, 0, 36, { align: 'center' });

      doc.fillColor('#111827');
      doc.y = 76;
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#111827').text('Filtros', startX, doc.y);
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#4b5563')
        .text(filtrosTexto, startX, doc.y + 12, { width: maxX - startX });
      doc.moveDown(2.2);
    };

    const drawTableHeader = () => {
      let x = startX;
      const y = doc.y;
      cols.forEach((c) => {
        doc.rect(x, y, c.width, rowHeightBase).fillAndStroke(COLOR_HEADER, COLOR_BORDER);
        doc
          .fillColor(COLOR_HEADER_TEXT)
          .font('Helvetica-Bold')
          .fontSize(headerFontSize)
          .text(c.label, x + 3, y + 3, {
            width: c.width - 6,
            align: c.align || 'left',
            lineGap: 0.5,
          });
        x += c.width;
      });
      doc.y = y + rowHeightBase + 2;
    };

    const drawFooter = () => {
      const y = doc.page.height - doc.page.margins.bottom + 8;
      doc
        .font('Helvetica')
        .fontSize(7)
        .fillColor('#6b7280')
        .text(`Página ${pageNum}`, startX, y, { align: 'left' })
        .text('CRM WOW', startX, y, { align: 'right', width: maxX - startX });
    };

    const drawRow = (row, idx) => {
      const values = cols.map((c) => {
        let v = row[c.key];
        if (c.key === 'fecha' && v) {
          const d = new Date(v);
          v = d.toLocaleDateString('es-PE');
        }
        if (['prec_venta', 'igv', 'prec_total'].includes(c.key)) {
          const symbol = row.moneda === 'USD' ? '$' : 'S/';
          v = `${symbol} ${Number(v || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        return v == null ? '' : String(v);
      });

      const heights = values.map((v, idx) =>
        doc.heightOfString(v, { width: cols[idx].width - 4, align: cols[idx].align || 'left' })
      );
      const rowHeight = Math.max(18, Math.min(40, Math.max(...heights) + 6));
      if (doc.y + rowHeight + 12 > doc.page.height - doc.page.margins.bottom) {
        drawFooter();
        doc.addPage();
        pageNum += 1;
        drawHeader();
        drawTableHeader();
      }
      let x = startX;
      const y = doc.y;
      if (idx % 2 === 0) {
        doc.rect(x, y, maxX - startX, rowHeight).fill(COLOR_LIGHT);
      }
      cols.forEach((c, idx) => {
        doc.rect(x, y, c.width, rowHeight).stroke(COLOR_BORDER);
        doc
          .fillColor('#111827')
          .font('Helvetica')
          .fontSize(7.1)
          .text(values[idx], x + 3, y + 3, { width: c.width - 6, align: c.align || 'left' });
        x += c.width;
      });
      doc.y = y + rowHeight;
    };

    drawHeader();
    drawTableHeader();
    rows.forEach(drawRow);
    drawFooter();

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  resumen,
  ventasPorEjecutivo,
  cotizacionesPorEstado,
  conversionPorEjecutivo,
  flujoMensual,
  topClientes,
  correlativoCotizaciones,
  correlativoCotizacionesPdf,
};
