const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const { Cotizacion, CotizacionItem, Cliente, Contacto, Ejecutivo } = require('../models');

const EMPRESA_WOW = {
  razonSocial: 'WOW TECHNOLOGIES S.A.C.',
  ruc: '20538392589',
  direccion: 'CAL.1 OESTE NRO. 061 INT. 201 URB. CORPAC LIMA - LIMA - SAN ISIDRO',
  representante: 'LOPEZ BARRENECHEA CESAR AUGUSTO - GERENTE GENERAL',
};

const filtroEjecutivo = (req) =>
  req.user.rol === 'admin' ? {} : { ejecutivo_id: req.user.id };
const MONEDAS_VALIDAS = ['PEN', 'USD'];
const TIPOS_VALIDOS = ['venta', 'alquiler'];

const generarNumero = async () => {
  const year = new Date().getFullYear();
  const last = await Cotizacion.findOne({ order: [['id', 'DESC']] });
  const next = (last ? last.id + 1 : 1).toString().padStart(5, '0');
  return `W${year}-${next}`;
};

const recalcular = async (cotizacion) => {
  const items = await CotizacionItem.findAll({ where: { cotizacion_id: cotizacion.id } });
  const subtotal = items.reduce((s, i) => s + parseFloat(i.subtotal), 0);
  const igv = +(subtotal * 0.18).toFixed(2);
  const monto = +(subtotal + igv).toFixed(2);
  await cotizacion.update({ subtotal: +subtotal.toFixed(2), igv, monto });
};

const formatoFecha = (fecha) => {
  if (!fecha) return '-';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-PE');
};

const formatoMoneda = (monto, moneda = 'PEN') => {
  const symbol = moneda === 'USD' ? '$' : 'S/';
  return `${symbol} ${Number(monto || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const cargarCotizacionConDetalle = async (id) =>
  Cotizacion.findByPk(id, {
    include: [
      { model: CotizacionItem, as: 'items' },
      { model: Cliente, as: 'cliente', attributes: ['id', 'razon_social', 'ruc', 'direccion'] },
      { model: Contacto, as: 'contacto', attributes: ['id', 'nombre', 'cargo', 'correo'] },
      { model: Ejecutivo, as: 'ejecutivo', attributes: ['id', 'nombre', 'apellido', 'email'] },
    ],
  });

const validarAccesoCotizacion = (req, cotizacion) => {
  if (req.user.rol === 'admin') return null;
  if (cotizacion.ejecutivo_id !== req.user.id) {
    return { status: 403, message: 'Sin acceso' };
  }
  return null;
};

const obtenerCotizacionConAcceso = async (req, id) => {
  const cotizacion = await Cotizacion.findByPk(id);
  if (!cotizacion) return { error: { status: 404, message: 'No encontrada' } };
  const acceso = validarAccesoCotizacion(req, cotizacion);
  if (acceso) return { error: acceso };
  return { cotizacion };
};

const generarPdfCotizacion = async (cotizacion, contactoMostrado) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads', 'cotizaciones');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const nombreSeguro = (cotizacion.numero || `COT-${cotizacion.id}`).replace(/[^\w.-]/g, '_');
  const fileName = `${nombreSeguro}.pdf`;
  const filePath = path.join(uploadsDir, fileName);
  const archivoPublico = `/uploads/cotizaciones/${fileName}`;

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 36 });
    const stream = fs.createWriteStream(filePath);
    const COLOR_PRIMARY = '#1f4e78';
    const COLOR_ACCENT = '#0f766e';
    const COLOR_LIGHT = '#eef2f7';
    const COLOR_BORDER = '#d6deea';
    const PAGE_LEFT = 36;
    const PAGE_RIGHT = 559;
    const PAGE_WIDTH = PAGE_RIGHT - PAGE_LEFT;

    doc.pipe(stream);

    const ejecutivoNombre = `${cotizacion.ejecutivo?.nombre || ''} ${cotizacion.ejecutivo?.apellido || ''}`.trim();
    const contactoNombre = contactoMostrado?.nombre || '-';
    const contactoCorreo = contactoMostrado?.correo || '-';
    const contactoCargo = contactoMostrado?.cargo || '-';

    const logoPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'logo.png');
    const drawHeader = () => {
      doc.rect(0, 0, 595, 92).fill(COLOR_PRIMARY);

      if (fs.existsSync(logoPath)) {
        try {
          doc.image(logoPath, PAGE_LEFT, 22, { width: 120 });
        } catch {
          // Ignorar fallo de logo para no bloquear PDF
        }
      }

      doc
        .fillColor('#ffffff')
        .font('Helvetica-Bold')
        .fontSize(19)
        .text('COTIZACION COMERCIAL', 0, 24, { align: 'right' })
        .fontSize(11)
        .font('Helvetica')
        .text(cotizacion.numero || '-', { align: 'right' })
        .text(`Fecha: ${formatoFecha(cotizacion.fecha)}`, { align: 'right' })
        .text(`Vigencia: ${formatoFecha(cotizacion.fecha_vencimiento)}`, { align: 'right' });

      doc.fillColor('#111827');
      doc.y = 108;
    };

    const drawItemsHeader = (y) => {
      doc.rect(PAGE_LEFT, y, PAGE_WIDTH, 22).fill(COLOR_LIGHT);
      doc
        .fillColor(COLOR_PRIMARY)
        .font('Helvetica-Bold')
        .fontSize(9.5)
        .text('Descripcion', PAGE_LEFT + 8, y + 7, { width: 280 })
        .text('Cant.', 332, y + 7, { width: 48, align: 'right' })
        .text('P. Unit.', 386, y + 7, { width: 80, align: 'right' })
        .text('Subtotal', 474, y + 7, { width: 80, align: 'right' });
      doc.fillColor('#111827');
    };

    const ensureSpaceFor = (space) => {
      if (doc.y + space <= 760) return;
      doc.addPage();
      drawHeader();
    };

    drawHeader();

    // Bloques de empresa y cliente
    const infoTop = doc.y;
    doc.roundedRect(PAGE_LEFT, infoTop, 250, 106, 6).fillAndStroke('#ffffff', COLOR_BORDER);
    doc.roundedRect(PAGE_LEFT + 265, infoTop, 258, 106, 6).fillAndStroke('#ffffff', COLOR_BORDER);

    doc
      .fillColor(COLOR_PRIMARY)
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('EMISOR', PAGE_LEFT + 10, infoTop + 9)
      .text('CLIENTE', PAGE_LEFT + 275, infoTop + 9);

    doc
      .fillColor('#1f2937')
      .font('Helvetica')
      .fontSize(9.5)
      .text(EMPRESA_WOW.razonSocial, PAGE_LEFT + 10, infoTop + 28, { width: 235 })
      .text(`RUC: ${EMPRESA_WOW.ruc}`, PAGE_LEFT + 10, infoTop + 42)
      .text(EMPRESA_WOW.direccion, PAGE_LEFT + 10, infoTop + 56, { width: 235 })
      .text(`Representante: ${EMPRESA_WOW.representante}`, PAGE_LEFT + 10, infoTop + 80, { width: 235 })
      .text(cotizacion.cliente?.razon_social || '-', PAGE_LEFT + 275, infoTop + 28, { width: 240 })
      .text(`RUC: ${cotizacion.cliente?.ruc || '-'}`, PAGE_LEFT + 275, infoTop + 42)
      .text(`Direccion: ${cotizacion.cliente?.direccion || '-'}`, PAGE_LEFT + 275, infoTop + 56, { width: 240 });

    doc.y = infoTop + 122;

    // Datos comerciales
    doc.roundedRect(PAGE_LEFT, doc.y, PAGE_WIDTH, 58, 6).fillAndStroke('#ffffff', COLOR_BORDER);
    doc
      .fillColor(COLOR_PRIMARY)
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('DATOS COMERCIALES', PAGE_LEFT + 10, doc.y + 9)
      .fillColor('#1f2937')
      .font('Helvetica')
      .fontSize(9.5)
      .text(`Asesor comercial: ${ejecutivoNombre || '-'}`, PAGE_LEFT + 10, doc.y + 28, { width: 250 })
      .text(`Contacto cliente: ${contactoNombre}`, PAGE_LEFT + 270, doc.y + 28, { width: 250 })
      .text(`Cargo: ${contactoCargo}`, PAGE_LEFT + 270, doc.y + 42, { width: 250 })
      .text(`Correo: ${contactoCorreo}`, PAGE_LEFT + 10, doc.y + 42, { width: 250 });

    doc.y += 74;
    ensureSpaceFor(120);

    // Tabla de items
    drawItemsHeader(doc.y);
    doc.y += 25;
    doc.font('Helvetica').fontSize(9.5).fillColor('#111827');

    for (const item of cotizacion.items || []) {
      ensureSpaceFor(34);
      const rowTop = doc.y;
      const alt = Math.floor((rowTop - 1) / 34) % 2 === 0 ? '#ffffff' : '#f9fbff';
      doc.rect(PAGE_LEFT, rowTop - 2, PAGE_WIDTH, 30).fill(alt);
      doc.fillColor('#111827');

      doc.text(item.descripcion || '-', PAGE_LEFT + 8, rowTop + 6, { width: 280 });
      doc.text(String(item.cantidad ?? '-'), 332, rowTop + 6, { width: 48, align: 'right' });
      doc.text(formatoMoneda(item.precio_unitario, cotizacion.moneda), 386, rowTop + 6, { width: 80, align: 'right' });
      doc.text(formatoMoneda(item.subtotal, cotizacion.moneda), 474, rowTop + 6, { width: 80, align: 'right' });
      doc.y = rowTop + 30;
    }

    // Totales
    ensureSpaceFor(95);
    doc.y += 8;
    doc.roundedRect(356, doc.y, 167, 70, 6).fillAndStroke('#ffffff', COLOR_BORDER);
    doc
      .fillColor('#1f2937')
      .font('Helvetica')
      .fontSize(9.5)
      .text('Subtotal:', 366, doc.y + 11, { width: 70 })
      .text(formatoMoneda(cotizacion.subtotal, cotizacion.moneda), 438, doc.y + 11, { width: 75, align: 'right' })
      .text('IGV (18%):', 366, doc.y + 28, { width: 70 })
      .text(formatoMoneda(cotizacion.igv, cotizacion.moneda), 438, doc.y + 28, { width: 75, align: 'right' })
      .font('Helvetica-Bold')
      .fillColor(COLOR_ACCENT)
      .text('TOTAL:', 366, doc.y + 47, { width: 70 })
      .text(formatoMoneda(cotizacion.monto, cotizacion.moneda), 438, doc.y + 47, { width: 75, align: 'right' });

    if (cotizacion.observaciones) {
      ensureSpaceFor(92);
      doc.y += 85;
      doc.roundedRect(PAGE_LEFT, doc.y, PAGE_WIDTH, 72, 6).fillAndStroke('#ffffff', COLOR_BORDER);
      doc
        .fillColor(COLOR_PRIMARY)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('OBSERVACIONES', PAGE_LEFT + 10, doc.y + 10)
        .fillColor('#374151')
        .font('Helvetica')
        .fontSize(9.5)
        .text(cotizacion.observaciones, PAGE_LEFT + 10, doc.y + 28, { width: PAGE_WIDTH - 20 });
    }

    const footerY = 790;
    doc
      .fontSize(8.5)
      .font('Helvetica')
      .fillColor('#6b7280')
      .text('Documento generado desde CRM WOW - Uso comercial interno.', PAGE_LEFT, footerY, {
        align: 'center',
        width: PAGE_WIDTH,
      });

    doc.end();

    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  await cotizacion.update({ archivo_pdf: archivoPublico });

  return { filePath, fileName, archivoPublico };
};

const listar = async (req, res) => {
  try {
    const cotizaciones = await Cotizacion.findAll({
      where: filtroEjecutivo(req),
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'razon_social'] },
        { model: Contacto, as: 'contacto', attributes: ['id', 'nombre'] },
        { model: Ejecutivo, as: 'ejecutivo', attributes: ['id', 'nombre'] },
      ],
      order: [['fecha', 'DESC']],
    });
    res.json(cotizaciones);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const crear = async (req, res) => {
  try {
    const numero = await generarNumero();
    const tipo = String(req.body.tipo || '').toLowerCase().trim();
    if (!TIPOS_VALIDOS.includes(tipo)) {
      return res.status(400).json({ message: 'El tipo debe ser venta o alquiler' });
    }
    const moneda = (req.body.moneda || 'PEN').toUpperCase();
    if (!MONEDAS_VALIDAS.includes(moneda)) {
      return res.status(400).json({ message: 'La moneda debe ser PEN o USD' });
    }
    const archivo_propuesta_pdf = req.file
      ? `/uploads/cotizaciones/propuestas/${req.file.filename}`
      : null;
    const cotizacion = await Cotizacion.create({
      ...req.body,
      numero,
      tipo,
      moneda,
      archivo_propuesta_pdf,
      ejecutivo_id: req.user.rol === 'admin' ? (req.body.ejecutivo_id || req.user.id) : req.user.id,
    });
    res.status(201).json(cotizacion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const obtener = async (req, res) => {
  try {
    const cotizacion = await cargarCotizacionConDetalle(req.params.id);
    if (!cotizacion) return res.status(404).json({ message: 'No encontrada' });
    const acceso = validarAccesoCotizacion(req, cotizacion);
    if (acceso) return res.status(acceso.status).json({ message: acceso.message });
    const contactoPrincipal = await Contacto.findOne({
      where: {
        cliente_id: cotizacion.cliente_id,
        activo: true,
        contacto_principal: true,
      },
      attributes: ['id', 'nombre', 'cargo', 'correo', 'contacto_principal'],
    });

    const data = cotizacion.toJSON();
    data.contacto_principal = contactoPrincipal || null;

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const descargarPdf = async (req, res) => {
  try {
    const cotizacion = await cargarCotizacionConDetalle(req.params.id);
    if (!cotizacion) return res.status(404).json({ message: 'No encontrada' });
    const acceso = validarAccesoCotizacion(req, cotizacion);
    if (acceso) return res.status(acceso.status).json({ message: acceso.message });

    const contactoPrincipal = await Contacto.findOne({
      where: {
        cliente_id: cotizacion.cliente_id,
        activo: true,
        contacto_principal: true,
      },
      attributes: ['id', 'nombre', 'cargo', 'correo', 'contacto_principal'],
    });
    const contactoMostrado = contactoPrincipal || cotizacion.contacto || null;

    const { filePath, fileName } = await generarPdfCotizacion(cotizacion, contactoMostrado);
    return res.download(filePath, fileName);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const descargarPropuestaPdf = async (req, res) => {
  try {
    const cotizacion = await cargarCotizacionConDetalle(req.params.id);
    if (!cotizacion) return res.status(404).json({ message: 'No encontrada' });
    const acceso = validarAccesoCotizacion(req, cotizacion);
    if (acceso) return res.status(acceso.status).json({ message: acceso.message });

    if (!cotizacion.archivo_propuesta_pdf) {
      return res.status(404).json({ message: 'No hay propuesta económica adjunta' });
    }

    const relative = cotizacion.archivo_propuesta_pdf.replace(/^\/+/, '');
    const filePath = path.join(__dirname, '..', relative);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'El archivo de propuesta no existe en servidor' });
    }
    const fileName = path.basename(filePath);
    return res.download(filePath, fileName);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const enviarPorCorreo = async (req, res) => {
  try {
    const cotizacion = await cargarCotizacionConDetalle(req.params.id);
    if (!cotizacion) return res.status(404).json({ message: 'No encontrada' });
    const acceso = validarAccesoCotizacion(req, cotizacion);
    if (acceso) return res.status(acceso.status).json({ message: acceso.message });

    const contactoPrincipal = await Contacto.findOne({
      where: {
        cliente_id: cotizacion.cliente_id,
        activo: true,
        contacto_principal: true,
      },
      attributes: ['id', 'nombre', 'cargo', 'correo', 'contacto_principal'],
    });
    const contactoMostrado = contactoPrincipal || cotizacion.contacto || null;

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || smtpUser;

    if (!smtpHost || !smtpUser || !smtpPass) {
      return res.status(400).json({
        message: 'Configura SMTP_HOST, SMTP_PORT, SMTP_USER y SMTP_PASS para enviar correos',
      });
    }

    const { to, mensaje } = req.body || {};
    const destinatario = to || contactoMostrado?.correo;
    if (!destinatario) {
      return res.status(400).json({ message: 'No hay correo destino. Indica el campo "to"' });
    }

    const { filePath, fileName } = await generarPdfCotizacion(cotizacion, contactoMostrado);

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const ejecutivoNombre = `${cotizacion.ejecutivo?.nombre || ''} ${cotizacion.ejecutivo?.apellido || ''}`.trim();
    await transporter.sendMail({
      from: smtpFrom,
      to: destinatario,
      subject: `Cotizacion ${cotizacion.numero} - ${EMPRESA_WOW.razonSocial}`,
      html: `
        <p>Estimado cliente,</p>
        <p>Adjuntamos la cotizacion <strong>${cotizacion.numero}</strong> para su revision.</p>
        ${mensaje ? `<p>${mensaje}</p>` : ''}
        <p>Atentamente,<br/>${ejecutivoNombre || 'Equipo Comercial'}<br/>${EMPRESA_WOW.razonSocial}</p>
      `,
      attachments: [
        {
          filename: fileName,
          path: filePath,
        },
      ],
    });

    return res.json({ message: `Correo enviado a ${destinatario}` });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const { cotizacion, error } = await obtenerCotizacionConAcceso(req, req.params.id);
    if (error) return res.status(error.status).json({ message: error.message });
    if (cotizacion.estado !== 'borrador')
      return res.status(400).json({ message: 'Solo se puede editar en estado borrador' });

    const data = { ...req.body };
    if (req.user.rol !== 'admin') delete data.ejecutivo_id;
    if (data.moneda !== undefined) {
      const moneda = String(data.moneda).toUpperCase();
      if (!MONEDAS_VALIDAS.includes(moneda)) {
        return res.status(400).json({ message: 'La moneda debe ser PEN o USD' });
      }
      data.moneda = moneda;
    }
    if (data.tipo !== undefined) {
      const tipo = String(data.tipo).toLowerCase().trim();
      if (!TIPOS_VALIDOS.includes(tipo)) {
        return res.status(400).json({ message: 'El tipo debe ser venta o alquiler' });
      }
      data.tipo = tipo;
    }
    if (req.file) {
      data.archivo_propuesta_pdf = `/uploads/cotizaciones/propuestas/${req.file.filename}`;
    }

    await cotizacion.update(data);
    res.json(cotizacion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const cambiarEstado = async (req, res) => {
  const transiciones = {
    borrador: ['enviado'],
    enviado: ['aprobado', 'rechazado'],
    rechazado: ['borrador'],
    aprobado: [],
  };
  try {
    const { cotizacion, error } = await obtenerCotizacionConAcceso(req, req.params.id);
    if (error) return res.status(error.status).json({ message: error.message });
    const { estado } = req.body;
    if (!transiciones[cotizacion.estado].includes(estado))
      return res.status(400).json({ message: `No se puede pasar de ${cotizacion.estado} a ${estado}` });
    await cotizacion.update({ estado });
    res.json(cotizacion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const { cotizacion, error } = await obtenerCotizacionConAcceso(req, req.params.id);
    if (error) return res.status(error.status).json({ message: error.message });
    await cotizacion.destroy();
    res.json({ message: 'Cotización eliminada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Items
const agregarItem = async (req, res) => {
  try {
    const { cotizacion, error } = await obtenerCotizacionConAcceso(req, req.params.id);
    if (error) return res.status(error.status).json({ message: error.message });

    const { descripcion, cantidad, precio_unitario } = req.body;
    const subtotal = +(cantidad * precio_unitario).toFixed(2);
    const item = await CotizacionItem.create({ cotizacion_id: req.params.id, descripcion, cantidad, precio_unitario, subtotal });
    await recalcular(cotizacion);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const actualizarItem = async (req, res) => {
  try {
    const { cotizacion, error } = await obtenerCotizacionConAcceso(req, req.params.id);
    if (error) return res.status(error.status).json({ message: error.message });

    const item = await CotizacionItem.findOne({
      where: { id: req.params.itemId, cotizacion_id: cotizacion.id },
    });
    if (!item) return res.status(404).json({ message: 'Item no encontrado' });
    const { descripcion, cantidad, precio_unitario } = req.body;
    const subtotal = +(cantidad * precio_unitario).toFixed(2);
    await item.update({ descripcion, cantidad, precio_unitario, subtotal });
    await recalcular(cotizacion);
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const eliminarItem = async (req, res) => {
  try {
    const { cotizacion, error } = await obtenerCotizacionConAcceso(req, req.params.id);
    if (error) return res.status(error.status).json({ message: error.message });

    const item = await CotizacionItem.findOne({
      where: { id: req.params.itemId, cotizacion_id: cotizacion.id },
    });
    if (!item) return res.status(404).json({ message: 'Item no encontrado' });
    await item.destroy();
    await recalcular(cotizacion);
    res.json({ message: 'Item eliminado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  listar,
  crear,
  obtener,
  descargarPdf,
  descargarPropuestaPdf,
  enviarPorCorreo,
  actualizar,
  cambiarEstado,
  eliminar,
  agregarItem,
  actualizarItem,
  eliminarItem,
};
