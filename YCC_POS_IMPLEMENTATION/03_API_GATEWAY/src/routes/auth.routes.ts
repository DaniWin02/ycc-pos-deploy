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

export default router
