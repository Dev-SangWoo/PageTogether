# Page Together 앱

도서 관리 및 독서 활동 추적을 위한 React 웹 애플리케이션입니다.

## 소개

Page Together는 사용자가 자신의 독서 활동을 관리하고 추적할 수 있는 플랫폼입니다. 도서 검색, 개인 서재 관리, 독서 모임 참여 등 다양한 기능을 제공합니다.
![Image](https://github.com/user-attachments/assets/1936ceb5-6b20-453f-b964-1185c06aa3da)

![Image](https://github.com/user-attachments/assets/11a68de8-5605-4219-857f-48b94f1b14d0)

![Image](https://github.com/user-attachments/assets/a60e3d0a-63fa-4fc0-96e9-a0b0e0d5daeb)

![Image](https://github.com/user-attachments/assets/17057feb-05d0-4d02-ad64-244e92ca89a5)

## 주요 기능

- **사용자 인증**: 회원가입 및 로그인 기능을 통한 개인화된 서비스 제공
- **도서 검색**: 알라딘 API를 활용한 도서 검색 기능
- **개인 서재**: 읽은 책, 읽고 있는 책, 읽을 예정인 책 관리
- **대시보드**: 사용자의 독서 활동과 통계를 한 눈에 확인 가능
- **도서 추천**: 사용자의 독서 이력을 기반으로 한 맞춤형 도서 추천
- **독서 모임**: 다른 사용자들과 함께하는 독서 모임 기능

## 기술 스택

- **Frontend**: React, Redux, React Router, Styled-Components
- **Backend**: Firebase (Authentication, Firestore)
- **외부 API**: 알라딘 API (도서 정보 검색)

## 주요 구성요소

### 컴포넌트 구조

- **Login/SignUp**: 사용자 인증 관련 컴포넌트
- **DashBoard**: 사용자의 독서 활동 요약 및 대시보드
- **Search**: 도서 검색 기능
- **Book**: 개별 도서 상세 정보 표시
- **MyBook**: 사용자의 개인 서재 관리
- **Recommend**: 맞춤형 도서 추천 시스템
- **Overview**: 사용자의 독서 통계 요약
- **MeetingList**: 독서 모임 목록 및 관리

## 설치 및 실행 방법

1. 저장소 클론:
   ```
   git clone <repository-url>
   cd page-together-app
   ```

2. 의존성 설치:
   ```
   npm install
   ```

3. 환경 변수 설정:
   프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:
   ```
   # 알라딘 API 키
   REACT_APP_ALADIN_API_KEY=your_aladin_api_key_here

   # Firebase 설정
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
   ```

4. 개발 서버 실행:
   ```
   npm start
   ```
   애플리케이션은 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## 사용 방법

1. 회원가입 또는 로그인하여 시작합니다.
2. 대시보드에서 독서 활동 요약을 확인합니다.
3. 검색 기능을 통해 원하는 도서를 찾습니다.
4. 개인 서재에 도서를 추가하고 독서 상태를 관리합니다.
5. 추천 도서 목록을 확인하여 새로운 독서 활동을 계획합니다.

## 배포

프로덕션 빌드를 생성하려면:
```
npm run build
```

생성된 `build` 폴더는 정적 파일 호스팅 서비스(Firebase Hosting, Netlify, Vercel 등)에 배포할 수 있습니다.

## 라이선스

MIT License
