/**
 * Script para ejecutar la migración de la tabla Agentes
 * Uso: node run-agents-migration.js
 */

import { db } from './src/db/client.js';
import { up } from './src/db/migrations/008_create_agents_table.js';

async function runAgentsMigration() {
  try {
    // eslint-disable-next-line no-console
    console.log('🚀 Ejecutando migración de tabla Agentes...');

    await db.execute('SELECT 1');
    // eslint-disable-next-line no-console
    console.log('✅ Conexión a base de datos verificada');

    await up();

    // eslint-disable-next-line no-console
    console.log('🎉 Migración de Agentes completada exitosamente');

    const agents = await db.execute({ sql: 'SELECT * FROM Agentes', args: [] });
    // eslint-disable-next-line no-console
    console.log('📋 Agentes en la base de datos:');
    agents.rows.forEach(row => {
      // eslint-disable-next-line no-console
      console.log(`  - ${row.Nombre} (activo: ${row.Activo})`);
    });

    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Error ejecutando migración de Agentes:', error);
    process.exit(1);
  }
}

runAgentsMigration();
