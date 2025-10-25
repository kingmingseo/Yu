import { MongoClient } from 'mongodb';

const url = process.env.DB_URL;
const options = {
  serverSelectionTimeoutMS: 30000, // 30초 타임아웃 (증가)
  connectTimeoutMS: 30000, // 30초 연결 타임아웃 (증가)
  socketTimeoutMS: 60000, // 60초 소켓 타임아웃 (증가)
  maxPoolSize: 5, // 최대 연결 풀 크기 (감소)
  minPoolSize: 0, // 최소 연결 풀 크기 (0으로 설정)
  maxIdleTimeMS: 60000, // 60초 유휴 타임아웃 (증가)
  retryWrites: true, // 쓰기 재시도
  retryReads: true, // 읽기 재시도
  heartbeatFrequencyMS: 10000, // 10초 하트비트
};

let connectDB;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongo) {
    global._mongo = new MongoClient(url, options).connect();
  }
  connectDB = global._mongo;
} else {
  // 프로덕션 환경에서는 매번 새 연결 생성하지 않고 캐시 유
  if (!global._mongo) {
    global._mongo = new MongoClient(url, options).connect();
  }
  connectDB = global._mongo;
}

export { connectDB };
