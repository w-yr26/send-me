import passport from 'passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import jsonwebtoken from 'jsonwebtoken'

const secret = 'wuyurui!@#$%'

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secret,
}

// JWT对象
const JWT = {
  /*
   * 初始化JWT策略(让passport校验器执行passport-jwt插件)
   */
  initJWTStrategy() {
    const strategy = new Strategy(jwtOptions, (payload, done) => {
      done(null, payload)
    })
    passport.use(strategy)
  },

  /**
   * 创建token
   * @param data 用户信息
   */
  generate(value, expires = '3d') {
    return jsonwebtoken.sign(value, secret, { expiresIn: expires })
  },

  /**
   * 创建refresh_token
   */
  doubleCheck(value, expires = '7d') {
    return jsonwebtoken.sign(value, secret, { expiresIn: expires })
  },

  /**
   * 解密
   * @param {*} token 用户token
   * @returns 用户信息
   */
  verify(token) {
    try {
      return jsonwebtoken.verify(token, secret)
    } catch (error) {
      return 'token 失效'
    }
  },

  /**
   * 用于中间件
   */
  middleware() {
    return passport.authenticate('jwt', { session: false })
  },

  /**
   * 集成到express
   */
  init() {
    return passport.initialize()
  },
}

export default JWT
