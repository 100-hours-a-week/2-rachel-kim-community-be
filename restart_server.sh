#!/bin/bash

# 1️⃣ PM2 또는 기존 노드 서버 종료
echo "Stopping existing server..."
pm2 stop all || true
pm2 delete all || true

# 2️⃣ 환경 변수 로드 (EC2 환경에 맞게 설정)
export $(grep -v '^#' /home/ubuntu/2-rachel-kim-community-be/.env | xargs)

# 3️⃣ 백엔드 서버 실행
echo "Starting backend server..."
cd /home/ubuntu/2-rachel-kim-community-be
npm install  # 혹시 모를 패키지 업데이트
pm2 start server.js --name "backend"

# 4️⃣ 프론트엔드 서버 실행
echo "Starting frontend server..."
cd /home/ubuntu/2-rachel-kim-community-fe
npm install  # 혹시 모를 패키지 업데이트
pm2 start server.js --name "frontend"

# 5️⃣ PM2 프로세스 리스트 저장 (EC2 재부팅 시 유지)
pm2 save

echo "✅ Backend & Frontend servers restarted successfully!"
