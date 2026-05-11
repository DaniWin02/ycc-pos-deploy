import express from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = express.Router()
const prisma = new PrismaClient()

const JWT_SECRET = process.env.JWT_SECRET || 'ycc-pos-secret-key-change-in-production'
const SALT_ROUNDS = 10

// ========================================
// LOGIN
// ========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' })
    }

    // Buscar usuario por email o username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: email }
        ]
      }
    })

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Usuario inactivo' })
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.passwordHash)

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    // Actualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    // Generar token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Retornar datos del usuario (sin contraseña)
    const { passwordHash, ...userWithoutPassword } = user

    res.json({
      success: true,
      token,
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ error: 'Error al iniciar sesión' })
  }
})

// ========================================
// REGISTRO DE USUARIO
// ========================================
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role = 'CASHIER' } = req.body

    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' })
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      return res.status(400).json({ error: 'El usuario o email ya existe' })
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        firstName,
        lastName,
        role
      }
    })

    // Generar token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    const { passwordHash: _, ...userWithoutPassword } = user

    res.status(201).json({
      success: true,
      token,
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Error en registro:', error)
    res.status(500).json({ error: 'Error al registrar usuario' })
  }
})

// ========================================
// VERIFICAR TOKEN
// ========================================
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ error: 'Token requerido' })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Token inválido' })
    }

    const { passwordHash, ...userWithoutPassword } = user

    res.json({
      valid: true,
      user: userWithoutPassword
    })
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
})

// ========================================
// CAMBIAR CONTRASEÑA
// ========================================
router.post('/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    // Verificar contraseña actual
    const validPassword = await bcrypt.compare(currentPassword, user.passwordHash)

    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' })
    }

    // Hash de la nueva contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS)

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    })

    res.json({ success: true, message: 'Contraseña actualizada correctamente' })
  } catch (error) {
    console.error('Error cambiando contraseña:', error)
    res.status(500).json({ error: 'Error al cambiar contraseña' })
  }
})

// ========================================
// OBTENER PERFIL
// ========================================
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        permissions: true,
        phone: true,
        avatar: true,
        isActive: true,
        lastLogin: true,
        createdAt: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    res.json(user)
  } catch (error) {
    console.error('Error obteniendo perfil:', error)
    res.status(500).json({ error: 'Error al obtener perfil' })
  }
})

// ========================================
// ACTUALIZAR PERFIL
// ========================================
router.put('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { firstName, lastName, phone, avatar } = req.body

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        phone,
        avatar
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        avatar: true
      }
    })

    res.json(user)
  } catch (error) {
    console.error('Error actualizando perfil:', error)
    res.status(500).json({ error: 'Error al actualizar perfil' })
  }
})

// ========================================
// USER ACTIVITY - ESTADO EN TIEMPO REAL
// ========================================
router.get('/activity', async (req, res) => {
  try {
    // Obtener todos los usuarios de la base de datos
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        pin: true,
        canAccessPos: true,
        canAccessKds: true,
        canAccessAdmin: true,
        isActive: true,
        lastLogin: true,
        createdAt: true
      }
    })

    // Obtener actividad en tiempo real del store
    const userActivity = req.app.get('userActivity')
    const onlineUsers = userActivity ? userActivity.getUsersActivity() : []

    // Combinar información de DB con actividad en tiempo real
    const usersWithActivity = users.map(user => {
      const onlineStatus = onlineUsers.find((u: any) => u.userId === user.id)
      
      return {
        ...user,
        isOnline: onlineStatus?.isOnline || false,
        currentModule: onlineStatus?.currentModule || null,
        lastSeen: onlineStatus?.lastSeen || user.lastLogin,
        loginTime: onlineStatus?.loginTime || null
      }
    })
    
    // Agregar usuarios hardcodeados que estén online pero no en BD
    const hardcodedOnlineUsers = onlineUsers.filter((onlineUser: any) => 
      !users.find((dbUser: any) => dbUser.id === onlineUser.userId)
    )
    
    for (const onlineUser of hardcodedOnlineUsers) {
      usersWithActivity.push({
        id: onlineUser.userId,
        username: onlineUser.username || onlineUser.userId,
        firstName: onlineUser.firstName || 'Usuario',
        lastName: onlineUser.lastName || 'Hardcodeado',
        role: onlineUser.role || 'ADMIN',
        pin: '0000',
        canAccessPos: true,
        canAccessKds: true,
        canAccessAdmin: onlineUser.role === 'ADMIN',
        isActive: true,
        lastLogin: onlineUser.loginTime,
        createdAt: new Date(),
        isOnline: true,
        currentModule: onlineUser.currentModule,
        lastSeen: onlineUser.lastSeen,
        loginTime: onlineUser.loginTime
      })
    }

    // Estadísticas
    const stats = {
      total: users.length,
      online: usersWithActivity.filter((u: any) => u.isOnline).length,
      offline: usersWithActivity.filter((u: any) => !u.isOnline).length,
      inPos: usersWithActivity.filter((u: any) => u.currentModule === 'POS').length,
      inKds: usersWithActivity.filter((u: any) => u.currentModule === 'KDS').length,
      inAdmin: usersWithActivity.filter((u: any) => u.currentModule === 'ADMIN').length
    }

    res.json({
      users: usersWithActivity,
      stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error obteniendo actividad de usuarios:', error)
    res.status(500).json({ error: 'Error al obtener actividad de usuarios' })
  }
})

// ========================================
// ACTIVITY STATS - RESUMEN RÁPIDO
// ========================================
router.get('/activity/stats', async (req, res) => {
  try {
    const userActivity = req.app.get('userActivity')
    const onlineUsers = userActivity ? userActivity.getUsersActivity() : []
    
    const totalUsers = await prisma.user.count()
    const onlineCount = onlineUsers.filter((u: any) => u.isOnline).length

    res.json({
      totalUsers,
      onlineUsers: onlineCount,
      offlineUsers: totalUsers - onlineCount,
      activeInPos: onlineUsers.filter((u: any) => u.currentModule === 'POS').length,
      activeInKds: onlineUsers.filter((u: any) => u.currentModule === 'KDS').length,
      activeInAdmin: onlineUsers.filter((u: any) => u.currentModule === 'ADMIN').length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    res.status(500).json({ error: 'Error al obtener estadísticas' })
  }
})

// ========================================
// ALERTS API - REST Endpoints
// ========================================

// GET /alerts - Obtener todas las alertas
router.get('/alerts', (req, res) => {
  try {
    const alerts = req.app.get('alerts')
    if (!alerts) {
      return res.status(500).json({ error: 'Sistema de alertas no inicializado' })
    }
    res.json(alerts.getAlerts())
  } catch (error) {
    console.error('Error obteniendo alertas:', error)
    res.status(500).json({ error: 'Error al obtener alertas' })
  }
})

// POST /alerts - Crear nueva alerta
router.post('/alerts', (req, res) => {
  try {
    const { type, title, message, source, metadata } = req.body
    
    if (!type || !title || !message) {
      return res.status(400).json({ error: 'Se requieren type, title y message' })
    }
    
    const alerts = req.app.get('alerts')
    if (!alerts) {
      return res.status(500).json({ error: 'Sistema de alertas no inicializado' })
    }
    
    const alert = alerts.createAlert({
      type,
      title,
      message,
      source,
      metadata
    })
    
    res.status(201).json(alert)
  } catch (error) {
    console.error('Error creando alerta:', error)
    res.status(500).json({ error: 'Error al crear alerta' })
  }
})

// PUT /alerts/:id/acknowledge - Marcar alerta como leída
router.put('/alerts/:id/acknowledge', (req, res) => {
  try {
    const { id } = req.params
    const alerts = req.app.get('alerts')
    
    if (!alerts) {
      return res.status(500).json({ error: 'Sistema de alertas no inicializado' })
    }
    
    const success = alerts.acknowledgeAlert(id)
    
    if (success) {
      res.json({ success: true, message: 'Alerta marcada como leída' })
    } else {
      res.status(404).json({ error: 'Alerta no encontrada' })
    }
  } catch (error) {
    console.error('Error marcando alerta:', error)
    res.status(500).json({ error: 'Error al marcar alerta' })
  }
})

// GET /alerts/stats - Estadísticas de alertas
router.get('/alerts/stats', (req, res) => {
  try {
    const alerts = req.app.get('alerts')
    if (!alerts) {
      return res.status(500).json({ error: 'Sistema de alertas no inicializado' })
    }
    
    const allAlerts = alerts.getAlerts()
    
    res.json({
      total: allAlerts.length,
      pending: allAlerts.filter((a: any) => !a.acknowledged).length,
      warning: allAlerts.filter((a: any) => a.type === 'warning').length,
      error: allAlerts.filter((a: any) => a.type === 'error').length,
      success: allAlerts.filter((a: any) => a.type === 'success').length,
      info: allAlerts.filter((a: any) => a.type === 'info').length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    res.status(500).json({ error: 'Error al obtener estadísticas' })
  }
})

export default router
