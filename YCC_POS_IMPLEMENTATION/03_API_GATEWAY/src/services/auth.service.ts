import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Autentica un usuario con email y contraseña
   * @param email Email del usuario
   * @param password Contraseña del usuario
   * @returns Token JWT y datos del usuario
   */
  async login(email: string, password: string): Promise<{
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      role: string
      isActive: boolean
    }
    token: string
    refreshToken: string
  }> {
    // Buscar usuario por email
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        password: true,
        role: true,
        isActive: true
      }
    })

    if (!user) {
      throw new Error('Invalid credentials')
    }

    if (!user.isActive) {
      throw new Error('Account is disabled')
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new Error('Invalid credentials')
    }

    // Generar tokens
    const token = this.generateToken(user.id, user.role)
    const refreshToken = this.generateRefreshToken(user.id)

    // Actualizar último login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Retornar datos sin contraseña
    const { password: _, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      token,
      refreshToken
    }
  }

  /**
   * Registra un nuevo usuario
   * @param userData Datos del nuevo usuario
   * @returns Usuario creado y token
   */
  async register(userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    role?: string
  }): Promise<{
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      role: string
      isActive: boolean
    }
    token: string
    refreshToken: string
  }> {
    // Verificar si el email ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email }
    })

    if (existingUser) {
      throw new Error('Email already registered')
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    // Crear usuario
    const user = await this.prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'CASHIER',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    })

    // Generar tokens
    const token = this.generateToken(user.id, user.role)
    const refreshToken = this.generateRefreshToken(user.id)

    return {
      user,
      token,
      refreshToken
    }
  }

  /**
   * Refresca un token JWT
   * @param refreshToken Token de refresco
   * @returns Nuevo token JWT
   */
  async refreshToken(refreshToken: string): Promise<{
    token: string
    refreshToken: string
  }> {
    try {
      // Verificar refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
        userId: string
        type: string
      }

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type')
      }

      // Buscar usuario
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          role: true,
          isActive: true
        }
      })

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive')
      }

      // Generar nuevos tokens
      const newToken = this.generateToken(user.id, user.role)
      const newRefreshToken = this.generateRefreshToken(user.id)

      return {
        token: newToken,
        refreshToken: newRefreshToken
      }
    } catch (error) {
      throw new Error('Invalid refresh token')
    }
  }

  /**
   * Cierra la sesión de un usuario
   * @param userId ID del usuario
   */
  async logout(userId: string): Promise<void> {
    // En una implementación real, aquí se invalidaría el token
    // Por ahora, solo actualizamos el último logout
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLogoutAt: new Date() }
    })
  }

  /**
   * Cambia la contraseña de un usuario
   * @param userId ID del usuario
   * @param currentPassword Contraseña actual
   * @param newPassword Nueva contraseña
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Buscar usuario
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect')
    }

    // Hashear nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // Actualizar contraseña
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        passwordChangedAt: new Date(),
        updatedAt: new Date()
      }
    })
  }

  /**
   * Restablece la contraseña de un usuario
   * @param email Email del usuario
   * @param newPassword Nueva contraseña
   */
  async resetPassword(email: string, newPassword: string): Promise<void> {
    // Buscar usuario
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Hashear nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // Actualizar contraseña
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        passwordChangedAt: new Date(),
        updatedAt: new Date()
      }
    })
  }

  /**
   * Verifica un token JWT
   * @param token Token JWT
   * @returns Datos del usuario
   */
  async verifyToken(token: string): Promise<{
    userId: string
    role: string
    email: string
  }> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string
        role: string
      }

      // Buscar usuario para obtener email actual
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true
        }
      })

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive')
      }

      return {
        userId: user.id,
        role: user.role,
        email: user.email
      }
    } catch (error) {
      throw new Error('Invalid token')
    }
  }

  /**
   * Obtiene información de un usuario por ID
   * @param userId ID del usuario
   * @returns Datos del usuario
   */
  async getUserById(userId: string): Promise<{
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    isActive: boolean
    lastLoginAt: Date | null
    createdAt: Date
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    return user
  }

  /**
   * Genera un token JWT
   * @param userId ID del usuario
   * @param role Rol del usuario
   * @returns Token JWT
   */
  private generateToken(userId: string, role: string): string {
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    )
  }

  /**
   * Genera un token de refresco
   * @param userId ID del usuario
   * @returns Token de refresco
   */
  private generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    )
  }

  /**
   * Verifica si un usuario tiene un rol específico
   * @param userId ID del usuario
   * @param requiredRole Rol requerido
   * @returns Booleano
   */
  async hasRole(userId: string, requiredRole: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isActive: true }
    })

    if (!user || !user.isActive) {
      return false
    }

    // Jerarquía de roles
    const roleHierarchy = {
      'ADMIN': 3,
      'MANAGER': 2,
      'CASHIER': 1
    }

    const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0

    return userLevel >= requiredLevel
  }
}
