import cron from 'node-cron';
import { autoCloseOldSessions, closeDailySessions, cleanupOldSessions } from './cashSession.service';

/**
 * Servicio de tareas programadas (Cron Jobs)
 */

export function initScheduler() {
  console.log('⏰ Inicializando tareas programadas...');

  // Cierre automático de sesiones antiguas (>24h) - Cada 6 horas
  cron.schedule('0 */6 * * *', async () => {
    console.log('🔄 [CRON] Ejecutando cierre automático de sesiones antiguas...');
    try {
      const result = await autoCloseOldSessions();
      console.log(`✅ [CRON] ${result.closed} sesión(es) antigua(s) cerrada(s)`);
    } catch (error) {
      console.error('❌ [CRON] Error en cierre automático:', error);
    }
  });

  // Cierre diario de todas las sesiones - Todos los días a las 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('🌙 [CRON] Ejecutando cierre diario de sesiones...');
    try {
      const result = await closeDailySessions();
      console.log(`✅ [CRON] Cierre diario completado: ${result.closed} sesión(es) cerrada(s)`);
    } catch (error) {
      console.error('❌ [CRON] Error en cierre diario:', error);
    }
  });

  // Limpieza de sesiones antiguas (>30 días) - Todos los domingos a las 3:00 AM
  cron.schedule('0 3 * * 0', async () => {
    console.log('🧹 [CRON] Ejecutando limpieza de sesiones antiguas...');
    try {
      const result = await cleanupOldSessions();
      console.log(`✅ [CRON] ${result.deleted} sesión(es) antigua(s) eliminada(s)`);
    } catch (error) {
      console.error('❌ [CRON] Error en limpieza:', error);
    }
  });

  console.log('✅ Tareas programadas inicializadas:');
  console.log('   - Cierre automático (>24h): Cada 6 horas');
  console.log('   - Cierre diario: Todos los días a las 2:00 AM');
  console.log('   - Limpieza (>30 días): Domingos a las 3:00 AM');
}
