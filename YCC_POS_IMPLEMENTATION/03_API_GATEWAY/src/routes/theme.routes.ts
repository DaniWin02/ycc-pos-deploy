/**
 * Theme Routes v2.0 - Sistema de temas centralizado
 * Endpoints para gestión de temas en Admin, POS y KDS
 */

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/theme/config
 * Obtiene la configuración completa del sistema de temas
 */
router.get('/config', async (req, res) => {
  try {
    const config = await prisma.themeConfig.findUnique({
      where: { id: 'system-v2' }
    });

    if (!config) {
      // Retornar configuración por defecto si no existe
      return res.json({
        success: true,
        data: null,
        message: 'No theme configuration found, using defaults'
      });
    }

    res.json({
      success: true,
      data: JSON.parse(config.config)
    });
  } catch (error) {
    console.error('❌ [Theme] Error obteniendo configuración:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener configuración de tema'
    });
  }
});

/**
 * POST /api/theme/config
 * Guarda la configuración completa del sistema de temas
 */
router.post('/config', async (req, res) => {
  try {
    const { config } = req.body;

    if (!config) {
      return res.status(400).json({
        success: false,
        error: 'Configuration is required'
      });
    }

    // Validar estructura básica
    if (!config.global || !config.admin || !config.pos || !config.kds) {
      return res.status(400).json({
        success: false,
        error: 'Invalid configuration structure'
      });
    }

    // Guardar o actualizar configuración
    const saved = await prisma.themeConfig.upsert({
      where: { id: 'system-v2' },
      update: {
        config: JSON.stringify(config),
        module: 'system',
        updatedAt: new Date()
      },
      create: {
        id: 'system-v2',
        config: JSON.stringify(config),
        module: 'system'
      }
    });

    console.log('✅ [Theme] Configuración guardada');

    res.json({
      success: true,
      data: JSON.parse(saved.config),
      message: 'Theme configuration saved successfully'
    });
  } catch (error) {
    console.error('❌ [Theme] Error guardando configuración:', error);
    res.status(500).json({
      success: false,
      error: 'Error al guardar configuración de tema'
    });
  }
});

/**
 * POST /api/theme/module/:module
 * Actualiza la configuración de un módulo específico
 */
router.post('/module/:module', async (req, res) => {
  try {
    const { module } = req.params;
    const { config: moduleConfig } = req.body;

    if (!['global', 'admin', 'pos', 'kds'].includes(module)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid module'
      });
    }

    if (!moduleConfig) {
      return res.status(400).json({
        success: false,
        error: 'Module configuration is required'
      });
    }

    // Obtener configuración actual
    const current = await prisma.themeConfig.findUnique({
      where: { id: 'system-v2' }
    });

    let fullConfig;
    if (current) {
      fullConfig = JSON.parse(current.config);
      fullConfig[module] = moduleConfig;
      fullConfig.lastUpdated = new Date();
    } else {
      return res.status(404).json({
        success: false,
        error: 'Theme configuration not found'
      });
    }

    // Actualizar
    const saved = await prisma.themeConfig.update({
      where: { id: 'system-v2' },
      data: {
        config: JSON.stringify(fullConfig),
        updatedAt: new Date()
      }
    });

    // Emitir evento de Socket.IO para sincronización
    const io = req.app.get('io');
    if (io) {
      io.emit('theme:updated', {
        module,
        config: moduleConfig,
        timestamp: new Date(),
        source: 'backend'
      });
      console.log(`🎨 [Theme] Cambio emitido para módulo: ${module}`);
    }

    res.json({
      success: true,
      data: JSON.parse(saved.config),
      message: `Theme configuration updated for ${module}`
    });
  } catch (error) {
    console.error('❌ [Theme] Error actualizando módulo:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar configuración del módulo'
    });
  }
});

/**
 * POST /api/theme/reset
 * Resetea la configuración de temas a valores por defecto
 */
router.post('/reset', async (req, res) => {
  try {
    const { module } = req.body;

    if (module && !['global', 'admin', 'pos', 'kds'].includes(module)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid module'
      });
    }

    if (module) {
      // Resetear solo un módulo
      const current = await prisma.themeConfig.findUnique({
        where: { id: 'system-v2' }
      });

      if (current) {
        const fullConfig = JSON.parse(current.config);
        
        // Configuración por defecto del módulo
        fullConfig[module] = {
          mode: 'light',
          useGlobal: module !== 'global',
          customColors: undefined
        };
        fullConfig.lastUpdated = new Date();

        await prisma.themeConfig.update({
          where: { id: 'system-v2' },
          data: {
            config: JSON.stringify(fullConfig),
            updatedAt: new Date()
          }
        });
      }

      // Emitir evento
      const io = req.app.get('io');
      if (io) {
        io.emit('theme:reset', { module });
      }

      res.json({
        success: true,
        message: `Theme reset for ${module}`
      });
    } else {
      // Resetear todo el sistema
      await prisma.themeConfig.delete({
        where: { id: 'system-v2' }
      }).catch(() => {});

      // Emitir evento
      const io = req.app.get('io');
      if (io) {
        io.emit('theme:reset', { module: 'all' });
      }

      res.json({
        success: true,
        message: 'Theme system reset to defaults'
      });
    }
  } catch (error) {
    console.error('❌ [Theme] Error reseteando tema:', error);
    res.status(500).json({
      success: false,
      error: 'Error al resetear configuración de tema'
    });
  }
});

export default router;
