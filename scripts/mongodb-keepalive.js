/**
 * MongoDB Atlas 自动防休眠保活守护程序 (MongoDB Keep-Alive & Auto-Cleaner)
 * 
 * 作用：
 * 1. 每天定时向 MongoDB Atlas 免费集群发送心跳连接与读写操作，防止官方因 60 天闲置而自动休眠（Pause）；
 * 2. 写入临时心跳记录后，自动清理历史旧记录，确保数据库零垃圾残留、永远保持极致轻量。
 */

const { MongoClient } = require('mongodb');

// 默认使用你的已验证 MongoDB 连接串，也可通过环境变量 MONGODB_URI 传入
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://terrylaoshi:zou92324@cluster0.zbikr5y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function runKeepAlive() {
  console.log('⏰ [MongoDB 保活] 开始执行心跳任务...', new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    // 1. 建立数据库连接
    await client.connect();
    console.log('✅ [MongoDB 保活] 成功建立集群连接！');
    
    // 2. 发送 Ping 协议包
    const pingResult = await client.db('admin').command({ ping: 1 });
    console.log('💓 [MongoDB 保活] Ping 通信成功:', pingResult);
    
    // 3. 进入专属保活数据库与集合
    const db = client.db('twikoo_keepalive');
    const collection = db.collection('heartbeat');
    
    // 创建 TTL 自动过期索引 (数据在 86400 秒 / 24 小时后由 MongoDB 引擎物理自毁)
    await collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 }).catch(() => {});
    
    // 4. 写入一条今日保活心跳记录（产生真实读写活跃度）
    const insertResult = await collection.insertOne({
      createdAt: new Date(),
      status: 'active',
      remark: 'Auto keep-alive heartbeat triggered to prevent MongoDB Atlas dormancy'
    });
    console.log('📝 [MongoDB 保活] 成功写入保活心跳记录，ID:', insertResult.insertedId.toString());
    
    // 5. 自动清理 1 天前的历史心跳记录（双重保险，保持数据库绝对纯净）
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const deleteResult = await collection.deleteMany({
      createdAt: { $lt: oneDayAgo }
    });
    console.log('🧹 [MongoDB 保活] 自动清理历史过期数据完成，清理条数:', deleteResult.deletedCount);
    
    console.log('🎉 [MongoDB 保活] 今日保活任务圆满完成！集群活跃度已刷新，永久防休眠！');
  } catch (error) {
    console.error('❌ [MongoDB 保活] 执行过程中发生异常:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔒 [MongoDB 保活] 已安全关闭数据库连接。');
  }
}

runKeepAlive();
