import os
import mysql.connector
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date
from dotenv import load_dotenv
import bcrypt  # Direct use of bcrypt instead of passlib

# Load environment variables
load_dotenv()

app = FastAPI(title="NutriTrip Auth Service")

# Password Hashing
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    if isinstance(hashed_password, str):
        hashed_password = hashed_password.encode('utf-8')
    if isinstance(plain_password, str):
        plain_password = plain_password.encode('utf-8')
    return bcrypt.checkpw(plain_password, hashed_password)

def get_password_hash(password):
    if isinstance(password, str):
        password = password.encode('utf-8')
    # Generate a salt and hash the password
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password, salt).decode('utf-8')

# Database Connection
def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", "root"),
            database=os.getenv("DB_NAME", "nutritrip"),
            port=int(os.getenv("DB_PORT", 3306))
        )
        return connection
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database connection error: {err}")

# Pydantic Models
class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    nome: str
    dob: date
    genero: str = Field(..., pattern="^(M|F|O)$")
    ultimo_periodo: Optional[date] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    nome: str
    token: str  # Simplified token for now

# Endpoints

@app.post("/auth/signup", response_model=UserResponse)
def signup(user: UserSignup):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Check if user already exists
        cursor.execute("SELECT * FROM Utilizador WHERE Email = %s", (user.email,))
        existing_user = cursor.fetchone()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Generate ID (since no AUTO_INCREMENT)
        cursor.execute("SELECT MAX(Id) as max_id FROM Utilizador")
        result = cursor.fetchone()
        next_id = 1
        if result and result['max_id'] is not None:
            next_id = result['max_id'] + 1

        # Hash password
        hashed_password = get_password_hash(user.password)

        # Insert user
        query = """
            INSERT INTO Utilizador (Id, Email, Password, Nome, Dob, Genero, UltimoPeriodo)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            next_id,
            user.email,
            hashed_password,
            user.nome,
            user.dob,
            user.genero,
            user.ultimo_periodo
        )
        cursor.execute(query, values)
        conn.commit()

        return {
            "id": next_id,
            "email": user.email,
            "nome": user.nome,
            "token": "fake-jwt-token-for-demo"
        }

    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        conn.close()

@app.post("/auth/login", response_model=UserResponse)
def login(user: UserLogin):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Fetch user
        cursor.execute("SELECT * FROM Utilizador WHERE Email = %s", (user.email,))
        db_user = cursor.fetchone()

        if not db_user:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # Verify password
        if not verify_password(user.password, db_user['Password']):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        return {
            "id": db_user['Id'],
            "email": db_user['Email'],
            "nome": db_user['Nome'],
            "token": "fake-jwt-token-for-demo"
        }

    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
