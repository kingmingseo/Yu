import { MongoClient } from 'mongodb';

const url = process.env.DB_URL;
const options = {
  serverSelectionTimeoutMS: 5000, // 5초 타임아웃
  connectTimeoutMS: 10000, // 10초 연결 타임아웃
  socketTimeoutMS: 45000, // 45초 소켓 타임아웃
  maxPoolSize: 10, // 최대 연결 풀 크기
  minPoolSize: 1, // 최소 연결 풀 크기
  maxIdleTimeMS: 30000, // 30초 유휴 타임아웃
  retryWrites: true, // 쓰기 재시도
  retryReads: true, // 읽기 재시도
};

let connectDB;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongo) {
    global._mongo = new MongoClient(url, options).connect();
  }
  connectDB = global._mongo;
} else {
  connectDB = new MongoClient(url, options).connect();
}

export { connectDB };
