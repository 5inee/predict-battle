/**
 * نص لإصلاح بيانات التوقعات الحالية:
 * - إنشاء حقل game استنادًا إلى session
 * - إزالة السجلات المكررة إذا وجدت
 * 
 * لتشغيل هذا النص:
 * 1. احفظه في ملف: backend/scripts/fix-predictions.js
 * 2. قم بتشغيله باستخدام: node scripts/fix-predictions.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

// اتصل بقاعدة البيانات
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

// تعريف مخطط التوقع ونموذجه
const predictionSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

const Prediction = mongoose.model('Prediction', predictionSchema);

async function fixPredictions() {
  try {
    console.log('Starting prediction data fix...');
    
    // 1. الحصول على جميع التوقعات
    const predictions = await Prediction.find({});
    console.log(`Found ${predictions.length} predictions in the database`);
    
    // 2. ترتيب التوقعات حسب المستخدم والجلسة
    const userSessionMap = {};
    
    for (const prediction of predictions) {
      const userId = prediction.user.toString();
      const sessionId = prediction.session ? prediction.session.toString() : null;
      const gameId = prediction.game ? prediction.game.toString() : null;
      
      const key = `${userId}-${sessionId || gameId || 'null'}`;
      
      if (!userSessionMap[key]) {
        userSessionMap[key] = [];
      }
      
      userSessionMap[key].push(prediction);
    }
    
    // 3. إصلاح التوقعات التي تفتقر إلى حقل game أو session
    let fixedCount = 0;
    let deletedCount = 0;
    
    for (const key in userSessionMap) {
      const userPredictions = userSessionMap[key];
      
      if (userPredictions.length > 1) {
        console.log(`Found ${userPredictions.length} predictions for the same user-session combination: ${key}`);
        
        // الاحتفاظ بأقدم توقع وحذف البقية
        userPredictions.sort((a, b) => a.submittedAt - b.submittedAt);
        const keepPrediction = userPredictions[0];
        
        // تأكد من أن كلا الحقلين game و session موجودان
        if (keepPrediction.session && !keepPrediction.game) {
          keepPrediction.game = keepPrediction.session;
          await keepPrediction.save();
          console.log(`Fixed prediction ${keepPrediction._id} by setting game = session`);
          fixedCount++;
        } else if (!keepPrediction.session && keepPrediction.game) {
          keepPrediction.session = keepPrediction.game;
          await keepPrediction.save();
          console.log(`Fixed prediction ${keepPrediction._id} by setting session = game`);
          fixedCount++;
        }
        
        // حذف التوقعات المكررة
        for (let i = 1; i < userPredictions.length; i++) {
          await Prediction.deleteOne({ _id: userPredictions[i]._id });
          console.log(`Deleted duplicate prediction ${userPredictions[i]._id}`);
          deletedCount++;
        }
      } else if (userPredictions.length === 1) {
        // التحقق من التوقعات الفردية
        const prediction = userPredictions[0];
        
        if (prediction.session && !prediction.game) {
          prediction.game = prediction.session;
          await prediction.save();
          console.log(`Fixed single prediction ${prediction._id} by setting game = session`);
          fixedCount++;
        } else if (!prediction.session && prediction.game) {
          prediction.session = prediction.game;
          await prediction.save();
          console.log(`Fixed single prediction ${prediction._id} by setting session = game`);
          fixedCount++;
        } else if (!prediction.session && !prediction.game) {
          console.log(`Warning: Prediction ${prediction._id} has neither session nor game`);
        }
      }
    }
    
    // 4. إعادة إنشاء الفهرس
    try {
      await mongoose.connection.db.collection('predictions').dropIndex('game_1_user_1');
      console.log('Dropped the old index game_1_user_1');
    } catch (err) {
      console.log('Index game_1_user_1 does not exist or could not be dropped:', err.message);
    }
    
    try {
      await mongoose.connection.db.collection('predictions').createIndex(
        { session: 1, user: 1 },
        { unique: true }
      );
      console.log('Created new index session_1_user_1');
    } catch (err) {
      console.error('Error creating new index:', err);
    }
    
    console.log(`Completed! Fixed ${fixedCount} predictions, deleted ${deletedCount} duplicates.`);
  } catch (err) {
    console.error('Error fixing predictions:', err);
  } finally {
    mongoose.disconnect();
  }
}

// تنفيذ الوظيفة
fixPredictions();