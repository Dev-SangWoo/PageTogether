// Firebase 초기화 설정
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 하드코딩된 기본값 (환경 변수가 없을 경우 사용)
const defaultConfig = {
  apiKey: "AIzaSyBHttCKAN3VaVjskNyOdeHf9NNDQdd43HY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "react-database-app-a0cfc",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase 구성 정보를 환경 변수에서 로드 (환경 변수가 없으면 기본값 사용)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || defaultConfig.apiKey,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || defaultConfig.authDomain,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || defaultConfig.projectId,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || defaultConfig.storageBucket,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || defaultConfig.messagingSenderId,
  appId: process.env.REACT_APP_FIREBASE_APP_ID || defaultConfig.appId
};

// 환경 변수 로드 상태 로그
console.log('Firebase 환경 변수 사용 여부:', {
  apiKey: !!process.env.REACT_APP_FIREBASE_API_KEY, 
  projectId: !!process.env.REACT_APP_FIREBASE_PROJECT_ID
});

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db }; 