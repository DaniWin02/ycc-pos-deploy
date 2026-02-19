# Implementación de Autenticación - Country Club POS

## 1. Arquitectura de Autenticación

### 1.1 Componentes del Sistema
```mermaid
graph TB
    Client[Cliente POS] --> Gateway[API Gateway]
    Gateway --> AuthService[Servicio de Autenticación]
    AuthService --> UserDB[(Base de Datos Usuarios)]
    AuthService --> Redis[(Redis - Sesiones)]
    AuthService --> AuditLog[(Log de Auditoría)]
    
    Gateway --> POSAPI[API del POS]
    POSAPI --> PermissionService[Servicio de Permisos]
    PermissionService --> Redis
    
    subgraph "Capa de Seguridad"
        JWT[JWT Tokens]
        RateLimit[Rate Limiting]
        CSRF[CSRF Protection]
        CORS[CORS Policy]
    end
```

### 1.2 Flujo de Autenticación Completo
```mermaid
sequenceDiagram
    participant C as Cliente POS
    participant G as API Gateway
    participant A as AuthService
    participant D as Database
    participant R as Redis
    participant P as PermissionService
    
    Note over C,P: 1. Login Inicial
    C->>G: POST /auth/login
    G->>A: Validar credenciales
    A->>D: Verificar usuario
    D-->>A: Datos usuario + hash contraseña
    A->>A: Verificar contraseña (bcrypt)
    A->>R: Invalidar sesiones previas
    A->>A: Generar access + refresh tokens
    A->>R: Almacenar refresh token
    A-->>G: Tokens + datos usuario
    G-->>C: Response con tokens
    
    Note over C,P: 2. Request Autenticado
    C->>G: Request con Authorization header
    G->>A: Validar JWT
    A->>R: Verificar sesión activa
    A-->>G: Token válido + usuario
    G->>P: Obtener permisos usuario
    P->>R: Cargar permisos (con cache)
    P-->>G: Permisos usuario
    G-->>C: Response autorizada
    
    Note over C,P: 3. Refresh Token
    C->>G: POST /auth/refresh
    G->>A: Validar refresh token
    A->>R: Verificar refresh token
    A->>A: Generar nuevo access token
    A-->>G: Nuevo access token
    G-->>C: Response con nuevo token
```

## 2. Implementación del Servicio de Autenticación

### 2.1 Configuración de JWT
```typescript
// src/auth/config/jwt.config.ts
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export interface JWTPayload {
  sub: string;        // User ID
  username: string;
  role: string;
  permissions: string[];
  sessionId: string;
  iat?: number;
  exp?: number;
  iss: string;
  aud: string;
}

export class JWTService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly issuer: string;
  private readonly audience: string;
  
  constructor() {
    this.accessSecret = process.env.JWT_ACCESS_SECRET!;
    this.refreshSecret = process.env.JWT_REFRESH_SECRET!;
    this.issuer = 'countryclub-pos';
    this.audience = 'countryclub-users';
    
    this.validateSecrets();
  }
  
  private validateSecrets() {
    if (!this.accessSecret || this.accessSecret.length < 32) {
      throw new Error('JWT_ACCESS_SECRET must be at least 32 characters');
    }
    if (!this.refreshSecret || this.refreshSecret.length < 32) {
      throw new Error('JWT_REFRESH_SECRET must be at least 32 characters');
    }
  }
  
  generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: '15m',
      issuer: this.issuer,
      audience: this.audience,
      algorithm: 'HS256',
      jwtid: crypto.randomUUID()
    });
  }
  
  generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: '7d',
      issuer: this.issuer,
      audience: this.audience,
      algorithm: 'HS256',
      jwtid: crypto.randomUUID()
    });
  }
  
  verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.accessSecret, {
        issuer: this.issuer,
        audience: this.audience,
        algorithms: ['HS256']
      }) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      }
      throw error;
    }
  }
  
  verifyRefreshToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.refreshSecret, {
        issuer: this.issuer,
        audience: this.audience,
        algorithms: ['HS256']
      }) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      }
      throw error;
    }
  }
}
```

### 2.2 Servicio de Usuarios
```typescript
// src/auth/services/user.service.ts
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { User, Role } from '@prisma/client';

export class UserService {
  constructor(private prisma: PrismaClient) {}
  
  async findByUsername(username: string): Promise<(User & { roles: Role[] }) | null> {
    return await this.prisma.user.findUnique({
      where: { username, active: true },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });
  }
  
  async validatePassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.passwordHash);
  }
  
  async updateLastLogin(userId: string, ip: string, userAgent: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date()
      }
    });
    
    // Registrar en auditoría
    await this.auditLogger.info({
      action: 'USER_LOGIN',
      userId,
      metadata: { ip, userAgent }
    });
  }
  
  async createPasswordHash(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }
  
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const isValidOldPassword = await this.validatePassword(user, oldPassword);
    if (!isValidOldPassword) {
      throw new Error('Invalid old password');
    }
    
    const newPasswordHash = await this.createPasswordHash(newPassword);
    
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date()
      }
    });
    
    // Invalidar todas las sesiones existentes
    await this.sessionService.revokeAllSessions(userId);
  }
}
```

### 2.3 Servicio de Sesiones
```typescript
// src/auth/services/session.service.ts
import Redis from 'ioredis';
import crypto from 'crypto';

export interface SessionInfo {
  userId: string;
  username: string;
  role: string;
  deviceId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastUsed: Date;
}

export interface DeviceInfo {
  fingerprint: string;
  platform: string;
  browser: string;
  os: string;
  isMobile: boolean;
}

export class SessionService {
  constructor(private redis: Redis) {}
  
  async createSession(
    userId: string,
    username: string,
    role: string,
    deviceInfo: DeviceInfo,
    ipAddress: string,
    userAgent: string
  ): Promise<string> {
    const sessionId = crypto.randomUUID();
    const sessionKey = `session:${sessionId}`;
    const userSessionsKey = `user_sessions:${userId}`;
    
    const sessionInfo: SessionInfo = {
      userId,
      username,
      role,
      deviceId: deviceInfo.fingerprint,
      deviceInfo,
      ipAddress,
      userAgent,
      createdAt: new Date(),
      lastUsed: new Date()
    };
    
    // Almacenar sesión
    await this.redis.setex(
      sessionKey,
      7 * 24 * 60 * 60, // 7 días
      JSON.stringify(sessionInfo)
    );
    
    // Agregar a lista de sesiones del usuario
    await this.redis.sadd(userSessionsKey, sessionId);
    await this.redis.expire(userSessionsKey, 7 * 24 * 60 * 60);
    
    return sessionId;
  }
  
  async getSession(sessionId: string): Promise<SessionInfo | null> {
    const sessionKey = `session:${sessionId}`;
    const sessionData = await this.redis.get(sessionKey);
    
    if (!sessionData) {
      return null;
    }
    
    const session = JSON.parse(sessionData) as SessionInfo;
    
    // Actualizar último uso
    session.lastUsed = new Date();
    await this.redis.setex(
      sessionKey,
      7 * 24 * 60 * 60,
      JSON.stringify(session)
    );
    
    return session;
  }
  
  async revokeSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      const userSessionsKey = `user_sessions:${session.userId}`;
      await this.redis.del(`session:${sessionId}`);
      await this.redis.srem(userSessionsKey, sessionId);
    }
  }
  
  async revokeAllSessions(userId: string): Promise<void> {
    const userSessionsKey = `user_sessions:${userId}`;
    const sessionIds = await this.redis.smembers(userSessionsKey);
    
    if (sessionIds.length > 0) {
      const sessionKeys = sessionIds.map(id => `session:${id}`);
      await this.redis.del(...sessionKeys);
    }
    
    await this.redis.del(userSessionsKey);
  }
  
  async getUserSessions(userId: string): Promise<SessionInfo[]> {
    const userSessionsKey = `user_sessions:${userId}`;
    const sessionIds = await this.redis.smembers(userSessionsKey);
    
    const sessions: SessionInfo[] = [];
    for (const sessionId of sessionIds) {
      const session = await this.getSession(sessionId);
      if (session) {
        sessions.push(session);
      }
    }
    
    return sessions;
  }
  
  async detectAnomalousSession(
    userId: string,
    currentDeviceInfo: DeviceInfo,
    ipAddress: string
  ): Promise<{ suspicious: boolean; reasons: string[] }> {
    const sessions = await this.getUserSessions(userId);
    const reasons: string[] = [];
    
    if (sessions.length === 0) {
      return { suspicious: false, reasons: [] };
    }
    
    // Verificar dispositivo conocido
    const knownDevices = sessions.map(s => s.deviceInfo.fingerprint);
    if (!knownDevices.includes(currentDeviceInfo.fingerprint)) {
      reasons.push('New device detected');
    }
    
    // Verificar ubicación inusual
    const knownIPs = sessions.map(s => s.ipAddress);
    if (!knownIPs.includes(ipAddress)) {
      reasons.push('New IP address detected');
    }
    
    // Verificar patrón de tiempo inusual
    const now = new Date();
    const recentSessions = sessions.filter(s => {
      const hoursDiff = (now.getTime() - s.lastUsed.getTime()) / (1000 * 60 * 60);
      return hoursDiff < 24;
    });
    
    if (recentSessions.length === 0) {
      reasons.push('Unusual login time');
    }
    
    return {
      suspicious: reasons.length > 0,
      reasons
    };
  }
}
```

### 2.4 Controlador de Autenticación
```typescript
// src/auth/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { SessionService } from '../services/session.service';
import { AuditLogger } from '../services/audit.service';
import { RateLimitService } from '../services/rate-limit.service';

export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private sessionService: SessionService,
    private auditLogger: AuditLogger,
    private rateLimitService: RateLimitService
  ) {}
  
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password, terminal_id } = req.body;
      
      // Validar entrada
      if (!username || !password || !terminal_id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Username, password, and terminal_id are required'
          }
        });
        return;
      }
      
      // Rate limiting
      const rateLimitResult = await this.rateLimitService.checkLoginRate(
        req.ip,
        username
      );
      
      if (!rateLimitResult.allowed) {
        res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many login attempts. Please try again later.',
            retryAfter: rateLimitResult.retryAfter
          }
        });
        return;
      }
      
      // Buscar usuario
      const userWithRoles = await this.userService.findByUsername(username);
      if (!userWithRoles) {
        await this.rateLimitService.recordFailedLogin(req.ip, username);
        await this.auditLogger.warn({
          action: 'LOGIN_FAILED',
          metadata: { username, reason: 'USER_NOT_FOUND', ip: req.ip }
        });
        
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid username or password'
          }
        });
        return;
      }
      
      // Validar contraseña
      const isValidPassword = await this.userService.validatePassword(
        userWithRoles,
        password
      );
      
      if (!isValidPassword) {
        await this.rateLimitService.recordFailedLogin(req.ip, username);
        await this.auditLogger.warn({
          action: 'LOGIN_FAILED',
          userId: userWithRoles.id,
          metadata: { reason: 'INVALID_PASSWORD', ip: req.ip }
        });
        
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid username or password'
          }
        });
        return;
      }
      
      // Extraer roles y permisos
      const roles = userWithRoles.roles.map(ur => ur.role.name);
      const permissions = await this.authService.getUserPermissions(userWithRoles.id);
      
      // Generar device info
      const deviceInfo = this.extractDeviceInfo(req);
      
      // Detectar sesión anómala
      const anomalousCheck = await this.sessionService.detectAnomalousSession(
        userWithRoles.id,
        deviceInfo,
        req.ip
      );
      
      if (anomalousCheck.suspicious) {
        await this.auditLogger.warn({
          action: 'SUSPICIOUS_LOGIN',
          userId: userWithRoles.id,
          metadata: {
            reasons: anomalousCheck.reasons,
            ip: req.ip,
            deviceInfo
          }
        });
        
        // Podríamos requerir 2FA adicional aquí
      }
      
      // Crear sesión
      const sessionId = await this.sessionService.createSession(
        userWithRoles.id,
        userWithRoles.username,
        roles[0], // Rol principal
        deviceInfo,
        req.ip,
        req.get('User-Agent') || ''
      );
      
      // Generar tokens
      const tokenPayload = {
        sub: userWithRoles.id,
        username: userWithRoles.username,
        role: roles[0],
        permissions,
        sessionId
      };
      
      const accessToken = this.authService.generateAccessToken(tokenPayload);
      const refreshToken = this.authService.generateRefreshToken(tokenPayload);
      
      // Almacenar refresh token
      await this.sessionService.storeRefreshToken(
        userWithRoles.id,
        refreshToken,
        deviceInfo
      );
      
      // Actualizar último login
      await this.userService.updateLastLogin(
        userWithRoles.id,
        req.ip,
        req.get('User-Agent') || ''
      );
      
      // Limpiar rate limit de login exitoso
      await this.rateLimitService.clearFailedLogin(req.ip, username);
      
      // Registrar login exitoso
      await this.auditLogger.info({
        action: 'LOGIN_SUCCESS',
        userId: userWithRoles.id,
        metadata: {
          terminal_id,
          ip: req.ip,
          deviceInfo,
          suspicious: anomalousCheck.suspicious
        }
      });
      
      res.status(200).json({
        success: true,
        data: {
          user: {
            id: userWithRoles.id,
            username: userWithRoles.username,
            email: userWithRoles.email,
            firstName: userWithRoles.firstName,
            lastName: userWithRoles.lastName,
            roles,
            permissions
          },
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: 900, // 15 minutos
          suspicious: anomalousCheck.suspicious
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId: req.headers['x-request-id']
        }
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An internal error occurred during login'
        }
      });
    }
  }
  
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refresh_token } = req.body;
      
      if (!refresh_token) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Refresh token is required'
          }
        });
        return;
      }
      
      // Verificar refresh token
      const payload = this.authService.verifyRefreshToken(refresh_token);
      
      // Verificar que la sesión aún exista
      const session = await this.sessionService.getSession(payload.sessionId);
      if (!session) {
        res.status(401).json({
          success: false,
          error: {
            code: 'SESSION_EXPIRED',
            message: 'Session has expired. Please login again.'
          }
        });
        return;
      }
      
      // Obtener permisos actualizados
      const permissions = await this.authService.getUserPermissions(payload.sub);
      
      // Generar nuevo access token
      const newTokenPayload = {
        ...payload,
        permissions
      };
      
      const newAccessToken = this.authService.generateAccessToken(newTokenPayload);
      
      // Registrar refresh
      await this.auditLogger.info({
        action: 'TOKEN_REFRESHED',
        userId: payload.sub,
        metadata: {
          sessionId: payload.sessionId,
          ip: req.ip
        }
      });
      
      res.status(200).json({
        success: true,
        data: {
          access_token: newAccessToken,
          expires_in: 900
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId: req.headers['x-request-id']
        }
      });
      
    } catch (error) {
      if (error.message.includes('expired') || error.message.includes('Invalid')) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Invalid or expired refresh token'
          }
        });
        return;
      }
      
      console.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An internal error occurred during token refresh'
        }
      });
    }
  }
  
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refresh_token } = req.body;
      const user = req.user;
      
      // Invalidar sesión
      if (user?.sessionId) {
        await this.sessionService.revokeSession(user.sessionId);
      }
      
      // Invalidar refresh token si se proporcionó
      if (refresh_token) {
        try {
          const payload = this.authService.verifyRefreshToken(refresh_token);
          await this.sessionService.revokeRefreshToken(payload.sub, refresh_token);
        } catch (error) {
          // Ignorar error si el refresh token es inválido
        }
      }
      
      // Registrar logout
      await this.auditLogger.info({
        action: 'LOGOUT',
        userId: user?.id,
        metadata: {
          ip: req.ip
        }
      });
      
      res.status(200).json({
        success: true,
        data: {
          message: 'Successfully logged out'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId: req.headers['x-request-id']
        }
      });
      
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An internal error occurred during logout'
        }
      });
    }
  }
  
  private extractDeviceInfo(req: Request): DeviceInfo {
    const userAgent = req.get('User-Agent') || '';
    
    // Lógica simple para extraer información del dispositivo
    // En producción, usar una librería como 'ua-parser-js'
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const platform = isMobile ? 'mobile' : 'desktop';
    
    return {
      fingerprint: this.generateDeviceFingerprint(req),
      platform,
      browser: this.extractBrowser(userAgent),
      os: this.extractOS(userAgent),
      isMobile
    };
  }
  
  private generateDeviceFingerprint(req: Request): string {
    const crypto = require('crypto');
    const data = [
      req.get('User-Agent') || '',
      req.get('Accept-Language') || '',
      req.get('Accept-Encoding') || ''
    ].join('|');
    
    return crypto.createHash('sha256').update(data).digest('hex');
  }
  
  private extractBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }
  
  private extractOS(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }
}
```

## 3. Middleware de Autenticación

### 3.1 Middleware Principal
```typescript
// src/auth/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { PermissionService } from '../services/permission.service';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
    permissions: string[];
    sessionId: string;
  };
}

export class AuthMiddleware {
  constructor(
    private authService: AuthService,
    private sessionService: SessionService,
    private permissionService: PermissionService
  ) {}
  
  authenticate() {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({
            success: false,
            error: {
              code: 'MISSING_AUTH_HEADER',
              message: 'Authorization header is required'
            }
          });
        }
        
        const token = authHeader.substring(7);
        
        // Verificar token
        const payload = this.authService.verifyAccessToken(token);
        
        // Verificar sesión
        const session = await this.sessionService.getSession(payload.sessionId);
        if (!session) {
          return res.status(401).json({
            success: false,
            error: {
              code: 'SESSION_EXPIRED',
              message: 'Session has expired. Please login again.'
            }
          });
        }
        
        // Obtener permisos actualizados
        const permissions = await this.permissionService.getUserPermissions(payload.sub);
        
        // Adjuntar información del usuario al request
        req.user = {
          id: payload.sub,
          username: payload.username,
          role: payload.role,
          permissions,
          sessionId: payload.sessionId
        };
        
        next();
        
      } catch (error) {
        if (error.message.includes('expired') || error.message.includes('Invalid')) {
          return res.status(401).json({
            success: false,
            error: {
              code: 'INVALID_TOKEN',
              message: 'Invalid or expired access token'
            }
          });
        }
        
        console.error('Authentication error:', error);
        return res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An internal error occurred during authentication'
          }
        });
      }
    };
  }
  
  requirePermission(permission: string) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Authentication required'
          }
        });
      }
      
      if (!req.user.permissions.includes(permission)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
            details: {
              required: permission,
              user: req.user.permissions
            }
          }
        });
      }
      
      next();
    };
  }
  
  requireRole(role: string) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Authentication required'
          }
        });
      }
      
      if (req.user.role !== role) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient role permissions',
            details: {
              required: role,
              current: req.user.role
            }
          }
        });
      }
      
      next();
    };
  }
}
```

## 4. Configuración de Rutas

### 4.1 Rutas de Autenticación
```typescript
// src/auth/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { RateLimitMiddleware } from '../middleware/rate-limit.middleware';

export function createAuthRoutes(
  authController: AuthController,
  authMiddleware: AuthMiddleware,
  rateLimitMiddleware: RateLimitMiddleware
): Router {
  const router = Router();
  
  // Login con rate limiting estricto
  router.post('/login',
    rateLimitMiddleware.auth(),
    authController.login.bind(authController)
  );
  
  // Refresh token
  router.post('/refresh',
    rateLimitMiddleware.standard(),
    authController.refreshToken.bind(authController)
  );
  
  // Logout (requiere autenticación)
  router.post('/logout',
    authMiddleware.authenticate(),
    authController.logout.bind(authController)
  );
  
  // Cambiar contraseña
  router.post('/change-password',
    authMiddleware.authenticate(),
    authController.changePassword.bind(authController)
  );
  
  // Obtener información del usuario actual
  router.get('/me',
    authMiddleware.authenticate(),
    authController.getCurrentUser.bind(authController)
  );
  
  // Cerrar todas las sesiones
  router.post('/logout-all',
    authMiddleware.authenticate(),
    authController.logoutAll.bind(authController)
  );
  
  return router;
}
```

## 5. Configuración de Seguridad

### 5.1 Variables de Entorno
```bash
# .env.example
# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# Session Configuration
REDIS_URL=redis://localhost:6379
SESSION_TTL=604800  # 7 days in seconds

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX=5

# Security
BCRYPT_ROUNDS=12
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTP_ONLY=true
CORS_ORIGIN=https://countryclubmerida.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/countryclub_pos

# Audit
AUDIT_LOG_LEVEL=info
AUDIT_LOG_RETENTION_DAYS=365
```

### 5.2 Configuración de Producción
```typescript
// src/config/production.config.ts
export const productionConfig = {
  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    issuer: 'countryclub-pos',
    audience: 'countryclub-users'
  },
  
  // Session
  session: {
    ttl: parseInt(process.env.SESSION_TTL || '604800'),
    redis: {
      url: process.env.REDIS_URL,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    }
  },
  
  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    sessionCookie: {
      secure: process.env.SESSION_COOKIE_SECURE === 'true',
      httpOnly: process.env.SESSION_COOKIE_HTTP_ONLY === 'true',
      sameSite: 'strict'
    },
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      credentials: true
    }
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    authMax: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '5')
  }
};
```

Esta implementación proporciona un sistema de autenticación robusto y seguro para el POS del Country Club Mérida, siguiendo las mejores prácticas de seguridad industriales.
