'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { createSession, deleteSession, getSession as getAuthSession } from '@/lib/auth'

// Simple in-memory rate limiter (clears on server restart)
const loginAttempts = new Map<string, { count: number, lastAttempt: number }>();

export async function getTransactions(page: number = 1, limit: number = 20) {
  const session = await getSession()
  if (!session) return { transactions: [], total: 0, totalPages: 0 }

  const where: any = {}
  if (session.role !== 'ADMIN') {
    where.userId = session.id
  }

  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' }
      ],
      include: { user: true },
      skip,
      take: limit
    }),
    prisma.transaction.count({ where })
  ]);

  return {
    transactions,
    total,
    totalPages: Math.ceil(total / limit)
  }
}

export async function addTransaction(formData: FormData) {
  const session = await getSession()
  if (!session) return

  // Check if user is trying to edit their own data improperly
  // Only Admin can add/edit transactions
  if (session.role !== 'ADMIN') {
    return { error: '권한이 없습니다.' }
  }

  const amount = parseInt(formData.get('amount') as string)
  // Server-side validation
  if (amount <= 0 || isNaN(amount)) {
    return { error: '유효하지 않은 금액입니다.' }
  }
  const type = formData.get('type') as string
  const category = formData.get('category') as string
  const description = formData.get('description') as string
  const date = new Date(formData.get('date') as string)
  const userId = formData.get('userId') as string

  try {
    await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          amount,
          type,
          category,
          description,
          date,
          userId: userId || null
        }
      })

      // Log Audit
      const txAny = tx as any;
      const auditLogDelegate = txAny.auditLog || txAny.AuditLog;
      
      if (auditLogDelegate) {
        await auditLogDelegate.create({
          data: {
            action: 'CREATE',
            entity: 'Transaction',
            entityId: 'new',
            details: `[${type === 'INCOME' ? '헌금' : '지출'}] ${category}: ${amount.toLocaleString()}원`,
            performedBy: session.name || session.id
          }
        })
      } else {
         try {
            const logId = 'log_' + Date.now() + Math.random().toString(36).substring(7);
            const now = new Date();
            await tx.$executeRaw`
              INSERT INTO AuditLog (id, action, entity, entityId, details, performedBy, createdAt)
              VALUES (${logId}, 'CREATE', 'Transaction', 'new', ${`[${type === 'INCOME' ? '헌금' : '지출'}] ${category}: ${amount.toLocaleString()}원`}, ${session.name || session.id}, ${now})
            `;
         } catch (rawError: any) {
            throw new Error(`AuditLog Model missing AND Raw SQL failed: ${rawError.message}. Keys: ${Object.keys(txAny).filter(k => !k.startsWith('_'))}`);
         }
      }
    })
  } catch (e: any) {
    console.error('Create transaction failed', e)
    return { error: `등록 중 오류가 발생했습니다: ${e.message}` }
  }

  revalidatePath('/ledger')
  // revalidatePath('/')  <- 홈 화면은 실시간성이 덜 중요하므로 제외
  // revalidatePath('/tax') <- 연말정산도 1년에 한 번 보므로 제외
  // revalidatePath('/admin/audit') <- 로그도 필요할 때만 갱신
}

export async function updateTransaction(id: string, formData: FormData) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return { error: '권한이 없습니다.' }
  }

  const amount = parseInt(formData.get('amount') as string)
  if (amount <= 0 || isNaN(amount)) {
    return { error: '유효하지 않은 금액입니다.' }
  }
  
  const type = formData.get('type') as string
  const category = formData.get('category') as string
  const description = formData.get('description') as string
  const date = new Date(formData.get('date') as string)
  const userId = formData.get('userId') as string

  // Get original data for audit
  const original = await prisma.transaction.findUnique({ where: { id }, include: { user: true } })
  if (!original) return { error: '내역을 찾을 수 없습니다.' }

  // Check if user changed
  const newUser = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null
  const originalUserName = original.user?.name || 'Unknown'
  const newUserName = newUser?.name || (userId ? 'Unknown' : 'None')
  
  const userChanged = original.userId !== userId
  const userChangeLog = userChanged ? ` / User: ${originalUserName} -> ${newUserName}` : ''

  try {
    await prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id },
        data: {
          amount,
          type,
          category,
          description,
          date,
          userId: userId || null
        }
      })

      // Log Audit
      const txAny = tx as any;
      const auditLogDelegate = txAny.auditLog || txAny.AuditLog;
      
      if (auditLogDelegate) {
        await auditLogDelegate.create({
          data: {
            action: 'UPDATE',
            entity: 'Transaction',
            entityId: id,
            details: `[수정] ${original.amount.toLocaleString()}원 -> ${amount.toLocaleString()}원 / ${original.category} -> ${category}${userChangeLog}`,
            performedBy: session.name || session.id
          }
        })
      } else {
        // Retry with RAW SQL if model is missing (Emergency Fallback)
        try {
           const logId = 'log_' + Date.now() + Math.random().toString(36).substring(7);
           const now = new Date();
           await tx.$executeRaw`
             INSERT INTO AuditLog (id, action, entity, entityId, details, performedBy, createdAt)
             VALUES (${logId}, 'UPDATE', 'Transaction', ${id}, ${`[수정] ${original.amount.toLocaleString()}원 -> ${amount.toLocaleString()}원 / ${original.category} -> ${category}${userChangeLog}`}, ${session.name || session.id}, ${now})
           `;
        } catch (rawError: any) {
           throw new Error(`AuditLog Model missing AND Raw SQL failed: ${rawError.message}. Keys: ${Object.keys(txAny).filter(k => !k.startsWith('_'))}`);
        }
      }
    });
  } catch (e: any) {
    console.error('Update transaction failed:', e);
    return { error: `오류가 발생했습니다: ${e.message}` }
  }

  revalidatePath('/ledger')
  // revalidatePath('/')
  // revalidatePath('/tax')
  // revalidatePath('/admin/audit')
  return { success: true }
}

export async function deleteTransaction(id: string) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return { error: '권한이 없습니다.' }
  }

  const original = await prisma.transaction.findUnique({ where: { id } })
  if (!original) return { error: '내역을 찾을 수 없습니다.' }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.transaction.delete({
        where: { id }
      })

      // Log Audit
      const txAny = tx as any;
      const auditLogDelegate = txAny.auditLog || txAny.AuditLog;
      
      if (auditLogDelegate) {
        await auditLogDelegate.create({
          data: {
            action: 'DELETE',
            entity: 'Transaction',
            entityId: id,
            details: `[삭제] ${original.category}: ${original.amount.toLocaleString()}원`,
            performedBy: session.name || session.id
          }
        })
      } else {
         try {
            const logId = 'log_' + Date.now() + Math.random().toString(36).substring(7);
            const now = new Date();
            await tx.$executeRaw`
              INSERT INTO AuditLog (id, action, entity, entityId, details, performedBy, createdAt)
              VALUES (${logId}, 'DELETE', 'Transaction', ${id}, ${`[삭제] ${original.category}: ${original.amount.toLocaleString()}원`}, ${session.name || session.id}, ${now})
            `;
         } catch (rawError: any) {
            throw new Error(`AuditLog Model missing AND Raw SQL failed: ${rawError.message}. Keys: ${Object.keys(txAny).filter(k => !k.startsWith('_'))}`);
         }
      }
    })
  } catch (e: any) {
    console.error('Delete transaction failed', e)
    return { error: `삭제 중 오류가 발생했습니다: ${e.message}` }
  }

  revalidatePath('/ledger')
  // revalidatePath('/')
  // revalidatePath('/tax')
  // revalidatePath('/admin/audit')
  return { success: true }
}

export async function addBulkTransactions(formData: FormData) {
  const session = await getSession()
  if (!session) return
  
  if (session.role !== 'ADMIN') {
    return { error: '권한이 없습니다.' }
  }

  const date = new Date(formData.get('date') as string)
  const items = JSON.parse(formData.get('items') as string)

  try {
    // Use transaction for better performance and consistency
    await (prisma as any).$transaction(async (tx: any) => {
      await tx.transaction.createMany({
        data: items.map((item: any) => ({
          amount: parseInt(item.amount),
          type: item.type || 'INCOME',
          category: item.category,
          description: item.description,
          date,
          userId: item.userId || null
        }))
      })

      // Log Audit for bulk
      const txAny = tx as any;
      const auditLogDelegate = txAny.auditLog || txAny.AuditLog;
      
      if (auditLogDelegate) {
        await auditLogDelegate.create({
          data: {
            action: 'BULK_CREATE',
            entity: 'Transaction',
            entityId: 'multiple',
            details: `[일괄등록] 총 ${items.length}건 등록`,
            performedBy: session.name || session.id
          }
        })
      } else {
         try {
            const logId = 'log_' + Date.now() + Math.random().toString(36).substring(7);
            const now = new Date();
            await tx.$executeRaw`
              INSERT INTO AuditLog (id, action, entity, entityId, details, performedBy, createdAt)
              VALUES (${logId}, 'BULK_CREATE', 'Transaction', 'multiple', ${`[일괄등록] 총 ${items.length}건 등록`}, ${session.name || session.id}, ${now})
            `;
         } catch (rawError: any) {
            throw new Error(`AuditLog Model missing AND Raw SQL failed: ${rawError.message}. Keys: ${Object.keys(txAny).filter(k => !k.startsWith('_'))}`);
         }
      }
    })
  } catch (error: any) {
    console.error('Bulk insert error:', error)
    return { error: `일괄 등록 중 오류가 발생했습니다: ${error.message}` }
  }

  revalidatePath('/ledger')
  // revalidatePath('/')
  // revalidatePath('/tax')
  // revalidatePath('/admin/audit')
}

import { encrypt, decrypt } from '@/lib/utils'

export async function getUsers() {
  const session = await getSession()
  if (!session) return []

  if (session.role !== 'ADMIN') {
    // Members only see themselves
    const users = await prisma.user.findMany({
      where: { id: session.id },
      orderBy: { name: 'asc' }
    })
    // Decrypt residentId for display (if needed, though masking is better)
    return users.map((u: any) => ({
      ...u,
      residentId: decrypt(u.residentId || '')
    }))
  }

  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' }
  })
  
  return users.map((u: any) => ({
    ...u,
    residentId: decrypt(u.residentId || '')
  }))
}

export async function addUser(formData: FormData) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return { error: '권한이 없습니다.' }
  }

  const name = formData.get('name') as string
  const residentId = formData.get('residentId') as string
  const role = formData.get('role') as string || "MEMBER"
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const phoneNumber = formData.get('phoneNumber') as string
  const address = formData.get('address') as string

  try {
    // Check for duplicate email
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return { error: '이미 사용 중인 이메일(아이디)입니다.' }
    }

    await (prisma.user as any).create({
      data: {
        name,
        residentId: encrypt(residentId),
        role,
        email,
        password, // In a real app, hash this!
        phoneNumber,
        address
      }
    })
    
    revalidatePath('/admin')
    revalidatePath('/tax')
    revalidatePath('/ledger')
    return { success: true }
  } catch (e: any) {
    console.error('Add user failed:', e)
    return { error: `등록 중 오류가 발생했습니다: ${e.message}` }
  }
}

export async function getSummaryStats() {
  const session = await getSession()
  if (!session) return { income: 0, expense: 0, balance: 0 }

  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  
  // For Admin: Church Stats
  if (session.role === 'ADMIN') {
    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: firstDay
        }
      }
    })

    const income = transactions
      .filter((t: any) => t.type === 'INCOME')
      .reduce((acc: number, curr: any) => acc + curr.amount, 0)

    const expense = transactions
      .filter((t: any) => t.type === 'EXPENSE')
      .reduce((acc: number, curr: any) => acc + curr.amount, 0)

    return {
      income,
      expense,
      balance: income - expense
    }
  }

  // For Member: Personal Stats (This Month & Total)
  // This month
  const thisMonthTransactions = await prisma.transaction.findMany({
    where: {
      userId: session.id,
      date: {
        gte: firstDay
      },
      type: 'INCOME'
    }
  })

  const thisMonthIncome = thisMonthTransactions.reduce((acc: number, curr: any) => acc + curr.amount, 0)

  // Total (All time)
  const totalTransactions = await prisma.transaction.findMany({
    where: {
      userId: session.id,
      type: 'INCOME'
    }
  })

  const totalIncome = totalTransactions.reduce((acc: number, curr: any) => acc + curr.amount, 0)

  return {
    income: thisMonthIncome,
    expense: 0, // Members don't have expenses
    balance: totalIncome // Reusing 'balance' field for Total Income
  }
}

export async function getTaxData() {
  const session = await getSession()
  if (!session) return []

  const where: any = {
    type: 'INCOME',
    userId: { not: null }
  }

  if (session.role !== 'ADMIN') {
    where.userId = session.id
  }

  // Get all income transactions that have a user attached
  const donations = await (prisma.transaction as any).findMany({
    where,
    include: {
      user: true
    },
    orderBy: {
      date: 'asc'
    }
  })

  return donations.map((d: any) => ({
    date: d.date.toISOString().split('T')[0].replace(/-/g, ''), // YYYYMMDD format
    name: d.user?.name || 'Unknown',
    residentId: decrypt(d.user?.residentId || ''),
    address: d.user?.address || '',
    amount: d.amount,
    category: d.category,
    type: '41' // 종교단체 기부금 코드
  }))
}

export async function findEmail(name: string, phoneNumber: string) {
  // Normalize input
  const normalizedPhone = phoneNumber.replace(/[^0-9]/g, '');
  const normalizedName = name.trim();

  console.log(`[FindEmail] Searching for Name: "${normalizedName}", Phone: "${normalizedPhone}"`);

  // Try exact match first
  let user = await (prisma.user as any).findFirst({
    where: {
      name: normalizedName,
      phoneNumber: phoneNumber
    }
  })

  // If not found, try normalized phone match
  if (!user) {
    console.log(`[FindEmail] Exact match failed. Searching by name only...`);
    const allUsers = await (prisma.user as any).findMany({
      where: { name: normalizedName }
    });
    
    console.log(`[FindEmail] Found ${allUsers.length} users with name "${normalizedName}"`);
    
    user = allUsers.find((u: any) => {
      const uPhone = (u.phoneNumber || '').replace(/[^0-9]/g, '');
      console.log(`[FindEmail] Checking user: ${u.name}, DB Phone: "${u.phoneNumber}" -> Normalized: "${uPhone}" vs Input: "${normalizedPhone}"`);
      return uPhone === normalizedPhone;
    });
  }

  if (user) {
    console.log(`[FindEmail] Match FOUND! Email: ${user.email}`);
    return { email: user.email }
  }
  
  console.log(`[FindEmail] Match FAILED.`);
  return { error: '일치하는 정보가 없습니다.' }
}

export async function resetPassword(name: string, email: string, phoneNumber: string, newPassword: string) {
  // Normalize input
  const normalizedPhone = phoneNumber.replace(/[^0-9]/g, '');
  const normalizedName = name.trim();
  const normalizedEmail = email.trim();

  // Try exact match first
  let user = await (prisma.user as any).findFirst({
    where: {
      name: normalizedName,
      email: normalizedEmail,
      phoneNumber: phoneNumber
    }
  })

  // If not found, try normalized phone match
  if (!user) {
    const allUsers = await (prisma.user as any).findMany({
      where: { 
        name: normalizedName,
        email: normalizedEmail
      }
    });
    
    user = allUsers.find((u: any) => {
      const uPhone = (u.phoneNumber || '').replace(/[^0-9]/g, '');
      return uPhone === normalizedPhone;
    });
  }

  if (!user) {
    return { error: '일치하는 정보가 없습니다.' }
  }

  // Update password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await (prisma.user as any).update({
    where: { id: user.id },
    data: { password: hashedPassword }
  })

  return { success: true }
}

export async function changePassword(formData: FormData) {
  const session = await getSession()
  if (!session) return { error: '로그인이 필요합니다.' }

  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (newPassword !== confirmPassword) {
    return { error: '새 비밀번호가 일치하지 않습니다.' }
  }

  const user = await prisma.user.findUnique({ where: { id: session.id } }) as any;
  if (!user) return { error: '사용자를 찾을 수 없습니다.' }
  
  // Verify current password (support both hash and plain)
  let isCurrentValid = false;
  if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
    isCurrentValid = await bcrypt.compare(currentPassword, user.password);
  } else {
    isCurrentValid = user.password === currentPassword;
  }

  if (!isCurrentValid) {
    return { error: '현재 비밀번호가 올바르지 않습니다.' }
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await (prisma.user as any).update({
    where: { id: session.id },
    data: { password: hashedPassword }
  })

  return { success: true }
}

export async function deleteUser(userId: string) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return { error: '권한이 없습니다.' }
  }

  try {
    // 사용자와 관련된 헌금 내역도 삭제할지, 아니면 사용자만 삭제할지 결정해야 함
    // 여기서는 사용자 삭제 시 관련 데이터 무결성을 위해 트랜잭션 처리가 필요할 수 있음
    // 간단하게 사용자만 삭제 (Cascading delete가 설정되어 있다면 관련 데이터도 삭제됨)
    await (prisma.user as any).delete({
      where: { id: userId }
    })
    
    revalidatePath('/admin')
    revalidatePath('/ledger')
    return { success: true }
  } catch (e: any) {
    console.error('Delete user failed:', e)
    return { error: '삭제 중 오류가 발생했습니다.' }
  }
}

export async function deleteUsers(userIds: string[]) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return { error: '권한이 없습니다.' }
  }

  try {
    await (prisma.user as any).deleteMany({
      where: {
        id: {
          in: userIds
        }
      }
    })
    
    revalidatePath('/admin')
    revalidatePath('/ledger')
    return { success: true }
  } catch (e: any) {
    console.error('Delete users failed:', e)
    return { error: '삭제 중 오류가 발생했습니다.' }
  }
}

export async function register(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const residentId = formData.get('residentId') as string
  
  const address = formData.get('address') as string
  const addressDetail = formData.get('addressDetail') as string
  const fullAddress = address ? `${address} ${addressDetail}`.trim() : null
  
  const phoneNumber = formData.get('phoneNumber') as string
  
  // Secret code for admin creation
  const secretCode = formData.get('secretCode') as string
  const adminSecretKey = process.env.ADMIN_SECRET_KEY;
  if (!adminSecretKey) {
    console.error('ADMIN_SECRET_KEY is not set in environment variables');
    // Don't fallback to default in production, but for dev it might be okay. 
    // However, strictly better to force env usage.
  }
  
  const isAdmin = secretCode === (adminSecretKey || 'church2024!')

  // Check if email already exists
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('Register failed: Email exists', email);
      return { error: '이미 사용 중인 이메일입니다.' }
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await (prisma.user as any).create({
      data: {
        name,
        email,
        password: hashedPassword, 
        residentId: encrypt(residentId),
        address: fullAddress,
        phoneNumber,
        role: isAdmin ? 'ADMIN' : 'MEMBER'
      }
    })

    console.log('Register success:', newUser);
    return { success: true }
  } catch (e: any) {
    console.error('Register error:', e);
    return { error: `회원가입 중 오류가 발생했습니다: ${e.message}` }
  }
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const ip = 'server-action-ip'; // In real deployment, getting IP in server action is tricky without headers(), but we can use email as key

  // 1. Rate Limiting Check
  const now = Date.now();
  const attempt = loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
  
  // If 5 failed attempts in 15 minutes, block
  if (attempt.count >= 5 && now - attempt.lastAttempt < 15 * 60 * 1000) {
    const remaining = Math.ceil((15 * 60 * 1000 - (now - attempt.lastAttempt)) / 60000);
    return { error: `로그인 시도가 너무 많습니다. ${remaining}분 후에 다시 시도해주세요.` };
  }

  // Temporary: Create default admin if not exists
  const userCount = await prisma.user.count()
  if (userCount === 0 && email === 'admin@church.com' && password === 'admin1234') {
    const hashedPassword = await bcrypt.hash('admin1234', 10);
    await (prisma.user as any).create({
      data: {
        name: '관리자',
        email: 'admin@church.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
  }

  const user: any = await prisma.user.findUnique({
    where: { email }
  })

  let isValid = false;
  if (user) {
    // Check if hashed
    if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
      isValid = await bcrypt.compare(password, user.password);
    } else {
      // Legacy plain text check
      isValid = user.password === password;
      
      // Auto-upgrade to hash if valid
      if (isValid) {
        const newHash = await bcrypt.hash(password, 10);
        await (prisma.user as any).update({
          where: { id: user.id },
          data: { password: newHash }
        });
      }
    }
  }

  if (isValid) {
    // Reset rate limit on success
    loginAttempts.delete(email);
    await createSession(user.id, user.role, user.name);
    return { success: true }
  } else {
    // Increment rate limit
    loginAttempts.set(email, { count: attempt.count + 1, lastAttempt: now });
    return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' }
  }
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}

export async function getSession() {
  return await getAuthSession() as any
}

export async function getDonationReceiptData() {
  const session = await getSession()
  if (!session) return null

  const user = await prisma.user.findUnique({
    where: { id: session.id }
  })

  if (!user) return null

  // Get all income transactions for this year
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const endOfYear = new Date(now.getFullYear(), 11, 31)

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.id,
      type: 'INCOME',
      date: {
        gte: startOfYear,
        lte: endOfYear
      }
    },
    orderBy: {
      date: 'asc'
    }
  })

  const totalAmount = transactions.reduce((acc: number, curr: any) => acc + curr.amount, 0)

  return {
    user: {
      name: user.name,
      residentId: decrypt(user.residentId || ''),
      address: user.address || ''
    },
    year: now.getFullYear(),
    transactions: transactions.map((t: any) => ({
      date: t.date.toISOString().split('T')[0],
      category: t.category,
      amount: t.amount
    })),
    totalAmount
  }
}

export async function getAuditLogs() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return []
  }

  try {
    // 1. Try Standard Prisma Model Access
    let db = prisma as any;
    // Force refresh client if model is missing (just in case)
    if (!db.auditLog && !db.AuditLog) {
      const { PrismaClient } = await import('@prisma/client');
      db = new PrismaClient();
    }
    
    const auditLogModel = db.auditLog || db.AuditLog;
    
    if (auditLogModel) {
      const logs = await auditLogModel.findMany({
        orderBy: { createdAt: 'desc' },
        take: 1000
      });
      
      if (logs.length > 0) return logs;
      // If empty, it might be true empty, or model mapping issue. 
      // Let's try Raw SQL just to be sure if model returns nothing but table has data.
    }

    // 2. Fallback to Raw SQL (Direct Table Access)
    // This bypasses Prisma Model definition issues
    console.log('Attempting Raw SQL fetch for AuditLogs...');
    try {
      const rawLogs: any[] = await prisma.$queryRaw`SELECT * FROM AuditLog ORDER BY createdAt DESC LIMIT 1000`;
      return rawLogs.map(log => ({
        ...log,
        // Ensure date is a Date object (SQLite raw might return string/number)
        createdAt: new Date(log.createdAt)
      }));
    } catch (rawError) {
      // Try lowercase table name as last resort
      const rawLogsLower: any[] = await prisma.$queryRaw`SELECT * FROM auditlog ORDER BY createdAt DESC LIMIT 1000`;
      return rawLogsLower.map(log => ({
        ...log,
        createdAt: new Date(log.createdAt)
      }));
    }

  } catch (e) {
    console.error('Failed to fetch audit logs', e)
    return []
  }
}
