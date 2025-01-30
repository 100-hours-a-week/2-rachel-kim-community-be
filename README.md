<div align="center">

<!-- logo -->
<img src="https://user-images.githubusercontent.com/80824750/208554611-f8277015-12e8-48d2-b2cc-d09d67f03c02.png" width="400"/>

### 코드 플래닛 💫

[<img src="https://img.shields.io/badge/-readme.md-important?style=flat&logo=google-chrome&logoColor=white" />]() [<img src="https://img.shields.io/badge/-tech blog-blue?style=flat&logo=google-chrome&logoColor=white" />]() [<img src="https://img.shields.io/badge/release-v1.0.0-yellow?style=flat&logo=google-chrome&logoColor=white" />]() 
<br/> [<img src="https://img.shields.io/badge/프로젝트 기간-2024.11.07~2024.01.27-green?style=flat&logo=&logoColor=white" />]()

</div> 

## 📋 목차
- 프로젝트 소개
- 프로젝트 화면 구성
- 프로젝트 API 설계
- 사용한 기술 스택
- 프로젝트 아키텍쳐
- 기술적 이슈와 해결 과정

## 📝 소개
코딩을 사랑하는 사람들을 위한 커뮤니티! <br />
스트레스는 블랙홀로 사라지고, 아이디어는 우주처럼 확장되는 공간! <br />

 코드 플래닛은 개발자와 코딩을 배우는 사람들이 자유롭게 소통하고 정보를 공유할 수 있는 커뮤니티입니다. 백엔드는 안정적이고 확장 가능한 API를 제공하여 게시글 작성, 댓글 남기기, 회원 관리 등의 기능을 지원합니다.

<br />

### 화면 구성
|로그인|회원가입|
|:---:|:---:|
|<img width="450" alt="로그인" src="https://github.com/user-attachments/assets/cf4ac483-e392-4b7d-be37-5fadc0916100" />|<img width="450" alt="회원가입" src="https://github.com/user-attachments/assets/a665f3ad-4575-48e2-a373-0b385183e12c" />|
|아이디와 비밀번호 입력 후 로그인 가능. 회원가입 페이지로 이동 가능.|프로필 사진을 업로드하고, 이메일, 비밀번호, 닉네임을 입력하여 가입 가능.|

|게시글 목록|게시글 상세|
|:---:|:---:|
|<img width="450" alt="게시글 목록" src="https://github.com/user-attachments/assets/c12d3de1-73ef-4151-83db-2a46e03e407a" />|<img width="450" alt="게시글 상세" src="https://github.com/user-attachments/assets/d6c7e37b-8705-42e2-8ec9-8c2b9cba45d0" width="450"/>|
|최신 게시글을 확인하고 좋아요, 조회수 및 댓글수 확인 가능.|게시글 내용을 확인하고, 좋아요 및 댓글 추가 가능.|

|게시글 추가|게시글 수정|
|:---:|:---:|
|<img width="450" alt="게시글 추가" src="https://github.com/user-attachments/assets/c2e8f3ca-a611-417d-acee-69b85eb3c081" />|<img width="450" alt="게시글 수정" src="https://github.com/user-attachments/assets/04bc2ea0-7c38-4cd6-bb7c-7828eeaec817" />|
|제목과 내용을 입력하고, 이미지를 업로드하여 게시글을 작성 가능.|기존 게시글을 수정하고, 이미지 변경 가능.|

|회원정보 수정|비밀번호 수정|
|:---:|:---:|
|<img width="450" alt="회원정보 수정" src="https://github.com/user-attachments/assets/d6a6a0bb-52b7-4d56-8757-35734e8ed0e6" />|<img width="450" alt="비밀번호 수정" src="https://github.com/user-attachments/assets/621c564d-8485-4bd9-b80c-8542413de33e"/>|
|프로필 사진, 닉네임 등을 변경할 수 있음.|비밀번호를 새로 설정할 수 있음.|

<br />

## 🗂️ APIs
작성한 API는 아래에서 확인할 수 있습니다.

👉🏻 [API 바로보기](https://docs.google.com/spreadsheets/d/1TEYq-Wtt8_MwDkfQNdLdeZRMZCxVtGjvA8CTa7sCrt0/edit?gid=1878554884#gid=1878554884)


<br />

## ⚙ 기술 스택
### Back-end
<div>
<img src="https://github.com/user-attachments/assets/6a45c494-9a1a-4b45-8d02-949e60afeb57" width="80" alt="NodeJS">
<img src="https://github.com/user-attachments/assets/85ae00b1-6881-421d-baa4-f1ceee20c751" width="80" alt="ExpressJS"></div>

### Infra
<div>
<img src="https://github.com/user-attachments/assets/0fe3f487-43d0-466a-82bc-36c2fb66ba1f" width="80" alt="AWS EC2">
</div>

### Tools
<div>
<img src="https://github.com/user-attachments/assets/e0b44ec4-3d02-4303-9bca-c7b8c3980b09" width="80" alt="Github">
<img src="https://github.com/user-attachments/assets/9be5adff-b1b2-46b3-aa53-114763cd5e64" width="80" alt="Notion"></div>

<br />

## 🛠️ 프로젝트 아키텍쳐
### 📌 시스템 구조
사용자 → 프론트엔드 (React or Vanilla JS) → 백엔드 (Express.js) → 데이터베이스 (MariaDB)

### 📌 주요 아키텍처 구성
1️⃣ Frontend
- 사용자는 클라이언트를 통해 요청을 보냄
- 백엔드에서 제공하는 API를 활용하여 데이터 처리

2️⃣ Backend (Express.js 서버)
- RESTful API를 제공
- 세션을 활용한 인증 처리
- 데이터베이스(MariaDB)와 직접 통신

3️⃣ Database (MariaDB)
- User, Post, Comment 테이블 구성
- 인덱스 및 외래키 설정 최적화

4️⃣ Infra (배포 예정)
- AWS EC2: 백엔드 서버 배포
- AWS RDS: MariaDB 호스팅

<br />

## 🤔 기술적 이슈와 해결 과정

<br />

## 🗂️ 프로젝트 구조
```
2-rachel-kim-community-be
├─ .git
├─ .gitignore
├─ README.md
├─ controllers
│  ├─ commentController.js
│  ├─ postController.js
│  └─ userController.js
├─ middlewares
│  ├─ authMiddleware.js
│  └─ upload.js
├─ models
│  ├─ commentModel.js
│  ├─ postModel.js
│  └─ userModel.js
├─ package-lock.json
├─ package.json
├─ public
│  └─ image
│     ├─ posts
│     │  ├─ 1736141259076-548136637-IMG_1984.jpeg
│     │  ├─ 1736142810937-952782317-IMG_0418.jpeg
│     │  └─ post.jpeg
│     └─ profile
│        ├─ 1736232024240-647705081-IMG_8137.jpeg
│        └─ default-profile.jpeg
├─ routes
│  ├─ commentRoutes.js
│  ├─ postRoutes.js
│  └─ userRoutes.js
├─ server.js
└─ tmp.js

```
