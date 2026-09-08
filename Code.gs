const CONFIG = {
  SHEET_NAME: 'Pedidos',
  DRIVE_FOLDER_ID: 'PEGAR_AQUI_ID_CARPETA_DRIVE',
  ADMIN_KEY: 'CAMBIAR_ESTA_CLAVE'
};

function doGet(e) {
  try {
    const accion = String((e && e.parameter && e.parameter.accion) || '');
    if (accion === 'listar_pedidos') return json(listarPedidos_(e.parameter.key));
    return json({ ok: true, servicio: 'Camisetas Copa Integración 2026' });
  } catch (err) {
    return json({ ok: false, error: err.message });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (data.accion === 'nuevo_pedido') return json(nuevoPedido_(data));
    return json({ ok: false, error: 'Acción no válida' });
  } catch (err) {
    return json({ ok: false, error: err.message });
  }
}

function nuevoPedido_(d) {
  const nombre = clean_(d.nombre);
  const apellido = clean_(d.apellido);
  const items = Array.isArray(d.items) ? d.items.filter(x => Number(x.cantidad) > 0) : [];
  if (!nombre || !apellido) throw new Error('Nombre y apellido son obligatorios.');
  if (!items.length) throw new Error('Debe seleccionar al menos una camiseta.');
  if (!d.archivo || !d.archivo.base64) throw new Error('Debe adjuntar el comprobante.');

  const allowed = ['application/pdf','image/jpeg','image/png','image/webp'];
  if (!allowed.includes(String(d.archivo.tipo || ''))) throw new Error('Formato de comprobante no permitido.');

  const total = items.reduce((s,x)=>s + Math.max(0, Number(x.cantidad)||0), 0);
  const codigo = 'CI-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/Montevideo', 'yyyyMMdd-HHmmss') + '-' + Math.floor(100 + Math.random()*900);
  const bytes = Utilities.base64Decode(d.archivo.base64);
  const safeName = codigo + '-' + String(d.archivo.nombre || 'comprobante').replace(/[^a-zA-Z0-9._-]/g,'_');
  const blob = Utilities.newBlob(bytes, d.archivo.tipo, safeName);
  const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  const file = folder.createFile(blob);

  const sh = getSheet_();
  sh.appendRow([
    new Date(), codigo, nombre, apellido, JSON.stringify(items), total,
    file.getUrl(), file.getId(), d.archivo.nombre || '', d.archivo.tipo || ''
  ]);

  return { ok: true, codigo };
}

function listarPedidos_(key) {
  if (String(key || '') !== String(CONFIG.ADMIN_KEY)) throw new Error('Clave de administrador incorrecta.');
  const sh = getSheet_();
  const values = sh.getDataRange().getValues();
  if (values.length <= 1) return { ok: true, pedidos: [] };
  const pedidos = values.slice(1).reverse().map(r => ({
    fecha: r[0] instanceof Date ? Utilities.formatDate(r[0], Session.getScriptTimeZone() || 'America/Montevideo','dd/MM/yyyy HH:mm') : String(r[0] || ''),
    codigo: String(r[1] || ''),
    nombre: String(r[2] || ''),
    apellido: String(r[3] || ''),
    items: parseJson_(r[4], []),
    total: Number(r[5] || 0),
    comprobanteUrl: String(r[6] || '')
  }));
  return { ok: true, pedidos };
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sh) sh = ss.insertSheet(CONFIG.SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(['Fecha','Código','Nombre','Apellido','Items','Total','Comprobante URL','Comprobante ID','Archivo original','MIME']);
    sh.setFrozenRows(1);
  }
  return sh;
}

function clean_(s) { return String(s == null ? '' : s).trim().slice(0,120); }
function parseJson_(s, fallback) { try { return JSON.parse(String(s || '')); } catch (_) { return fallback; } }
function json(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
