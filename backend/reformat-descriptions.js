/**
 * Reformatea las descripciones de viviendas que se guardaron como un único
 * bloque de texto pegado (import del scraper antes del formateador): párrafos,
 * listas y subtítulos con el mismo formateador que usa ahora el import.
 *
 * Solo toca descripciones "planas" (un único <p> o texto sin etiquetas); las que
 * ya tienen párrafos o listas (del import o editadas en el panel) no se tocan.
 * La descripción corta se regenera solo si salía del principio de la descripción
 * (si se escribió a mano, se respeta).
 *
 * Uso:
 *   node reformat-descriptions.js                 simulación: muestra qué cambiaría
 *   node reformat-descriptions.js --verbose       simulación con el texto completo
 *   node reformat-descriptions.js --id <uuid>     solo esa vivienda
 *   node reformat-descriptions.js --apply         guarda (antes hace copia de seguridad)
 *   node reformat-descriptions.js --restore <fichero.json>   deshace un --apply
 */

import fs from 'fs';
import { executeQuery, executeTransaction } from './src/db/client.js';
import {
  formatDescription,
  extractShortDescription,
  htmlToText,
  isFlatDescription
} from './src/utils/descriptionFormatter.js';

/* eslint-disable no-console */

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const verbose = args.includes('--verbose');
const valueOf = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : null;
};
const onlyId = valueOf('--id');
const restoreFile = valueOf('--restore');

const plain = (s) => (s || '').replace(/[*_]/g, '').replace(/\s+/g, ' ').trim();

/** ¿La descripción corta actual se sacó del principio de la descripción? */
function shortComesFromDescription(shortDescription, oldText) {
  const short = plain(shortDescription).replace(/(\.\.\.|…)$/, '').trim();
  if (!short) return true;
  return plain(oldText).startsWith(short);
}

/** Vista de texto del HTML generado, para revisar en la terminal */
function preview(html) {
  return html
    .replace(/<p><strong>(.*?)<\/strong><\/p>/g, '\n   ## $1')
    .replace(/<\/?ul>/g, '')
    .replace(/<li>(.*?)<\/li>/g, '\n      • $1')
    .replace(/<p>(.*?)<\/p>/g, '\n   $1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/^\n/, '');
}

async function restore(file) {
  const backup = JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log(`♻️  Restaurando ${backup.length} descripciones desde ${file}...`);
  await executeTransaction(backup.map(row => ({
    sql: 'UPDATE Vivienda SET Description = ?, ShortDescription = ? WHERE Id = ?',
    args: [row.description, row.shortDescription, row.id]
  })));
  console.log('✅ Restauración completada');
}

async function run() {
  if (restoreFile) {
    await restore(restoreFile);
    return;
  }

  const { rows } = onlyId
    ? await executeQuery('SELECT Id, Name, Description, ShortDescription, Published FROM Vivienda WHERE Id = ?', [onlyId])
    : await executeQuery('SELECT Id, Name, Description, ShortDescription, Published FROM Vivienda ORDER BY CreatedAt DESC');

  const changes = [];
  let alreadyFormatted = 0;

  for (const row of rows) {
    if (!isFlatDescription(row.Description)) {
      alreadyFormatted++;
      continue;
    }
    const oldText = htmlToText(row.Description);
    const { text, html } = formatDescription(oldText);
    if (!html || html === row.Description) continue;

    const regenerateShort = shortComesFromDescription(row.ShortDescription, oldText);
    const shortDescription = regenerateShort ? extractShortDescription(text) : row.ShortDescription;

    changes.push({ row, html, shortDescription, regenerateShort });
  }

  console.log(`\n📋 ${rows.length} viviendas revisadas · ${changes.length} con descripción a reformatear`
    + ` · ${alreadyFormatted} ya tenían formato (no se tocan)\n`);

  for (const { row, html, shortDescription, regenerateShort } of changes) {
    const blocks = (html.match(/<p>|<ul>/g) || []).length;
    const lists = (html.match(/<ul>/g) || []).length;
    console.log(`• ${row.Name} (${String(row.Id).slice(0, 8)}, ${row.Published ? 'publicada' : 'no publicada'})`);
    console.log(`  1 bloque → ${blocks} bloques, ${lists} lista(s)`);
    console.log(`  Descripción corta: ${regenerateShort ? `regenerada → «${shortDescription}»` : 'se mantiene (escrita a mano)'}`);
    const lines = preview(html).split('\n');
    console.log((verbose ? lines : lines.slice(0, 6)).join('\n'));
    if (!verbose && lines.length > 6) console.log(`   … (${lines.length - 6} líneas más; --verbose para verlo entero)`);
    console.log('');
  }

  if (!apply) {
    console.log('ℹ️  Simulación: no se ha guardado nada. Ejecuta con --apply para guardar.');
    return;
  }
  if (changes.length === 0) {
    console.log('✅ Nada que guardar.');
    return;
  }

  const backupFile = `descriptions-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  fs.writeFileSync(backupFile, JSON.stringify(changes.map(({ row }) => ({
    id: row.Id,
    name: row.Name,
    description: row.Description,
    shortDescription: row.ShortDescription
  })), null, 2));
  console.log(`💾 Copia de seguridad: ${backupFile} (para deshacer: --restore ${backupFile})`);

  // La condición sobre la descripción anterior evita pisar una edición hecha
  // en el panel (o por el import) entre la lectura y la escritura
  const results = await executeTransaction(changes.map(({ row, html, shortDescription }) => ({
    sql: 'UPDATE Vivienda SET Description = ?, ShortDescription = ? WHERE Id = ? AND Description = ?',
    args: [html, shortDescription, row.Id, row.Description]
  })));
  const updated = results.reduce((n, r) => n + (r.rowsAffected || 0), 0);
  console.log(`✅ ${updated} de ${changes.length} descripciones reformateadas`
    + (updated < changes.length ? ' (las demás cambiaron mientras tanto y no se han tocado)' : ''));
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
