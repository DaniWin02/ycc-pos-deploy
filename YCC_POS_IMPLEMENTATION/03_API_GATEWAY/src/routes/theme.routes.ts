import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Obtener configuración de tema actual
router.get('/config', async (req, res) => {
  try {
    // Buscar la configuración más reciente
    const config = await prisma.themeConfig.findFirst({
      orderBy: { updatedAt: 'desc' }
    });

    if (!config) {
      return res.json({
        success: true,
        data: null,
        message: 'No theme configuration found'
      });
    }

    res.json({
      success: true,
      data: JSON.parse(config.config)
    });
  } catch (error) {
    console.error('❌ Error al obtener configuración de tema:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener configuración de tema'
    });
  }
});

// Guardar configuración de tema
router.post('/config', async (req, res) => {
  try {
    const { config, module } = req.body;

    if (!config) {
      return res.status(400).json({
        success: false,
        error: 'Configuration is required'
      });
    }

    // Guardar o actualizar configuración
    const saved = await prisma.themeConfig.upsert({
      where: { id: config.id || 'default' },
      update: {
        config: JSON.stringify(config),
        module: module || 'global',
        updatedAt: new Date()
      },
      create: {
        id: config.id || 'default',
        config: JSON.stringify(config),
        module: module || 'global'
      }
    });

    // Emitir evento de Socket.IO para sincronización en tiempo real
    if (req.app.get('io')) {
      req.app.get('io').emit('theme:updated', {
        module,
        config: JSON.parse(saved.config)
      });
    }

    res.json({
      success: true,
      data: JSON.parse(saved.config),
      message: 'Theme configuration saved successfully'
    });
  } catch (error) {
    console.error('❌ Error al guardar configuración de tema:', error);
    res.status(500).json({
      success: false,
      error: 'Error al guardar configuración de tema'
    });
  }
});

// Resetear tema a valores por defecto
router.post('/reset', async (req, res) => {
  try {
    const { module } = req.body;

    await prisma.themeConfig.deleteMany({
      where: module ? { module } : {}
    });

    // Emitir evento de Socket.IO
    if (req.app.get('io')) {
      req.app.get('io').emit('theme:reset', { module });
    }

    res.json({
      success: true,
      message: 'Theme configuration reset successfully'
    });
  } catch (error) {
    console.error('❌ Error al resetear configuración de tema:', error);
    res.status(500).json({
      success: false,
      error: 'Error al resetear configuración de tema'
    });
  }
});

export default router;
