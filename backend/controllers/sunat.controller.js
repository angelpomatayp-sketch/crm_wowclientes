/**
 * Proxy hacia API pública de consulta RUC (apis.net.pe)
 */
const consultarRuc = async (req, res) => {
  const { ruc } = req.params;

  if (!ruc || ruc.length !== 11 || !/^\d{11}$/.test(ruc)) {
    return res.status(400).json({ message: 'RUC inválido. Debe tener 11 dígitos.' });
  }

  try {
    let data = null;

    // v2 con token si está configurado
    if (process.env.APIS_NET_TOKEN) {
      const r2 = await fetch(`https://api.apis.net.pe/v2/sunat/ruc?numero=${ruc}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${process.env.APIS_NET_TOKEN}`,
        },
      });
      if (r2.ok) data = await r2.json();
    }

    // Fallback: v1 gratuita
    if (!data) {
      const r1 = await fetch(`https://api.apis.net.pe/v1/ruc?numero=${ruc}`, {
        headers: { 'Accept': 'application/json' },
      });
      if (r1.ok) {
        data = await r1.json();
        console.log('[SUNAT v1] raw response:', JSON.stringify(data));
      } else {
        const body = await r1.text();
        console.error(`[SUNAT] v1 status ${r1.status}:`, body);
        return res.status(404).json({ message: 'RUC no encontrado en SUNAT' });
      }
    }

    // La API puede devolver el nombre en distintos campos según versión
    const razonSocial =
      data.razonSocial ||
      data.nombre ||
      data.nombreCompleto ||
      data.name ||
      '';

    const nombreComercial =
      data.nombreComercial ||
      data.nombreFantasia ||
      '';

    const rawDireccion = data.direccion || data.domicilioFiscal || data.domicilio || '';
    const direccion = rawDireccion === '-' ? '' : rawDireccion;

    res.json({
      ruc:              data.numeroDocumento || data.ruc || ruc,
      razon_social:     razonSocial,
      nombre_comercial: nombreComercial,
      direccion:        direccion,
      estado:           data.estado    || '',
      condicion:        data.condicion || '',
      tipo:             data.tipoContribuyente || '',
      departamento:     data.departamento || '',
      provincia:        data.provincia   || '',
      distrito:         data.distrito    || '',
    });
  } catch (err) {
    console.error('[SUNAT] Error:', err.message);
    res.status(503).json({ message: 'No se pudo consultar SUNAT. Verifica la conexión.' });
  }
};

module.exports = { consultarRuc };
