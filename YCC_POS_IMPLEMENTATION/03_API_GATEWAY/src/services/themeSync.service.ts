/**
 * Servicio de Sincronización de Temas vía WebSocket
 * Propaga cambios de apariencia a todos los módulos conectados
 */

import { Server } from 'socket.io';

export interface ThemeChangePayload {
  module: 'global' | 'admin' | 'pos' | 'kds';
  tokens: Record<string, string>;
  typography?: Record<string, any>;
  isDark: boolean;
  timestamp: number;
  changedBy: string;
}

export interface ThemeSyncState {
  global: ThemeChangePayload | null;
  admin: ThemeChangePayload | null;
  pos: ThemeChangePayload | null;
  kds: ThemeChangePayload | null;
}

class ThemeSyncService {
  private io: Server | null = null;
  private state: ThemeSyncState = {
    global: null,
    admin: null,
    pos: null,
    kds: null,
  };

  initialize(io: Server) {
    this.io = io;
    this.setupEventHandlers();
    console.log('🎨 ThemeSync Service initialized');
  }

  private setupEventHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      // Enviar estado actual al cliente conectado
      socket.emit('theme:current-state', this.state);

      // Escuchar cambios de tema desde cualquier módulo
      socket.on('theme:update', (payload: ThemeChangePayload) => {
        this.handleThemeUpdate(payload, socket);
      });

      // Solicitar tema específico
      socket.on('theme:request', (module: string) => {
        const theme = this.state[module as keyof ThemeSyncState];
        if (theme) {
          socket.emit('theme:update', theme);
        }
      });

      // Sincronización completa
      socket.on('theme:sync-all', () => {
        socket.emit('theme:current-state', this.state);
      });
    });
  }

  private handleThemeUpdate(payload: ThemeChangePayload, sourceSocket: any) {
    const { module } = payload;
    
    // Actualizar estado interno
    this.state[module as keyof ThemeSyncState] = payload;
    
    // Propagar a todos los clientes excepto el origen
    this.broadcastToModule(module, payload, sourceSocket);
    
    // Si es global, propagar a todos los módulos
    if (module === 'global') {
      this.broadcastToAll(payload, sourceSocket);
    }

    console.log(`🎨 Theme updated [${module}] at ${new Date(payload.timestamp).toLocaleTimeString()}`);
  }

  private broadcastToModule(
    module: string, 
    payload: ThemeChangePayload, 
    excludeSocket: any
  ) {
    if (!this.io) return;

    // Enviar a todos los sockets del módulo específico
    this.io.to(`module-${module}`).emit('theme:update', payload);
    
    // También enviar a los que escuchan 'all'
    this.io.to('theme-listeners').emit('theme:update', payload);
  }

  private broadcastToAll(payload: ThemeChangePayload, excludeSocket: any) {
    if (!this.io) return;

    // Enviar a todos excepto el origen
    excludeSocket.broadcast.emit('theme:update', payload);
  }

  // Método API para actualizar tema desde REST
  updateThemeFromAPI(payload: ThemeChangePayload) {
    this.state[payload.module as keyof ThemeSyncState] = payload;
    
    if (this.io) {
      this.io.emit('theme:update', payload);
    }
  }

  // Obtener estado actual
  getCurrentState(): ThemeSyncState {
    return { ...this.state };
  }

  // Resetear estado
  resetState() {
    this.state = {
      global: null,
      admin: null,
      pos: null,
      kds: null,
    };
    
    if (this.io) {
      this.io.emit('theme:reset');
    }
  }
}

export const themeSyncService = new ThemeSyncService();
