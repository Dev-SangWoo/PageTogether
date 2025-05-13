// Firebase 초기화 설정
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase 구성 정보 - 실제 앱에서는 환경변수 사용 권장
const firebaseConfig = {
  apiKey: "AIzaSyBHttCKAN3VaVjskNyOdeHf9NNDQdd43HY", // 실제 Firebase 프로젝트에서 이 값을 채워주세요
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "react-database-app-a0cfc",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db }; 