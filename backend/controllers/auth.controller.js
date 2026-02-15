import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { userModel } from '../models/user.model.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const authController = {
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body

      if (!email || !password || !name) {
        return res.status(400).json({ error: 'All fields are required' })
      }

      const existingUser = await userModel.findByEmail(email)
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' })
      }

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      const user = await userModel.create(name, email, hashedPassword)

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: '24h',
      })

      // Remove password hash from response
      const { password_hash, ...userWithoutPassword } = user

      res.status(201).json({ user: userWithoutPassword, token })
    } catch (error) {
      next(error)
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' })
      }

      const user = await userModel.findByEmail(email)
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      if (!user.password_hash) {
         return res.status(401).json({ error: 'Invalid credentials' })
      }
      
      // Ensure name is present, fallback to email prefix if not (though schema implies name exists)
      if (!user.name) {
        user.name = user.email.split('@')[0]
      }

      const isMatch = await bcrypt.compare(password, user.password_hash)
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: '24h',
      })

      const { password_hash, ...userWithoutPassword } = user

      res.json({ user: userWithoutPassword, token })
    } catch (error) {
      next(error)
    }
  }
}
