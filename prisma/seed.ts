import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. 초기 관리자 계정 생성
  const adminEmail = 'admin@church.com'
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: '관리자',
      password: "admin1234", // 실제 운영 시에는 복잡한 비밀번호 사용 권장
      role: 'ADMIN',
      phoneNumber: '010-0000-0000',
      address: '서울시 강남구',
    },
  })

  console.log(`관리자 계정 생성됨: ${admin.email}`)

  // 2. 테스트용 교인 데이터 생성
  const usersData = [
    { name: '홍길동', email: 'hong@church.com', phone: '010-1111-2222' },
    { name: '김철수', email: 'kim@test.com', phone: '010-3333-4444' },
    { name: '이영희', email: 'lee@test.com', phone: '010-5555-6666' },
  ]

  for (const u of usersData) {
    await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        password: '1234', // 테스트용 비번
        role: 'MEMBER',
        phoneNumber: u.phone,
        address: '서울시 서초구',
      }
    })
  }
  console.log('테스트 교인 3명 생성됨')

  // 3. 테스트용 헌금 내역 생성
  const members = await prisma.user.findMany({ where: { role: 'MEMBER' } })
  
  for (const member of members) {
    await prisma.transaction.create({
      data: {
        amount: 100000,
        type: 'INCOME',
        category: '십일조',
        description: '1월 십일조',
        date: new Date('2026-01-05'),
        userId: member.id,
      }
    })
    await prisma.transaction.create({
      data: {
        amount: 30000,
        type: 'INCOME',
        category: '주정헌금',
        description: '1월 첫주',
        date: new Date('2026-01-05'),
        userId: member.id,
      }
    })
  }
  console.log('테스트 헌금 내역 생성됨')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
