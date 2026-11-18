/**
 * Tiquets: enviament a la teva bústia i resum mensual.
 *
 * Què fa:
 *  - Cada tiquet que envies des de l'app es desa com a PDF al teu Google Drive,
 *    a la carpeta "Tiquets/AAAA-MM", i (si ENVIA_AL_MOMENT és true) t'arriba també per correu al moment.
 *  - El dia 1 de cada mes t'envia un correu amb tots els PDF del mes anterior i el total.
 *  - Des de l'app (roda dentada) pots demanar el resum del mes en curs quan vulguis.
 *
 * Instal·lació:
 *  1. Buida l'editor del tot (Ctrl+A, Suprimeix), enganxa aquest codi i desa. Deixa un sol fitxer al projecte.
 *  2. Canvia SECRET per una clau llarga que només sàpigues tu, i posa a DESTINATARI on vols rebre els tiquets
 *     (buit = el teu compte de Google).
 *  3. A la barra de dalt, tria la funció "configura" i toca Executa. Accepta els permisos.
 *     Això crea l'avís automàtic del dia 1 de cada mes (només cal fer-ho un cop).
 *  4. Implementa > Gestiona les implementacions > llapis > Versió: Versió nova > Implementa.
 *     (Si és la primera vegada: Implementa > Nova implementació > Aplicació web,
 *      Executa com a: Jo · Qui hi té accés: Qualsevol usuari.)
 *  5. Copia l'URL que acaba en /exec i posa-la a l'app, amb la mateixa clau.
 */
var SECRET = 'canvia-aquesta-clau';
var DESTINATARI = '';
var ENVIA_AL_MOMENT = true;   // false = només resum mensual
var CARPETA = 'Tiquets';
var ZONA = 'Europe/Madrid';
var MIDA_MAX_CORREU = 18 * 1024 * 1024;   // Gmail accepta uns 25 MB per correu; deixem marge

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (data.token !== SECRET) return json_({ ok: false, error: 'token' });
    if (data.action === 'summary') {
      var mes = data.month || mesDe_(new Date());
      var r = enviaResum_(mes);
      return json_({ ok: true, to: desti_(), month: mes, count: r.count, total: r.total });
    }
    return json_(desaTiquet_(data));
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json_({ ok: true, message: 'Tiquets: script actiu.' });
}

// Executa-la un cop des de l'editor: crea l'enviament automàtic del dia 1 de cada mes.
function configura() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'resumMensual') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('resumMensual').timeBased().onMonthDay(1).atHour(8).inTimezone(ZONA).create();
  carpetaMes_(mesDe_(new Date()));
  Logger.log('Fet. El resum mensual arribarà el dia 1 a les 8 h a ' + desti_());
}

// L'executa l'avís automàtic el dia 1: resum del mes anterior.
function resumMensual() {
  var ahir = new Date(Date.now() - 2 * 24 * 3600 * 1000);
  enviaResum_(mesDe_(ahir));
}

// ---------- intern ----------

function desaTiquet_(data) {
  var at = data.at ? new Date(data.at) : new Date();
  var nom = data.filename || ('tiquet_' + Utilities.formatDate(at, ZONA, 'yyyy-MM-dd') + '.pdf');
  var blob = Utilities.newBlob(Utilities.base64Decode(data.file), 'application/pdf', nom);
  var info = {
    at: at.toISOString(),
    type: String(data.type || ''),
    amount: String(data.amount || ''),
    note: String(data.note || ''),
    subject: String(data.subject || 'Tiquet').slice(0, 200)
  };
  var fitxer = carpetaMes_(mesDe_(at)).createFile(blob);
  fitxer.setDescription(JSON.stringify(info));
  if (ENVIA_AL_MOMENT) {
    MailApp.sendEmail({
      to: desti_(),
      subject: info.subject,
      body: String(data.body || ''),
      attachments: [blob],
      name: 'Tiquets'
    });
  }
  return { ok: true, to: desti_(), saved: true, mailed: ENVIA_AL_MOMENT };
}

function enviaResum_(mes) {
  var carpeta = carpetaMes_(mes);
  var files = carpeta.getFilesByType('application/pdf');
  var items = [];
  while (files.hasNext()) {
    var f = files.next();
    if (f.isTrashed()) continue;
    var info = {};
    try { info = JSON.parse(f.getDescription() || '{}'); } catch (x) { info = {}; }
    items.push({ file: f, at: info.at ? new Date(info.at) : f.getDateCreated(),
      type: info.type || '', amount: info.amount || '', note: info.note || '' });
  }
  if (!items.length) return { count: 0, total: '0,00' };
  items.sort(function (a, b) { return a.at - b.at; });

  var total = 0;
  var files_ = [];
  var linies = items.map(function (it) {
    var n = parseFloat(String(it.amount).replace(/\./g, '').replace(',', '.'));
    if (!isNaN(n)) total += n;
    return {
      data: Utilities.formatDate(it.at, ZONA, 'dd/MM/yyyy'),
      tipus: it.type || '—',
      import: isNaN(n) ? '—' : euros_(n),
      nota: it.note || ''
    };
  });
  var totalTxt = euros_(total);
  var nomMes = nomMes_(mes);
  var assumpte = 'Tiquets ' + (/^[aeiouàèéíòóú]/.test(nomMes) ? "d'" : 'de ') + nomMes + ' – ' + items.length + ' tiquet' + (items.length === 1 ? '' : 's') + ' – ' + totalTxt;

  var text = assumpte + '\n\n' + linies.map(function (l) {
    return l.data + '  ' + l.tipus + '  ' + l.import + (l.nota ? '  ' + l.nota : '');
  }).join('\n') + '\n\nTotal: ' + totalTxt + '\n\nEls PDF són adjunts i també a Google Drive, carpeta ' + CARPETA + '/' + mes + '.';

  var td = 'style="padding:4px 10px;border-bottom:1px solid #ddd"';
  var html = '<p><b>' + esc_(assumpte) + '</b></p><table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">' +
    '<tr><th ' + td + ' align="left">Data</th><th ' + td + ' align="left">Tipus</th><th ' + td + ' align="right">Import</th><th ' + td + ' align="left">Nota</th></tr>' +
    linies.map(function (l) {
      return '<tr><td ' + td + '>' + l.data + '</td><td ' + td + '>' + esc_(l.tipus) + '</td><td ' + td + ' align="right">' + l.import + '</td><td ' + td + '>' + esc_(l.nota) + '</td></tr>';
    }).join('') +
    '<tr><td ' + td + ' colspan="2"><b>Total</b></td><td ' + td + ' align="right"><b>' + totalTxt + '</b></td><td ' + td + '></td></tr></table>' +
    '<p style="color:#666;font-size:13px">Els PDF són adjunts i també a Google Drive, carpeta <a href="' + carpeta.getUrl() + '">' + CARPETA + '/' + mes + '</a>.</p>';

  // Reparteix els adjunts en diversos correus si en fan massa.
  var grups = [[]], mida = 0;
  items.forEach(function (it) {
    var b = it.file.getBlob();
    var m = b.getBytes().length;
    if (mida + m > MIDA_MAX_CORREU && grups[grups.length - 1].length) { grups.push([]); mida = 0; }
    grups[grups.length - 1].push(b); mida += m;
  });
  grups.forEach(function (adjunts, i) {
    var sufix = grups.length > 1 ? ' (' + (i + 1) + '/' + grups.length + ')' : '';
    MailApp.sendEmail({ to: desti_(), subject: assumpte + sufix, body: text, htmlBody: html, attachments: adjunts, name: 'Tiquets' });
  });
  return { count: items.length, total: totalTxt };
}

function carpetaMes_(mes) {
  var arrels = DriveApp.getFoldersByName(CARPETA);
  var arrel = arrels.hasNext() ? arrels.next() : DriveApp.createFolder(CARPETA);
  var subs = arrel.getFoldersByName(mes);
  return subs.hasNext() ? subs.next() : arrel.createFolder(mes);
}

function mesDe_(d) { return Utilities.formatDate(d, ZONA, 'yyyy-MM'); }

function nomMes_(mes) {
  var noms = ['gener', 'febrer', 'març', 'abril', 'maig', 'juny', 'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre'];
  var p = mes.split('-');
  return noms[parseInt(p[1], 10) - 1] + ' ' + p[0];
}

function euros_(n) {
  var s = n.toFixed(2).split('.');
  return s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + s[1] + ' €';
}

function esc_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function desti_() { return DESTINATARI || Session.getEffectiveUser().getEmail(); }

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
