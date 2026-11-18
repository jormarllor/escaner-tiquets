/**
 * Tiquets — enviament directe a la teva bústia.
 *
 * 1. Canvia SECRET per una paraula llarga que només sàpigues tu.
 * 2. Implementa > Nova implementació > Tipus: Aplicació web
 *      Executa com a: Jo     ·     Qui hi té accés: Qualsevol usuari
 * 3. Copia l'URL que acaba en /exec i posa-la a la configuració de l'app, amb el mateix SECRET.
 *
 * El correu sempre va al propietari d'aquest script (tu): l'app no pot triar un altre destinatari,
 * així ningú no pot fer servir l'URL per enviar correus a tercers.
 */
const SECRET = 'canvia-aquesta-clau';

// Opcional: posa aquí una altra adreça teva (p. ex. la de la feina). Buit = el teu compte de Google.
const DESTINATARI = '';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.token !== SECRET) return json_({ ok: false, error: 'token' });
    const to = DESTINATARI || Session.getEffectiveUser().getEmail();
    const blob = Utilities.newBlob(Utilities.base64Decode(data.file), data.mime || 'application/pdf', data.filename || 'tiquet.pdf');
    MailApp.sendEmail({
      to: to,
      subject: String(data.subject || 'Tiquet').slice(0, 200),
      body: String(data.body || ''),
      attachments: [blob],
      name: 'Tiquets'
    });
    return json_({ ok: true, to: to });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

function doGet() {
  return json_({ ok: true, message: 'Tiquets: script actiu.' });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
