# 🚀 세광교회 시스템 배포 가이드 (무료)

이 시스템을 인터넷에 올려서 성도님들이 접속할 수 있게 만드는 방법입니다.
가장 쉽고 무료로 사용할 수 있는 **Vercel(버셀)**과 **Supabase(수파베이스)** 조합을 추천합니다.

---

## 1단계: 준비물
1. **GitHub 계정**: 코드를 저장할 곳 (https://github.com/)
2. **Vercel 계정**: 사이트를 배포할 곳 (https://vercel.com/)
3. **Supabase 계정**: 데이터베이스(DB)를 저장할 곳 (https://supabase.com/)
   - *주의: 현재 사용 중인 SQLite 파일 DB는 배포 시 데이터가 사라지므로, 반드시 Supabase 같은 클라우드 DB로 바꿔야 합니다.*

---

## 2단계: 코드 저장소(GitHub) 업로드
1. GitHub에 로그인하고 `New Repository`를 눌러 새 저장소를 만듭니다. (예: `my-church`)
2. 현재 작업 중인 컴퓨터의 터미널에서 다음 명령어를 입력해 코드를 올립니다.
   ```bash
   git init
   git add .
   git commit -m "첫 배포"
   git branch -M main
   git remote add origin https://github.com/본인아이디/my-church.git
   git push -u origin main
   ```

---

## 3단계: 데이터베이스(DB) 만들기 (Supabase)
1. [Supabase](https://supabase.com/)에 로그인하고 `New Project`를 만듭니다.
2. **Database Password**를 설정하고 **꼭 기억해두세요!**
3. 프로젝트가 생성되면 `Project Settings` -> `Database` -> `Connection String` -> `URI` 탭으로 이동합니다.
4. 주소를 복사합니다. (비밀번호 부분 `[YOUR-PASSWORD]`를 아까 설정한 비번으로 바꿔야 합니다.)
   - 예: `postgresql://postgres:비밀번호@db.supabase.co:5432/postgres`

---

## 4단계: 코드 수정 (DB 연결 변경)
배포를 위해 `prisma/schema.prisma` 파일에서 `sqlite`를 `postgresql`로 바꿔야 합니다.

1. `prisma/schema.prisma` 파일 열기
2. `datasource db` 부분 수정:
   ```prisma
   datasource db {
     provider = "postgresql" // sqlite -> postgresql 로 변경
     url      = env("DATABASE_URL")
   }
   ```
3. 수정 후 다시 GitHub에 올리기:
   ```bash
   git add .
   git commit -m "DB 변경"
   git push
   ```

---

## 5단계: 배포하기 (Vercel)
1. [Vercel](https://vercel.com/)에 로그인하고 `Add New ...` -> `Project` 클릭
2. GitHub 계정을 연결하고, 아까 올린 `my-church` 저장소를 `Import` 합니다.
3. **Environment Variables (환경 변수)** 설정 섹션을 엽니다. 아래 내용을 추가합니다.
   - `DATABASE_URL`: 아까 복사한 Supabase 접속 주소
   - `SESSION_SECRET`: 아무거나 긴 영어+숫자 조합 (보안용)
   - `ENCRYPTION_KEY`: 32글자 이상의 아무 문자열 (주민번호 암호화용)
   - `NEXT_PUBLIC_KAKAO_JS_KEY`: 카카오톡 키 (있으면)
   - `ADMIN_SECRET_KEY`: 관리자 가입 코드 (예: church2024!)
4. `Deploy` 버튼 클릭!

---

## 6단계: DB 초기화
배포가 완료되면 사이트 주소가 나옵니다. 하지만 아직 DB가 비어있어서 에러가 날 수 있습니다.
Vercel 대시보드에서 `Settings` -> `Deployment Protection` 같은 게 켜져있다면 끄고,
Vercel 상단 메뉴의 `Storage`나 `Build Command` 설정에서 마이그레이션을 해야 하는데,
**가장 쉬운 방법**은 로컬 컴퓨터에서 연결해주는 것입니다.

1. 내 컴퓨터의 `.env` 파일의 `DATABASE_URL`을 Supabase 주소로 잠시 바꿉니다.
2. 터미널에서 `npx prisma db push`를 입력합니다. (Supabase에 테이블이 생성됨)
3. 다시 `.env`를 원래대로(`file:./dev.db`) 돌려놓습니다.

---

## 🎉 완료!
이제 Vercel이 만들어준 주소(예: `my-church.vercel.app`)로 접속하면 됩니다!
관리자 계정은 처음에 가입하거나, DB에 직접 넣어야 할 수도 있습니다.
