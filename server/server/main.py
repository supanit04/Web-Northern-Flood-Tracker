import uvicorn
# (เพิ่ม) 1. Import Regressor สำหรับโมเดลใหม่
import xgboost as xgb
from xgboost import XGBClassifier, XGBRegressor 
import pandas as pd
from datetime import datetime, timedelta
from typing import Optional, Type

from fastapi import FastAPI
# (แก้ไข) 1. แก้ตัวสะกด (W ตัวเล็ก)
from fastapi.middleware.cors import CORSMiddleware 
from pathlib import Path
from sqlmodel import Field, Session, SQLModel, create_engine, select

# --- 1. (สำคัญ) ที่อยู่ไฟล์ ---
BASE_DIR = Path(__file__).resolve().parent


# --- 2. SQLModel (พิมพ์เขียวฐานข้อมูล) ---

# พิมพ์เขียวสำหรับตาราง 'flooddata' (อันเดิม)
class FloodData(SQLModel, table=True):
    __tablename__ = "flooddata"
    id: Optional[int] = Field(default=None, primary_key=True)
    date: datetime = Field(index=True)
    province: str
    district: str
    subdistrict: str
    rain: Optional[float] = Field(default=None)
    primary_station_water_height: Optional[float] = Field(default=None)
    secondary_station_water_height: Optional[float] = Field(default=None)
    rain_t_minus_1: Optional[float] = Field(default=None)
    rain_sum_3d: Optional[float] = Field(default=None)
    rain_t_minus_2: Optional[float] = Field(default=None)
    rain_sum_7d: Optional[float] = Field(default=None)
    rain_t_plus_1: Optional[float] = Field(default=None)
    rain_t_plus_2: Optional[float] = Field(default=None)
    primary_water_height_t_minus_1: Optional[float] = Field(default=None)
    primary_water_height_t_minus_2: Optional[float] = Field(default=None)
    primary_water_change_1d: Optional[float] = Field(default=None)
    secondary_water_height_t_minus_1: Optional[float] = Field(default=None)
    secondary_water_height_t_minus_2: Optional[float] = Field(default=None)
    secondary_water_change_1d: Optional[float] = Field(default=None)

# (เพิ่ม) พิมพ์เขียวสำหรับตาราง 'rivertest' (อันใหม่)
# (คัดลอกมาจาก import_rivertest.py)
class RiverTestData(SQLModel, table=True):
    __tablename__ = "rivertest"
    id: Optional[int] = Field(default=None, primary_key=True)
    date: datetime = Field(index=True)
    station: Optional[str] = Field(default=None)
    water_lag_1: Optional[float] = Field(default=None)
    water_lag_2: Optional[float] = Field(default=None)
    water_lag_3: Optional[float] = Field(default=None)
    water_lag_4: Optional[float] = Field(default=None)
    water_lag_5: Optional[float] = Field(default=None)
    water_lag_6: Optional[float] = Field(default=None)
    water_lag_7: Optional[float] = Field(default=None)
    water_rolling_mean_7d: Optional[float] = Field(default=None)
    water_rolling_std_7d: Optional[float] = Field(default=None)
    rain_lag_0: Optional[float] = Field(default=None)
    rain_lag_1: Optional[float] = Field(default=None)
    rain_lag_2: Optional[float] = Field(default=None)
    rain_lag_3: Optional[float] = Field(default=None)
    rain_rolling_sum_3d: Optional[float] = Field(default=None)
    rain_rolling_sum_7d: Optional[float] = Field(default=None)
    day_of_year: Optional[int] = Field(default=None)
    month: Optional[int] = Field(default=None)
    day_of_week: Optional[int] = Field(default=None)


# --- 3. โหลดโมเดลทั้งหมด ---

# (เพิ่ม) ตัวแปรสำหรับเก็บโมเดล
loaded_model_t1: Optional[XGBClassifier] = None
loaded_model_t2: Optional[XGBClassifier] = None
loaded_model_t3: Optional[XGBClassifier] = None
loaded_river_model: Optional[XGBRegressor] = None # โมเดลใหม่

# (เพิ่ม) Feature list ที่แน่นอนสำหรับโมเดล river
# (คัดลอกมาจาก feature_names ใน river_model.json)
RIVER_MODEL_FEATURES = [
    "water_lag_1", "water_lag_2", "water_lag_3", "water_lag_4", 
    "water_lag_5", "water_lag_6", "water_lag_7", 
    "water_rolling_mean_7d", "water_rolling_std_7d",
    "rain_lag_0", "rain_lag_1", "rain_lag_2", "rain_lag_3", 
    "rain_rolling_sum_3d", "rain_rolling_sum_7d",
    "day_of_year", "month", "day_of_week"
]

def load_all_models():
    """โหลดโมเดลทั้งหมด (Flood + River) ตอนเริ่มเซิร์ฟเวอร์"""
    global loaded_model_t1, loaded_model_t2, loaded_model_t3, loaded_river_model
    
    # --- โหลดโมเดล Flood (อันเดิม) ---
    try:
        print("กำลังโหลดโมเดล Flood T1, T2, T3...")
        model_path_t1 = BASE_DIR / "flood_model_t1.json"
        model_path_t2 = BASE_DIR / "flood_model_t2.json"
        model_path_t3 = BASE_DIR / "flood_model_t3.json"
        
        loaded_model_t1 = XGBClassifier()
        loaded_model_t1.load_model(str(model_path_t1.as_posix()))
        
        loaded_model_t2 = XGBClassifier()
        loaded_model_t2.load_model(str(model_path_t2.as_posix()))
        
        loaded_model_t3 = XGBClassifier()
        loaded_model_t3.load_model(str(model_path_t3.as_posix()))
        print("โหลดโมเดล Flood สำเร็จ!")
    except Exception as e:
        print(f"!!! Error โหลดโมเดล Flood ไม่สำเร็จ: {e}")

    # --- (เพิ่ม) โหลดโมเดล River (อันใหม่) ---
    try:
        print("กำลังโหลดโมเดล River...")
        model_path_river = BASE_DIR / "river_model.json"
        
        # (สำคัญ) ใช้ XGBRegressor เพราะเป็นการทำนาย "ระดับน้ำ"
        loaded_river_model = XGBRegressor() 
        loaded_river_model.load_model(str(model_path_river.as_posix()))
        print("โหลดโมเดล River สำเร็จ!")
    except Exception as e:
        print(f"!!! Error โหลดโมเดล River ไม่สำเร็จ: {e}")

# สั่งโหลดโมเดลทั้งหมด
load_all_models()

# --- 4. สร้างตัวเชื่อมต่อ Database (Engine) ---
sqlite_file_name = BASE_DIR / "data.db"
sqlite_url = f"sqlite:///{str(sqlite_file_name.as_posix())}"
engine = create_engine(sqlite_url, echo=False)


# --- 5. สร้าง App FastAPI ---
app = FastAPI()

app.add_middleware(
    # (แก้ไข) 2. แก้ตัวสะกด (W ตัวเล็ก)
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 6. สร้าง Endpoints (API) ---

@app.get("/")
def home():
    return {"message": "Flood Prediction API is running. Use /FloodData or /RiverData"}


# (ปรับปรุง) ฟังก์ชันย่อยสำหรับ Query (ใช้ร่วมกัน)
def get_data_for_date(session: Session, target_date: datetime, model_class: Type[SQLModel]):
    """
    ฟังก์ชันย่อย: สำหรับดึงข้อมูลจาก DB ตามวันที่ และตามตาราง (model_class)
    """
    query_date = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
    print(f"กำลังดึงข้อมูลจำลองสำหรับวันที่: {query_date.date()} (ตาราง: {model_class.__tablename__})")
    
    # ใช้ model_class ที่รับเข้ามาเพื่อ query ตารางที่ถูกต้อง
    statement = select(model_class).where(model_class.date == query_date) 
    db_results = session.exec(statement).all()
    
    return db_results, query_date.date()


@app.get("/FloodData")
def get_flood_prediction():
    """
    API 1: สำหรับทำนาย "การเกิดน้ำท่วม" (ตาราง: flooddata)
    """
    try:
        if not all([loaded_model_t1, loaded_model_t2, loaded_model_t3]):
            return {"status": "error", "message": "โมเดล Flood (T1,T2,T3) ไม่พร้อมใช้งาน"}

        yesterday = datetime.now() - timedelta(days=1)
        simulation_date = yesterday.replace(year=2024)
        
        with Session(engine) as session:
            # (ปรับปรุง) ใช้ฟังก์ชันย่อย
            db_results, date_used = get_data_for_date(session, simulation_date, FloodData)

            if not db_results:
                print(f"ไม่พบข้อมูล Flood วันที่ {date_used}, ลองค้นหาข้อมูลสำรอง (2024-01-01)...")
                demo_fallback_date = datetime(year=2024, month=1, day=1)
                db_results, date_used = get_data_for_date(session, demo_fallback_date, FloodData)

                if not db_results:
                    return {"status": "error", "message": "ไม่พบข้อมูล Flood ในฐานข้อมูล"}
        
        dataset_for_predict = pd.DataFrame([row.model_dump() for row in db_results])
        X_numeric = dataset_for_predict.select_dtypes(include=['number'])
        if 'id' in X_numeric.columns:
            X_numeric = X_numeric.drop(columns=['id'])
            
        if X_numeric.empty:
            return {"status": "error", "message": "ไม่พบข้อมูล (features) Flood สำหรับ predict"}

        # (เหมือนเดิม) แปลงชื่อกลับสำหรับโมเดล Flood
        REVERSE_FEATURE_MAP = {
            'rain': 'Rain', 'primary_station_water_height': 'Primary_Station_Water_Height',
            'secondary_station_water_height': 'Secondary_Station_Water_Height', 'rain_t_minus_1': 'Rain(T-1)',
            'rain_sum_3d': 'Rain_Sum_3D', 'rain_t_minus_2': 'Rain(T-2)', 'rain_sum_7d': 'Rain_Sum_7D',
            'rain_t_plus_1': 'Rain(T+1)', 'rain_t_plus_2': 'Rain(T+2)', 'primary_water_height_t_minus_1': 'Primary_Water_Height(T-1)',
            'primary_water_height_t_minus_2': 'Primary_Water_Height(T-2)', 'primary_water_change_1d': 'Primary_Water_Change_1D',
            'secondary_water_height_t_minus_1': 'Secondary_Water_Height(T-1)', 'secondary_water_height_t_minus_2': 'Secondary_Water_Height(T-2)',
            'secondary_water_change_1d': 'Secondary_Water_Change_1D'
        }
        features_we_have = [col for col in REVERSE_FEATURE_MAP.keys() if col in X_numeric.columns]
        X_renamed = X_numeric[features_we_have].rename(columns=REVERSE_FEATURE_MAP)

        # รันโมเดล Flood
        y_pred_t1 = loaded_model_t1.predict(X_renamed)
        y_pred_t2 = loaded_model_t2.predict(X_renamed)
        y_pred_t3 = loaded_model_t3.predict(X_renamed)

        # สร้างผลลัพธ์ Flood
        identifier_cols = ['date', 'province', 'district', 'subdistrict']
        final_results_df = dataset_for_predict[identifier_cols].copy()
        final_results_df['date'] = final_results_df['date'].dt.strftime('%Y-%m-%d')
        final_results_df['Flood_T+1_Pred'] = y_pred_t1.astype(int)
        final_results_df['Flood_T+2_Pred'] = y_pred_t2.astype(int)
        final_results_df['Flood_T+3_Pred'] = y_pred_t3.astype(int)
        
        data = final_results_df.to_dict(orient="records")
        return {"status": "ok", "simulation_date_used": str(date_used), "count": len(data), "data": data}

    except Exception as e:
        print(f"!!! Error ใน /FloodData: {e}") 
        return {"status": "error", "message": str(e)}


# --- (เพิ่ม) Endpoint ใหม่ ---
@app.get("/RiverData")
def get_river_prediction():
    """
    API 2: สำหรับทำนาย "ระดับน้ำ" (ตาราง: rivertest)
    """
    try:
        # 1. ตรวจสอบโมเดล River
        if not loaded_river_model:
            return {"status": "error", "message": "โมเดล River ไม่พร้อมใช้งาน"}

        # 2. หาวันที่
        yesterday = datetime.now() - timedelta(days=1)
        simulation_date = yesterday.replace(year=2024)
        
        # 3. Query ข้อมูลจากตาราง 'rivertest'
        with Session(engine) as session:
            # (ปรับปรุง) ใช้ฟังก์ชันย่อย
            db_results, date_used = get_data_for_date(session, simulation_date, RiverTestData)

            # (ปรับปรุง) Fallback
            if not db_results:
                print(f"ไม่พบข้อมูล River วันที่ {date_used}, ลองค้นหาข้อมูลสำรอง (2024-01-01)...")
                demo_fallback_date = datetime(year=2024, month=1, day=1)
                db_results, date_used = get_data_for_date(session, demo_fallback_date, RiverTestData)

                if not db_results:
                    return {"status": "error", "message": "ไม่พบข้อมูล River ในฐานข้อมูล"}
        
        # 4. แปลงผลลัพธ์เป็น DataFrame
        dataset_for_predict = pd.DataFrame([row.model_dump() for row in db_results])

        # 5. เตรียมข้อมูล (X) สำหรับเข้าโมเดล
        # (ง่ายกว่าเดิม) ตรวจสอบว่ามี features ที่โมเดลต้องการหรือไม่
        if not all(feature in dataset_for_predict.columns for feature in RIVER_MODEL_FEATURES):
            return {"status": "error", "message": "ข้อมูลใน DB ขาด features ที่โมเดล River ต้องการ"}
        
        # กรองเฉพาะ features ที่โมเดลต้องการ
        X_features = dataset_for_predict[RIVER_MODEL_FEATURES]
            
        # 6. รันโมเดล!
        print("กำลังทำนายระดับน้ำ (River)...")
        # นี่คือการทำนาย "ระดับน้ำ" (จะได้ค่า float เช่น 2.53)
        y_pred_water_level = loaded_river_model.predict(X_features)

        # 7. สร้างตารางผลลัพธ์
        identifier_cols = ['date', 'station'] # ตารางนี้ใช้ 'station'
        
        final_results_df = dataset_for_predict[identifier_cols].copy()
        final_results_df['date'] = final_results_df['date'].dt.strftime('%Y-%m-%d')
        
        # เพิ่มคอลัมน์ผลการทำนาย (ระดับน้ำ)
        # (อาจจะปัดทศนิยมให้สวยงาม)
        final_results_df['WaterLevel_Pred'] = [round(val, 2) for val in y_pred_water_level]
        
        # 8. แปลงเป็น dict (JSON) เพื่อส่งกลับ
        data = final_results_df.to_dict(orient="records")
        
        return {
            "status": "ok", 
            "simulation_date_used": str(date_used), 
            "count": len(data),
            "data": data
        }

    except Exception as e:
        print(f"!!! Error ใน /RiverData: {e}") 
        return {"status": "error", "message": str(e)}


# --- 7. สั่งรันเซิร์ฟเวอร์ ---
if __name__ == "__main__":
    print("--- รันเซิร์ฟเวอร์ FastAPI โดยตรง (สำหรับทดสอบ) ---")
    uvicorn.run(app, host="127.0.0.1", port=8000)