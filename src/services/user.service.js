const prisma = require("../config/database.js");
const { hashPassword, comparePassword } = require("../utils/password");
const { generateToken } = require("../utils/jwt");
const {
  getCachedData,
  setCachedData,
  deleteCacheData,
  getCacheVersion,
  bumpCacheVersion,
} = require("../utils/cache");

const PROFILE_TTL = 60 * 5; // 5 min
const USERS_LIST_TTL = 60 * 2; // 2 min

class UserService {
  async register(data) {
    const existing = await prisma.users.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      const error = new Error("E-mail já cadastrado");
      error.statusCode = 409;
      throw error;
    }

    const password_hash = await hashPassword(data.password);

    const user = await prisma.users.create({
      data: {
        name: data.name,
        email: data.email,
        password_hash,
        avatar_url: data.avatar_url || null,
      },
    });

    const { password_hash: _, ...safeUser } = user;


    await setCachedData(`users:profile:${safeUser.id}`, safeUser, PROFILE_TTL);
    await bumpCacheVersion("users:list:version");

    return safeUser;
  }

  async login(email, password) {
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      const error = new Error("Credenciais inválidas");
      error.statusCode = 401;
      throw error;
    }

    const isValid = await comparePassword(password, user.password_hash);

    if (!isValid) {
      const error = new Error("Credenciais inválidas");
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken({ id: user.id, name: user.name, email: user.email });
    const { password_hash: _, ...safeUser } = user;


    await setCachedData(`users:profile:${safeUser.id}`, safeUser, PROFILE_TTL);

    return { token, user: safeUser };
  }

  async getProfile(userId) {
    const key = `users:profile:${userId}`;

    let user = await getCachedData(key);
    if (user) return user;

    user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true,
        created_at: true,
      },
    });

    if (!user) {
      const error = new Error("Usuário não encontrado");
      error.statusCode = 404;
      throw error;
    }

    await setCachedData(key, user, PROFILE_TTL);
    return user;
  }

  async listUsers(page = 1, pageSize = 10) {
    const version = await getCacheVersion("users:list:version", "1");
    const key = `users:list:v${version}:p${page}:s${pageSize}`;

    let users = await getCachedData(key);
    if (users) return users;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [data, total] = await Promise.all([
      prisma.users.findMany({
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          avatar_url: true,
          created_at: true,
        },
        orderBy: { created_at: "desc" },
      }),
      prisma.users.count(),
    ]);

    users = {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };

    await setCachedData(key, users, USERS_LIST_TTL);
    return users;
  }


  async updateProfile(userId, payload) {
    const updated = await prisma.users.update({
      where: { id: userId },
      data: payload,
      select: { id: true, name: true, email: true, avatar_url: true, created_at: true },
    });

    await deleteCacheData(`users:profile:${userId}`);
    await bumpCacheVersion("users:list:version");

    return updated;
  }
}

module.exports = new UserService();
