-- =====================================================
-- VITA WISE AI - Health Tracking Application Database Schema
-- =====================================================

-- Users table - เก็บข้อมูลผู้ใช้
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    activity_level VARCHAR(20) CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Health Goals table - เก็บเป้าหมายสุขภาพ
CREATE TABLE health_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN ('weight_loss', 'weight_gain', 'muscle_gain', 'endurance', 'flexibility', 'stress_reduction', 'sleep_improvement', 'nutrition', 'other')),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    target_value DECIMAL(10,2),
    current_value DECIMAL(10,2) DEFAULT 0,
    unit VARCHAR(20),
    start_date DATE NOT NULL,
    target_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Food Log table - เก็บบันทึกอาหาร
CREATE TABLE food_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    food_name VARCHAR(200) NOT NULL,
    quantity DECIMAL(8,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    calories DECIMAL(8,2),
    protein_g DECIMAL(8,2),
    carbs_g DECIMAL(8,2),
    fat_g DECIMAL(8,2),
    fiber_g DECIMAL(8,2),
    sugar_g DECIMAL(8,2),
    sodium_mg DECIMAL(8,2),
    notes TEXT,
    consumed_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exercise Log table - เก็บบันทึกการออกกำลังกาย
CREATE TABLE exercise_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    exercise_name VARCHAR(200) NOT NULL,
    exercise_type VARCHAR(50) CHECK (exercise_type IN ('cardio', 'strength', 'flexibility', 'balance', 'sports', 'other')),
    duration_minutes INTEGER,
    sets INTEGER,
    reps INTEGER,
    weight_kg DECIMAL(6,2),
    distance_km DECIMAL(6,2),
    calories_burned DECIMAL(8,2),
    intensity VARCHAR(20) CHECK (intensity IN ('low', 'moderate', 'high', 'very_high')),
    notes TEXT,
    exercise_date DATE NOT NULL,
    exercise_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sleep Log table - เก็บบันทึกการนอน
CREATE TABLE sleep_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    sleep_date DATE NOT NULL,
    bedtime TIME,
    wake_time TIME,
    total_sleep_hours DECIMAL(4,2),
    sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
    deep_sleep_hours DECIMAL(4,2),
    rem_sleep_hours DECIMAL(4,2),
    light_sleep_hours DECIMAL(4,2),
    sleep_notes TEXT,
    factors_affecting_sleep TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Water Log table - เก็บบันทึกการดื่มน้ำ
CREATE TABLE water_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount_ml INTEGER NOT NULL,
    drink_type VARCHAR(50) DEFAULT 'water' CHECK (drink_type IN ('water', 'tea', 'coffee', 'juice', 'sports_drink', 'other')),
    consumed_at TIMESTAMP NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Health Metrics table - เก็บข้อมูลสุขภาพทั่วไป
CREATE TABLE health_metrics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    heart_rate INTEGER,
    body_temperature DECIMAL(4,1),
    blood_sugar_mg_dl DECIMAL(5,2),
    cholesterol_total INTEGER,
    cholesterol_hdl INTEGER,
    cholesterol_ldl INTEGER,
    triglycerides INTEGER,
    bmi DECIMAL(4,2),
    body_fat_percentage DECIMAL(4,2),
    muscle_mass_kg DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat Sessions table - เก็บประวัติการแชทกับ AI
CREATE TABLE chat_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_title VARCHAR(200),
    ai_model VARCHAR(50) DEFAULT 'Claude Sonnet 4',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Chat Messages table - เก็บข้อความในแชท
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    is_user_message BOOLEAN NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'voice')),
    ai_response_quality INTEGER CHECK (ai_response_quality >= 1 AND ai_response_quality <= 5),
    user_feedback VARCHAR(20) CHECK (user_feedback IN ('thumbs_up', 'thumbs_down', 'none'))
);

-- Notifications table - เก็บการแจ้งเตือน
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) CHECK (notification_type IN ('reminder', 'achievement', 'alert', 'info', 'goal_update')),
    is_read BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    scheduled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- AI Insights table - เก็บข้อมูลเชิงลึกจาก AI
CREATE TABLE ai_insights (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN ('health_trend', 'nutrition_advice', 'exercise_recommendation', 'lifestyle_suggestion', 'risk_assessment', 'goal_progress')),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    data_sources TEXT[],
    actionable_items TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_implemented BOOLEAN DEFAULT FALSE
);

-- User Preferences table - เก็บการตั้งค่าผู้ใช้
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    language VARCHAR(10) DEFAULT 'th' CHECK (language IN ('th', 'en')),
    timezone VARCHAR(50) DEFAULT 'Asia/Bangkok',
    measurement_unit VARCHAR(20) DEFAULT 'metric' CHECK (measurement_unit IN ('metric', 'imperial')),
    notification_email BOOLEAN DEFAULT TRUE,
    notification_push BOOLEAN DEFAULT TRUE,
    notification_sms BOOLEAN DEFAULT FALSE,
    privacy_level VARCHAR(20) DEFAULT 'standard' CHECK (privacy_level IN ('minimal', 'standard', 'detailed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES สำหรับเพิ่มประสิทธิภาพ
-- =====================================================

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Indexes for health_goals table
CREATE INDEX idx_health_goals_user_id ON health_goals(user_id);
CREATE INDEX idx_health_goals_status ON health_goals(status);
CREATE INDEX idx_health_goals_target_date ON health_goals(target_date);

-- Indexes for food_log table
CREATE INDEX idx_food_log_user_id ON food_log(user_id);
CREATE INDEX idx_food_log_consumed_at ON food_log(consumed_at);
CREATE INDEX idx_food_log_meal_type ON food_log(meal_type);

-- Indexes for exercise_log table
CREATE INDEX idx_exercise_log_user_id ON exercise_log(user_id);
CREATE INDEX idx_exercise_log_exercise_date ON exercise_log(exercise_date);
CREATE INDEX idx_exercise_log_exercise_type ON exercise_log(exercise_type);

-- Indexes for sleep_log table
CREATE INDEX idx_sleep_log_user_id ON sleep_log(user_id);
CREATE INDEX idx_sleep_log_sleep_date ON sleep_log(sleep_date);

-- Indexes for water_log table
CREATE INDEX idx_water_log_user_id ON water_log(user_id);
CREATE INDEX idx_water_log_consumed_at ON water_log(consumed_at);

-- Indexes for health_metrics table
CREATE INDEX idx_health_metrics_user_id ON health_metrics(user_id);
CREATE INDEX idx_health_metrics_metric_date ON health_metrics(metric_date);

-- Indexes for chat_sessions table
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at);

-- Indexes for chat_messages table
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp);

-- Indexes for notifications table
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_scheduled_at ON notifications(scheduled_at);

-- Indexes for ai_insights table
CREATE INDEX idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX idx_ai_insights_insight_type ON ai_insights(insight_type);
CREATE INDEX idx_ai_insights_created_at ON ai_insights(created_at);

-- =====================================================
-- TRIGGERS สำหรับอัพเดท updated_at
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_goals_updated_at BEFORE UPDATE ON health_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA สำหรับทดสอบ
-- =====================================================

-- Insert sample user
INSERT INTO users (username, email, password_hash, first_name, last_name, date_of_birth, gender, height_cm, weight_kg, activity_level) 
VALUES ('testuser', 'test@example.com', 'hashed_password_here', 'ทดสอบ', 'ผู้ใช้', '1990-01-01', 'male', 170.0, 70.0, 'moderately_active');

-- Insert sample health goal
INSERT INTO health_goals (user_id, goal_type, title, description, target_value, unit, start_date, target_date, priority)
VALUES (1, 'weight_loss', 'ลดน้ำหนัก 5 กิโลกรัม', 'ลดน้ำหนักเพื่อสุขภาพที่ดีขึ้น', 5.0, 'kg', CURRENT_DATE, CURRENT_DATE + INTERVAL '3 months', 'high');

-- Insert sample food log
INSERT INTO food_log (user_id, meal_type, food_name, quantity, unit, calories, protein_g, carbs_g, fat_g, consumed_at)
VALUES (1, 'breakfast', 'ข้าวต้มปลา', 1, 'bowl', 300, 25, 45, 8, CURRENT_TIMESTAMP);

-- Insert sample exercise log
INSERT INTO exercise_log (user_id, exercise_name, exercise_type, duration_minutes, calories_burned, intensity, exercise_date)
VALUES (1, 'เดินเร็ว', 'cardio', 30, 150, 'moderate', CURRENT_DATE);

-- Insert sample sleep log
INSERT INTO sleep_log (user_id, sleep_date, bedtime, wake_time, total_sleep_hours, sleep_quality)
VALUES (1, CURRENT_DATE, '22:00:00', '06:00:00', 8.0, 8);

-- Insert sample water log
INSERT INTO water_log (user_id, amount_ml, consumed_at)
VALUES (1, 250, CURRENT_TIMESTAMP);

-- =====================================================
-- VIEWS สำหรับข้อมูลที่ใช้บ่อย
-- =====================================================

-- View สำหรับสรุปสุขภาพประจำวัน
CREATE VIEW daily_health_summary AS
SELECT 
    u.id as user_id,
    u.first_name,
    u.last_name,
    CURRENT_DATE as summary_date,
    COALESCE(SUM(fl.calories), 0) as total_calories,
    COALESCE(SUM(el.calories_burned), 0) as total_calories_burned,
    COALESCE(SUM(wl.amount_ml), 0) as total_water_ml,
    COALESCE(sl.total_sleep_hours, 0) as sleep_hours,
    COALESCE(sl.sleep_quality, 0) as sleep_quality
FROM users u
LEFT JOIN food_log fl ON u.id = fl.user_id AND DATE(fl.consumed_at) = CURRENT_DATE
LEFT JOIN exercise_log el ON u.id = el.user_id AND el.exercise_date = CURRENT_DATE
LEFT JOIN water_log wl ON u.id = wl.user_id AND DATE(wl.consumed_at) = CURRENT_DATE
LEFT JOIN sleep_log sl ON u.id = sl.user_id AND sl.sleep_date = CURRENT_DATE
GROUP BY u.id, u.first_name, u.last_name, sl.total_sleep_hours, sl.sleep_quality;

-- View สำหรับเป้าหมายสุขภาพที่กำลังดำเนินการ
CREATE VIEW active_health_goals AS
SELECT 
    u.first_name,
    u.last_name,
    hg.title,
    hg.goal_type,
    hg.target_value,
    hg.current_value,
    hg.unit,
    hg.target_date,
    hg.priority,
    ROUND(((hg.current_value / hg.target_value) * 100), 2) as progress_percentage
FROM health_goals hg
JOIN users u ON hg.user_id = u.id
WHERE hg.status = 'active'
ORDER BY hg.priority DESC, hg.target_date ASC;

-- =====================================================
-- COMMENTS และคำอธิบาย
-- =====================================================

COMMENT ON TABLE users IS 'ตารางเก็บข้อมูลผู้ใช้หลักของระบบ';
COMMENT ON TABLE health_goals IS 'ตารางเก็บเป้าหมายสุขภาพของผู้ใช้';
COMMENT ON TABLE food_log IS 'ตารางเก็บบันทึกการรับประทานอาหาร';
COMMENT ON TABLE exercise_log IS 'ตารางเก็บบันทึกการออกกำลังกาย';
COMMENT ON TABLE sleep_log IS 'ตารางเก็บบันทึกการนอนหลับ';
COMMENT ON TABLE water_log IS 'ตารางเก็บบันทึกการดื่มน้ำ';
COMMENT ON TABLE health_metrics IS 'ตารางเก็บข้อมูลสุขภาพทั่วไป';
COMMENT ON TABLE chat_sessions IS 'ตารางเก็บเซสชันการแชทกับ AI';
COMMENT ON TABLE chat_messages IS 'ตารางเก็บข้อความในแชท';
COMMENT ON TABLE notifications IS 'ตารางเก็บการแจ้งเตือน';
COMMENT ON TABLE ai_insights IS 'ตารางเก็บข้อมูลเชิงลึกจาก AI';
COMMENT ON TABLE user_preferences IS 'ตารางเก็บการตั้งค่าผู้ใช้';

-- =====================================================
-- MAPPING ระหว่างตารางฐานข้อมูลกับหน้าเว็บ
-- =====================================================

/*
📱 หน้าเว็บและตารางฐานข้อมูลที่เกี่ยวข้อง:

🏠 INDEX.TSX (หน้าแรก)
- users: แสดงข้อมูลผู้ใช้, ชื่อ, รูปโปรไฟล์
- health_goals: แสดงเป้าหมายสุขภาพที่กำลังดำเนินการ
- daily_health_summary view: สรุปสุขภาพประจำวัน

📊 DASHBOARD.TSX (แดชบอร์ด)
- users: ข้อมูลส่วนตัว, น้ำหนัก, ส่วนสูง, BMI
- health_goals: เป้าหมายสุขภาพและความคืบหน้า
- food_log: สรุปแคลอรี่ที่รับประทาน
- exercise_log: สรุปการออกกำลังกายและแคลอรี่ที่เผาผลาญ
- sleep_log: คุณภาพการนอน
- water_log: ปริมาณน้ำที่ดื่ม
- health_metrics: ข้อมูลสุขภาพทั่วไป
- daily_health_summary view: สรุปข้อมูลประจำวัน

🍽️ FOODLOG.TSX (บันทึกอาหาร)
- food_log: เพิ่ม/แก้ไข/ลบบันทึกอาหาร
- users: ข้อมูลผู้ใช้สำหรับคำนวณแคลอรี่ที่แนะนำ

🏃 EXERCISELOG.TSX (บันทึกการออกกำลังกาย)
- exercise_log: เพิ่ม/แก้ไข/ลบบันทึกการออกกำลังกาย
- users: ข้อมูลผู้ใช้สำหรับคำนวณแคลอรี่ที่เผาผลาญ

😴 SLEEPLOG.TSX (บันทึกการนอน)
- sleep_log: เพิ่ม/แก้ไข/ลบบันทึกการนอน
- users: ข้อมูลผู้ใช้

💧 WATERLOG.TSX (บันทึกการดื่มน้ำ)
- water_log: เพิ่ม/แก้ไข/ลบบันทึกการดื่มน้ำ
- users: ข้อมูลผู้ใช้

🎯 HEALTHGOALS.TSX (เป้าหมายสุขภาพ)
- health_goals: เพิ่ม/แก้ไข/ลบเป้าหมายสุขภาพ
- users: ข้อมูลผู้ใช้
- active_health_goals view: แสดงเป้าหมายที่กำลังดำเนินการ

💬 CHAT.TSX (แชทกับ AI)
- chat_sessions: สร้างเซสชันแชทใหม่
- chat_messages: เก็บข้อความแชท (ผู้ใช้และ AI)
- users: ข้อมูลผู้ใช้

🤖 AIINSIGHTS.TSX (ข้อมูลเชิงลึกจาก AI)
- ai_insights: แสดงคำแนะนำและข้อมูลเชิงลึกจาก AI
- users: ข้อมูลผู้ใช้
- food_log, exercise_log, sleep_log, water_log: ข้อมูลสำหรับ AI วิเคราะห์

🔔 NOTIFICATIONS.TSX (การแจ้งเตือน)
- notifications: แสดงการแจ้งเตือนต่างๆ
- users: ข้อมูลผู้ใช้

👤 PROFILE.TSX (โปรไฟล์ผู้ใช้)
- users: แสดงและแก้ไขข้อมูลส่วนตัว
- user_preferences: การตั้งค่าผู้ใช้
- health_metrics: ประวัติข้อมูลสุขภาพ

🔐 LOGIN.TSX (เข้าสู่ระบบ)
- users: ตรวจสอบ username/email และ password_hash

📝 REGISTER.TSX (สมัครสมาชิก)
- users: เพิ่มผู้ใช้ใหม่
- user_preferences: สร้างการตั้งค่าเริ่มต้น

🚀 ONBOARDING.TSX (การตั้งค่าเริ่มต้น)
- users: อัพเดทข้อมูลส่วนตัว
- health_goals: สร้างเป้าหมายสุขภาพเริ่มต้น
- user_preferences: ตั้งค่าการแจ้งเตือนและธีม

❌ NOTFOUND.TSX (หน้าไม่พบ)
- ไม่ใช้ฐานข้อมูล

📋 สรุปการใช้งานตาราง:

🔴 ตารางที่ใช้บ่อยที่สุด:
1. users - ใช้ในทุกหน้า
2. health_goals - ใช้ใน Dashboard, Index, HealthGoals, Onboarding
3. food_log - ใช้ใน Dashboard, FoodLog
4. exercise_log - ใช้ใน Dashboard, ExerciseLog
5. sleep_log - ใช้ใน Dashboard, SleepLog
6. water_log - ใช้ใน Dashboard, WaterLog

🟡 ตารางที่ใช้ปานกลาง:
7. chat_sessions & chat_messages - ใช้ใน Chat
8. notifications - ใช้ใน Notifications
9. health_metrics - ใช้ใน Dashboard, Profile
10. user_preferences - ใช้ใน Profile, Onboarding

🟢 ตารางที่ใช้เฉพาะ:
11. ai_insights - ใช้ใน AIInsights

💡 หมายเหตุ:
- Views (daily_health_summary, active_health_goals) ใช้ใน Dashboard และ Index
- Triggers อัพเดท updated_at อัตโนมัติ
- Indexes เพิ่มประสิทธิภาพการค้นหา
- Foreign Keys รักษาความสัมพันธ์ข้อมูล
*/

📊 รายละเอียดการใช้งานฟิลด์ในแต่ละหน้า:

🏠 INDEX.TSX (หน้าแรก)
- users: id, first_name, last_name, profile_image
- health_goals: id, title, goal_type, target_value, current_value, unit, status, priority
- daily_health_summary view: total_calories, total_calories_burned, total_water_ml, sleep_hours, sleep_quality

📊 DASHBOARD.TSX (แดชบอร์ด)
- users: id, first_name, last_name, height_cm, weight_kg, activity_level, created_at
- health_goals: id, title, goal_type, target_value, current_value, unit, start_date, target_date, status, priority
- food_log: id, meal_type, food_name, calories, protein_g, carbs_g, fat_g, consumed_at
- exercise_log: id, exercise_name, exercise_type, duration_minutes, calories_burned, intensity, exercise_date
- sleep_log: id, sleep_date, total_sleep_hours, sleep_quality, bedtime, wake_time
- water_log: id, amount_ml, drink_type, consumed_at
- health_metrics: id, metric_date, bmi, body_fat_percentage, muscle_mass_kg, heart_rate
- daily_health_summary view: summary_date, total_calories, total_calories_burned, total_water_ml, sleep_hours, sleep_quality

🍽️ FOODLOG.TSX (บันทึกอาหาร)
- users: id, height_cm, weight_kg, activity_level (สำหรับคำนวณ BMR และแคลอรี่ที่แนะนำ)
- food_log: id, meal_type, food_name, quantity, unit, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, notes, consumed_at, created_at

🏃 EXERCISELOG.TSX (บันทึกการออกกำลังกาย)
- users: id, height_cm, weight_kg, age (สำหรับคำนวณแคลอรี่ที่เผาผลาญ)
- exercise_log: id, exercise_name, exercise_type, duration_minutes, sets, reps, weight_kg, distance_km, calories_burned, intensity, notes, exercise_date, exercise_time, created_at

😴 SLEEPLOG.TSX (บันทึกการนอน)
- users: id, first_name, last_name
- sleep_log: id, sleep_date, bedtime, wake_time, total_sleep_hours, sleep_quality, deep_sleep_hours, rem_sleep_hours, light_sleep_hours, sleep_notes, factors_affecting_sleep, created_at

💧 WATERLOG.TSX (บันทึกการดื่มน้ำ)
- users: id, first_name, last_name, weight_kg (สำหรับคำนวณปริมาณน้ำที่แนะนำ)
- water_log: id, amount_ml, drink_type, consumed_at, notes, created_at

🎯 HEALTHGOALS.TSX (เป้าหมายสุขภาพ)
- users: id, first_name, last_name, height_cm, weight_kg, activity_level
- health_goals: id, goal_type, title, description, target_value, current_value, unit, start_date, target_date, status, priority, created_at, updated_at
- active_health_goals view: first_name, last_name, title, goal_type, target_value, current_value, unit, target_date, priority, progress_percentage

💬 CHAT.TSX (แชทกับ AI)
- users: id, first_name, last_name, username
- chat_sessions: id, session_title, ai_model, created_at, updated_at, is_active
- chat_messages: id, session_id, user_id, message_text, is_user_message, timestamp, message_type, ai_response_quality, user_feedback

🤖 AIINSIGHTS.TSX (ข้อมูลเชิงลึกจาก AI)
- users: id, first_name, last_name, age, gender, height_cm, weight_kg, activity_level
- ai_insights: id, insight_type, title, description, confidence_score, data_sources, actionable_items, created_at, expires_at, is_implemented
- food_log: calories, protein_g, carbs_g, fat_g, fiber_g, consumed_at (สำหรับวิเคราะห์โภชนาการ)
- exercise_log: exercise_type, duration_minutes, calories_burned, intensity, exercise_date (สำหรับวิเคราะห์การออกกำลังกาย)
- sleep_log: total_sleep_hours, sleep_quality, deep_sleep_hours (สำหรับวิเคราะห์การนอน)
- water_log: amount_ml, consumed_at (สำหรับวิเคราะห์การดื่มน้ำ)
- health_metrics: bmi, body_fat_percentage, heart_rate (สำหรับวิเคราะห์สุขภาพทั่วไป)

🔔 NOTIFICATIONS.TSX (การแจ้งเตือน)
- users: id, first_name, last_name
- notifications: id, title, message, notification_type, is_read, priority, scheduled_at, created_at, read_at

👤 PROFILE.TSX (โปรไฟล์ผู้ใช้)
- users: id, username, email, first_name, last_name, date_of_birth, gender, height_cm, weight_kg, activity_level, created_at, updated_at
- user_preferences: theme, language, timezone, measurement_unit, notification_email, notification_push, notification_sms, privacy_level
- health_metrics: metric_date, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, body_temperature, blood_sugar_mg_dl, cholesterol_total, bmi, body_fat_percentage, muscle_mass_kg

🔐 LOGIN.TSX (เข้าสู่ระบบ)
- users: username, email, password_hash, is_active

📝 REGISTER.TSX (สมัครสมาชิก)
- users: username, email, password_hash, first_name, last_name, date_of_birth, gender, height_cm, weight_kg, activity_level
- user_preferences: theme, language, timezone, measurement_unit, notification_email, notification_push

🚀 ONBOARDING.TSX (การตั้งค่าเริ่มต้น)
- users: id, first_name, last_name, date_of_birth, gender, height_cm, weight_kg, activity_level
- health_goals: user_id, goal_type, title, description, target_value, unit, start_date, target_date, priority
- user_preferences: user_id, theme, language, timezone, measurement_unit, notification_email, notification_push, privacy_level

❌ NOTFOUND.TSX (หน้าไม่พบ)
- ไม่ใช้ฐานข้อมูล

🔍 ฟิลด์ที่ใช้บ่อยที่สุด:
- users.id: ใช้เป็น Foreign Key ในทุกตาราง
- users.first_name, users.last_name: แสดงชื่อผู้ใช้ในทุกหน้า
- created_at: แสดงเวลาที่สร้างข้อมูล
- updated_at: แสดงเวลาที่อัพเดทล่าสุด
- status: ใช้ใน health_goals และ notifications
- priority: ใช้ใน health_goals และ notifications
- is_active: ใช้ใน users และ chat_sessions
- is_read: ใช้ใน notifications
- is_user_message: ใช้ใน chat_messages
- message_type: ใช้ใน chat_messages
- insight_type: ใช้ใน ai_insights
- notification_type: ใช้ใน notifications
- goal_type: ใช้ใน health_goals
- exercise_type: ใช้ใน exercise_log
- meal_type: ใช้ใน food_log
- drink_type: ใช้ใน water_log
- intensity: ใช้ใน exercise_log
- sleep_quality: ใช้ใน sleep_log
- gender: ใช้ใน users และ ai_insights
- activity_level: ใช้ใน users และ ai_insights

🤖 ระบบหลังบ้านสำหรับ AI Integration:

📡 API ENDPOINTS สำหรับ AI:

1. **AI Data Access Endpoints:**
   - GET /api/ai/user-profile/{user_id} - ข้อมูลโปรไฟล์ผู้ใช้
   - GET /api/ai/health-summary/{user_id} - สรุปสุขภาพรวม
   - GET /api/ai/food-analysis/{user_id} - วิเคราะห์โภชนาการ
   - GET /api/ai/exercise-analysis/{user_id} - วิเคราะห์การออกกำลังกาย
   - GET /api/ai/sleep-analysis/{user_id} - วิเคราะห์การนอน
   - GET /api/ai/goals-progress/{user_id} - ความคืบหน้าเป้าหมาย
   - GET /api/ai/health-trends/{user_id} - แนวโน้มสุขภาพ

2. **AI Chat Endpoints:**
   - POST /api/ai/chat/start - เริ่มเซสชันแชทใหม่
   - POST /api/ai/chat/message - ส่งข้อความไปยัง AI
   - GET /api/ai/chat/history/{session_id} - ประวัติการแชท
   - POST /api/ai/chat/feedback - ให้คะแนนการตอบกลับของ AI

3. **AI Insights Endpoints:**
   - POST /api/ai/analyze - AI วิเคราะห์ข้อมูลสุขภาพ
   - GET /api/ai/recommendations/{user_id} - คำแนะนำจาก AI
   - POST /api/ai/insights/save - บันทึกข้อมูลเชิงลึกจาก AI

🔐 การเข้าถึงข้อมูลสำหรับ AI:

1. **Authentication & Authorization:**
   - AI ต้องมี API Key หรือ JWT Token
   - ตรวจสอบสิทธิ์การเข้าถึงข้อมูลผู้ใช้
   - Rate limiting เพื่อป้องกันการใช้งานมากเกินไป

2. **Data Access Patterns:**
   - AI สามารถอ่านข้อมูลได้ (Read-only access)
   - ไม่สามารถแก้ไขหรือลบข้อมูลได้
   - เข้าถึงข้อมูลผ่าน API endpoints ที่กำหนดไว้

3. **Data Privacy:**
   - เข้ารหัสข้อมูลที่ส่งไปยัง AI
   - ไม่ส่งข้อมูลส่วนตัวที่ไม่จำเป็น
   - Implement data retention policies
   - ให้ผู้ใช้ควบคุมการแชร์ข้อมูล

📊 ข้อมูลที่ AI ต้องการสำหรับการวิเคราะห์:

1. **ข้อมูลพื้นฐานผู้ใช้:**
   - อายุ, เพศ, น้ำหนัก, ส่วนสูง, ระดับกิจกรรม
   - เป้าหมายสุขภาพ
   - การตั้งค่าส่วนตัว

2. **ข้อมูลสุขภาพปัจจุบัน:**
   - น้ำหนักล่าสุด, BMI, เปอร์เซ็นต์ไขมัน
   - ความดันโลหิต, อัตราการเต้นหัวใจ
   - ข้อมูลการนอนล่าสุด

3. **ข้อมูลพฤติกรรม:**
   - ประวัติการรับประทานอาหาร 7-30 วัน
   - ประวัติการออกกำลังกาย 7-30 วัน
   - ประวัติการนอน 7-30 วัน
   - ประวัติการดื่มน้ำ 7-30 วัน

4. **ข้อมูลแนวโน้ม:**
   - การเปลี่ยนแปลงน้ำหนัก
   - การเปลี่ยนแปลงการออกกำลังกาย
   - การเปลี่ยนแปลงคุณภาพการนอน

🧠 AI Analysis Capabilities:

1. **Nutrition Analysis:**
   - วิเคราะห์ความสมดุลของสารอาหาร
   - แนะนำอาหารที่เหมาะสม
   - คำนวณแคลอรี่ที่แนะนำ

2. **Exercise Recommendations:**
   - แนะนำประเภทการออกกำลังกาย
   - คำนวณความเข้มข้นที่เหมาะสม
   - แนะนำโปรแกรมการออกกำลังกาย

3. **Sleep Optimization:**
   - วิเคราะห์รูปแบบการนอน
   - แนะนำเวลานอนที่เหมาะสม
   - แนะนำวิธีปรับปรุงคุณภาพการนอน

4. **Health Trend Analysis:**
   - วิเคราะห์แนวโน้มสุขภาพ
   - ระบุปัจจัยเสี่ยง
   - แนะนำการปรับพฤติกรรม

5. **Goal Progress Tracking:**
   - วิเคราะห์ความคืบหน้าเป้าหมาย
   - แนะนำการปรับเป้าหมาย
   - ให้กำลังใจและแรงจูงใจ

💻 การ Implement หลังบ้าน:

1. **Database Queries:**
   ```sql
   -- ตัวอย่าง: ดึงข้อมูลสุขภาพรวมสำหรับ AI
   SELECT 
       u.id, u.first_name, u.last_name, u.age, u.gender,
       u.height_cm, u.weight_kg, u.activity_level,
       hg.title as goal_title, hg.goal_type, hg.target_value,
       hg.current_value, hg.status,
       AVG(fl.calories) as avg_daily_calories,
       AVG(el.calories_burned) as avg_daily_exercise,
       AVG(sl.sleep_quality) as avg_sleep_quality,
       AVG(wl.amount_ml) as avg_daily_water
   FROM users u
   LEFT JOIN health_goals hg ON u.id = hg.user_id AND hg.status = 'active'
   LEFT JOIN food_log fl ON u.id = fl.user_id AND fl.consumed_at >= CURRENT_DATE - INTERVAL '7 days'
   LEFT JOIN exercise_log el ON u.id = el.user_id AND el.exercise_date >= CURRENT_DATE - INTERVAL '7 days'
   LEFT JOIN sleep_log sl ON u.id = sl.user_id AND sl.sleep_date >= CURRENT_DATE - INTERVAL '7 days'
   LEFT JOIN water_log wl ON u.id = wl.user_id AND wl.consumed_at >= CURRENT_DATE - INTERVAL '7 days'
   WHERE u.id = $1
   GROUP BY u.id, u.first_name, u.last_name, u.age, u.gender,
            u.height_cm, u.weight_kg, u.activity_level,
            hg.title, hg.goal_type, hg.target_value, hg.current_value, hg.status;
   ```

2. **AI Service Layer:**
   ```typescript
   // ตัวอย่าง: AI Service สำหรับวิเคราะห์สุขภาพ
   class AIHealthService {
     async analyzeUserHealth(userId: string) {
       // ดึงข้อมูลผู้ใช้
       const userData = await this.getUserHealthData(userId);
       
       // ส่งข้อมูลไปยัง AI Model
       const aiAnalysis = await this.callAIModel(userData);
       
       // บันทึกผลการวิเคราะห์
       await this.saveAIInsight(userId, aiAnalysis);
       
       return aiAnalysis;
     }
     
     async generateHealthRecommendations(userId: string) {
       const userData = await this.getUserHealthData(userId);
       const aiInsights = await this.getAIInsights(userId);
       
       return await this.callAIModel({
         ...userData,
         previousInsights: aiInsights,
         requestType: 'recommendations'
       });
     }
   }
   ```

3. **Chat Integration:**
   ```typescript
   // ตัวอย่าง: AI Chat Service
   class AIChatService {
     async processUserMessage(sessionId: string, userId: string, message: string) {
       // ดึงข้อมูลสุขภาพผู้ใช้
       const healthContext = await this.getHealthContext(userId);
       
       // สร้าง prompt สำหรับ AI
       const prompt = this.buildAIPrompt(message, healthContext);
       
       // ส่งไปยัง AI Model
       const aiResponse = await this.callAIModel(prompt);
       
       // บันทึกข้อความ
       await this.saveChatMessage(sessionId, userId, message, aiResponse);
       
       return aiResponse;
     }
   }
   ```

🔒 Security Considerations:

1. **API Security:**
   - ใช้ HTTPS สำหรับการสื่อสารทั้งหมด
   - Implement API rate limiting
   - ใช้ JWT tokens สำหรับ authentication
   - Validate และ sanitize input data

2. **Data Privacy:**
   - เข้ารหัสข้อมูลที่ส่งไปยัง AI
   - ไม่เก็บข้อมูลส่วนตัวที่ไม่จำเป็น
   - Implement data retention policies
   - ให้ผู้ใช้ควบคุมการแชร์ข้อมูล

3. **AI Model Security:**
   - ใช้ AI models ที่ปลอดภัยและเชื่อถือได้
   - ตรวจสอบ output จาก AI
   - ไม่ส่งข้อมูลที่ละเอียดอ่อนไปยัง AI
   - Implement fallback responses

📈 การ Monitor และ Analytics:

1. **Performance Monitoring:**
   - Response time ของ AI API
   - Accuracy ของคำแนะนำจาก AI
   - User satisfaction scores
   - Error rates และ debugging

2. **Usage Analytics:**
   - จำนวนการใช้งาน AI features
   - ประเภทคำถามที่พบบ่อย
   - ความนิยมของคำแนะนำต่างๆ
   - User engagement patterns

3. **AI Model Performance:**
   - Model accuracy metrics
   - Response quality scores
   - User feedback analysis
   - Continuous model improvement
