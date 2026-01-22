// Import hàm khởi tạo và Database
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Cấu hình của bạn
const firebaseConfig = {
  apiKey: "AIzaSyCuQ8AG_5fLrI1ss41dRZ38J-KZP5_DsJk",
  authDomain: "diemdanhqr-97693.firebaseapp.com",
  projectId: "diemdanhqr-97693",
  storageBucket: "diemdanhqr-97693.firebasestorage.app",
  messagingSenderId: "783934970227",
  appId: "1:783934970227:web:5766722279a96dc4c8cd06",
  measurementId: "G-YL3S8JQZG8"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Xuất biến db (database) để dùng ở nơi khác
export const db = getFirestore(app);