/**
 * Tiquets: enviament directe a la teva bústia.
 *
 * 1. Canvia SECRET per una clau llarga que només sàpigues tu.
 * 2. Opcional: posa a DESTINATARI l'adreça on vols rebre els tiquets (buit = el teu compte de Google).
 * 3. Desa. Implementa > Nova implementació > Aplicació web
 *      Executa com a: Jo  ·  Qui hi té accés: Qualsevol usuari
 * 4. Copia l'URL que acaba en /exec i posa-la a l'app, amb la mateixa clau.
 *
 * Abans d'enganxar, buida l'editor del tot (Ctrl+A, Suprimeix) i deixa un sol fitxer al projecte.
 */
var SECRET = 'canvia-aquesta-clau';
var DESTINATARI = '';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (data.token !== SECRET) return json_({ ok: false, error: 'token' });
    var to = DESTINATARI || Session.getEffectiveUser().getEmail();
    var blob = Utilities.newBlob(Utilities.base64Decode(data.file), 'application/pdf', data.filename || 'tiquet.pdf');
    MailApp.sendEmail({
      to: to,
      subject: String(data.subject || 'Tiquet').slice(0, 200),
      body: String(data.body || ''),
      attachments: [blob],
      name: 'Tiquets'
    });
    return json_({ ok: true, to: to });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json_({ ok: true, message: 'Tiquets: script actiu.' });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
