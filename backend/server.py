from fastapi import FastAPI, APIRouter, HTTPException, Depends, File, UploadFile, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import random
from passlib.context import CryptContext
import base64
from io import BytesIO
from PIL import Image
from collections import Counter
import colorsys
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'milan_readymades_secret_key_2025')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer()

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# OpenAI Configuration
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Predefined color palette with hex codes (for actual color swatches)
COLOR_PALETTE = [
    {"name": "Black", "hex": "#000000"},
    {"name": "White", "hex": "#FFFFFF"},
    {"name": "Red", "hex": "#FF0000"},
    {"name": "Blue", "hex": "#0000FF"},
    {"name": "Green", "hex": "#008000"},
    {"name": "Yellow", "hex": "#FFFF00"},
    {"name": "Orange", "hex": "#FFA500"},
    {"name": "Purple", "hex": "#800080"},
    {"name": "Pink", "hex": "#FFC0CB"},
    {"name": "Brown", "hex": "#8B4513"},
    {"name": "Grey", "hex": "#808080"},
    {"name": "Navy Blue", "hex": "#000080"},
    {"name": "Sky Blue", "hex": "#87CEEB"},
    {"name": "Royal Blue", "hex": "#4169E1"},
    {"name": "Turquoise", "hex": "#40E0D0"},
    {"name": "Teal", "hex": "#008080"},
    {"name": "Mint Green", "hex": "#98FF98"},
    {"name": "Lime Green", "hex": "#32CD32"},
    {"name": "Olive Green", "hex": "#556B2F"},
    {"name": "Forest Green", "hex": "#228B22"},
    {"name": "Maroon", "hex": "#800000"},
    {"name": "Burgundy", "hex": "#800020"},
    {"name": "Crimson", "hex": "#DC143C"},
    {"name": "Coral", "hex": "#FF7F50"},
    {"name": "Salmon", "hex": "#FA8072"},
    {"name": "Peach", "hex": "#FFE5B4"},
    {"name": "Gold", "hex": "#FFD700"},
    {"name": "Silver", "hex": "#C0C0C0"},
    {"name": "Bronze", "hex": "#CD7F32"},
    {"name": "Beige", "hex": "#F5F5DC"},
    {"name": "Cream", "hex": "#FFFDD0"},
    {"name": "Ivory", "hex": "#FFFFF0"},
    {"name": "Tan", "hex": "#D2B48C"},
    {"name": "Khaki", "hex": "#C3B091"},
    {"name": "Mustard", "hex": "#FFDB58"},
    {"name": "Ochre", "hex": "#CC7722"},
    {"name": "Lavender", "hex": "#E6E6FA"},
    {"name": "Violet", "hex": "#EE82EE"},
    {"name": "Indigo", "hex": "#4B0082"},
    {"name": "Mauve", "hex": "#E0B0FF"},
    {"name": "Magenta", "hex": "#FF00FF"},
    {"name": "Fuchsia", "hex": "#FF00FF"},
    {"name": "Rose", "hex": "#FF007F"},
    {"name": "Wine", "hex": "#722F37"},
    {"name": "Rust", "hex": "#B7410E"},
    {"name": "Terracotta", "hex": "#E2725B"},
    {"name": "Copper", "hex": "#B87333"},
    {"name": "Chocolate", "hex": "#D2691E"},
    {"name": "Coffee", "hex": "#6F4E37"},
    {"name": "Caramel", "hex": "#FFD59A"},
    {"name": "Honey", "hex": "#FFC30B"},
    {"name": "Amber", "hex": "#FFBF00"},
    {"name": "Charcoal", "hex": "#36454F"},
    {"name": "Slate", "hex": "#708090"},
    {"name": "Steel Grey", "hex": "#71797E"},
    {"name": "Pearl", "hex": "#EAE0C8"},
    {"name": "Powder Blue", "hex": "#B0E0E6"},
    {"name": "Baby Pink", "hex": "#F4C2C2"},
    {"name": "Lemon", "hex": "#FFF44F"},
    {"name": "Lilac", "hex": "#C8A2C8"},
    {"name": "Mint", "hex": "#3EB489"},
    {"name": "Aqua", "hex": "#00FFFF"},
    {"name": "Cerulean", "hex": "#007BA7"},
    {"name": "Cobalt", "hex": "#0047AB"},
    {"name": "Sapphire", "hex": "#0F52BA"},
    {"name": "Periwinkle", "hex": "#CCCCFF"},
    {"name": "Emerald", "hex": "#50C878"},
    {"name": "Jade", "hex": "#00A86B"},
    {"name": "Seafoam", "hex": "#93E9BE"},
    {"name": "Olive", "hex": "#808000"},
    {"name": "Chartreuse", "hex": "#7FFF00"},
    {"name": "Pear", "hex": "#D1E231"},
    {"name": "Pistachio", "hex": "#93C572"},
    {"name": "Raspberry", "hex": "#E30B5C"},
    {"name": "Cherry", "hex": "#DE3163"},
    {"name": "Strawberry", "hex": "#FC5A8D"},
    {"name": "Watermelon", "hex": "#FC6C85"},
    {"name": "Plum", "hex": "#8E4585"},
    {"name": "Eggplant", "hex": "#614051"},
    {"name": "Grape", "hex": "#6F2DA8"},
    {"name": "Mulberry", "hex": "#C54B8C"},
    {"name": "Orchid", "hex": "#DA70D6"},
    {"name": "Carnation", "hex": "#FFA6C9"},
    {"name": "Blush", "hex": "#DE5D83"},
    {"name": "Champagne", "hex": "#F7E7CE"},
    {"name": "Taupe", "hex": "#483C32"},
    {"name": "Sand", "hex": "#C2B280"},
    {"name": "Latte", "hex": "#C9A581"},
    {"name": "Mocha", "hex": "#967969"},
    {"name": "Espresso", "hex": "#4E312D"},
    {"name": "Cinnamon", "hex": "#D2691E"},
    {"name": "Ginger", "hex": "#B06500"},
    {"name": "Nutmeg", "hex": "#81422C"},
    {"name": "Ash", "hex": "#B2BEB5"},
    {"name": "Smoke", "hex": "#738276"},
    {"name": "Graphite", "hex": "#383428"},
    {"name": "Onyx", "hex": "#353839"},
    {"name": "Jet Black", "hex": "#0A0A0A"},
    {"name": "Snow White", "hex": "#FFFAFA"},
    {"name": "Off-White", "hex": "#FAF9F6"},
    {"name": "Ecru", "hex": "#C2B280"}
]

# Fabric options
FABRIC_OPTIONS = [
    "Cotton", "Silk", "Synthetic", "Nylon", "Wool", "Georgette", "Jeans", "Linen",
    "Polyester", "Rayon", "Chiffon", "Velvet", "Satin", "Crepe", "Lycra", "Denim",
    "Canvas", "Khadi", "Muslin", "Organza", "Net", "Brocade", "Chanderi"
]

# Size options
SIZE_OPTIONS_LETTERS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Standard Size"]
SIZE_OPTIONS_NUMBERS = ["16", "18", "20", "22", "24", "26", "28", "30", "32", "34", "36", "38", "40", "42", "44", "46", "48"]

# Kids Age Groups (broader ranges)
AGE_GROUPS = ["0-3", "4-7", "8-11", "12-15"]

# Kids Subcategories
KIDS_SUBCATEGORIES = ["traditional", "casual", "party", "nightwear"]

# Accessories Subcategories
ACCESSORIES_SUBCATEGORIES = ["belts", "towels", "handkerchiefs", "others"]

# ==================== MODELS ====================

class OwnerLogin(BaseModel):
    username: str
    password: str

class OwnerResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ProductImage(BaseModel):
    url: str
    is_primary: bool = False
    color: Optional[str] = None
    sizes: List[str] = []  # Sizes available for this specific image

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    short_description: str = ""
    category: str  # men, women, kids, accessories
    subcategory: str  # traditional, shirts, pants, etc.
    gender: Optional[str] = None  # For kids: boy/girl
    age_group: Optional[str] = None  # For kids: 0-3, 4-7, 8-11, 12-15
    images: List[ProductImage] = []
    fabric: str
    available_colors: List[str] = []
    sizes: List[str] = []
    price: float = 0.0
    description: Optional[str] = None
    is_new_arrival: bool = False  # Tag shown on product (top-right corner)
    show_in_fresh_arrivals: bool = False  # Show in Fresh Arrivals section on homepage
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    short_description: str = ""
    category: str
    subcategory: str
    gender: Optional[str] = None
    age_group: Optional[str] = None
    fabric: str
    available_colors: List[str] = []
    sizes: List[str] = []
    price: float = 0.0
    description: Optional[str] = None
    is_new_arrival: bool = False
    show_in_fresh_arrivals: bool = False

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    short_description: Optional[str] = None
    fabric: Optional[str] = None
    available_colors: Optional[List[str]] = None
    sizes: Optional[List[str]] = None
    price: Optional[float] = None
    description: Optional[str] = None
    is_new_arrival: Optional[bool] = None
    show_in_fresh_arrivals: Optional[bool] = None
    images: Optional[List[ProductImage]] = None

class ColorDetectionResponse(BaseModel):
    suggested_colors: List[str]

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    rating: int
    date: str
    review: str
    location: str

class ReviewCreate(BaseModel):
    name: str
    rating: int
    review: str
    location: str

class ReviewUpdate(BaseModel):
    name: Optional[str] = None
    rating: Optional[int] = None
    review: Optional[str] = None
    location: Optional[str] = None

class PublicReviewCreate(BaseModel):
    name: str
    review: str

class FeedbackSubmit(BaseModel):
    name: str
    message: str

class CartEnquiry(BaseModel):
    items: List[dict]

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    mobile_number: str
    username: Optional[str] = None
    otp: Optional[str] = None
    otp_expiry: Optional[datetime] = None
    is_verified: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SendOTPRequest(BaseModel):
    mobile_number: str

class VerifyOTPRequest(BaseModel):
    mobile_number: str
    otp: str

class CreateAccountRequest(BaseModel):
    mobile_number: str
    username: str

class CartItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    name: str
    image: str
    short_description: str
    price: float
    selected_size: str
    selected_color: str
    is_selected: bool = False
    added_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AddToCartRequest(BaseModel):
    product_id: str
    name: str
    image: str
    short_description: str
    price: float
    selected_size: str
    selected_color: str

# ==================== HELPER FUNCTIONS ====================

def generate_otp():
    """Generate a 6-digit OTP"""
    return ''.join([str(random.randint(0, 9)) for _ in range(6)])

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return username
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def color_distance(rgb1, rgb2):
    """Calculate Euclidean distance between two RGB colors"""
    return sum((a - b) ** 2 for a, b in zip(rgb1, rgb2)) ** 0.5

def find_closest_color(target_rgb, color_palette):
    """Find the closest color name from palette based on RGB values"""
    min_distance = float('inf')
    closest_color = "Unknown"
    
    for color in color_palette:
        palette_rgb = hex_to_rgb(color["hex"])
        distance = color_distance(target_rgb, palette_rgb)
        
        if distance < min_distance:
            min_distance = distance
            closest_color = color["name"]
    
    return closest_color

def is_background_color(rgb):
    """Check if a color is likely a background color (white, very light, or very dark)"""
    r, g, b = rgb
    
    # Check if it's white or very light (RGB values > 240)
    if r > 240 and g > 240 and b > 240:
        return True
    
    # Check if it's very dark/black (RGB values < 15)
    if r < 15 and g < 15 and b < 15:
        return True
    
    # Check if it's very close to pure white
    if abs(r - 255) < 10 and abs(g - 255) < 10 and abs(b - 255) < 10:
        return True
    
    return False

async def detect_color_from_image(image_base64: str) -> dict:
    """Detect primary color from image using image processing"""
    color_names = [c["name"] for c in COLOR_PALETTE]
    
    try:
        # Decode base64 image
        image_data = base64.b64decode(image_base64)
        image = Image.open(BytesIO(image_data))
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize image for faster processing (max 400px on longest side)
        max_size = 400
        if max(image.size) > max_size:
            ratio = max_size / max(image.size)
            new_size = tuple(int(dim * ratio) for dim in image.size)
            image = image.resize(new_size, Image.Resampling.LANCZOS)
        
        # Get all pixels
        pixels = list(image.getdata())
        
        # Filter out background colors (white, very light, very dark)
        filtered_pixels = [pixel for pixel in pixels if not is_background_color(pixel)]
        
        # If too many pixels were filtered, use all pixels
        if len(filtered_pixels) < len(pixels) * 0.1:
            filtered_pixels = pixels
        
        # Count color occurrences
        color_counter = Counter(filtered_pixels)
        
        # Get the top 5 most common colors
        most_common_colors = color_counter.most_common(10)
        
        # Calculate the average of top colors (weighted by frequency)
        total_count = sum(count for _, count in most_common_colors)
        avg_r = sum(color[0] * count for color, count in most_common_colors) / total_count
        avg_g = sum(color[1] * count for color, count in most_common_colors) / total_count
        avg_b = sum(color[2] * count for color, count in most_common_colors) / total_count
        
        dominant_rgb = (int(avg_r), int(avg_g), int(avg_b))
        
        # Find closest color in our palette
        detected_color = find_closest_color(dominant_rgb, COLOR_PALETTE)
        
        logging.info(f"Detected color: {detected_color} (RGB: {dominant_rgb})")
        
        return {"suggested_colors": color_names}
        
    except Exception as e:
        logging.error(f"Color detection error: {str(e)}")
        return {"suggested_colors": color_names}

# ==================== AUTHENTICATION ROUTES ====================

@api_router.post("/owner/login", response_model=OwnerResponse)
async def owner_login(credentials: OwnerLogin):
    """Owner login endpoint"""
    # Hardcoded owner credentials
    OWNER_USERNAME = "owner@milan"
    OWNER_PASSWORD = "Milan@2025"
    
    if credentials.username != OWNER_USERNAME or credentials.password != OWNER_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    access_token = create_access_token(data={"sub": credentials.username})
    return OwnerResponse(access_token=access_token)

@api_router.get("/owner/verify")
async def verify_owner(username: str = Depends(verify_token)):
    """Verify owner token"""
    return {"username": username, "authenticated": True}

# ==================== USER AUTHENTICATION ROUTES ====================

@api_router.post("/auth/send-otp")
async def send_otp(request: SendOTPRequest):
    """Send OTP to mobile number"""
    try:
        mobile_number = request.mobile_number
        
        # Generate OTP
        otp = generate_otp()
        otp_expiry = datetime.now(timezone.utc) + timedelta(minutes=10)
        
        # Check if user exists
        existing_user = await db.users.find_one({"mobile_number": mobile_number})
        
        if existing_user:
            # Update OTP for existing user
            await db.users.update_one(
                {"mobile_number": mobile_number},
                {"$set": {"otp": otp, "otp_expiry": otp_expiry.isoformat()}}
            )
        else:
            # Create new user with OTP
            user = User(
                mobile_number=mobile_number,
                otp=otp,
                otp_expiry=otp_expiry,
                is_verified=False
            )
            doc = user.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            doc['otp_expiry'] = doc['otp_expiry'].isoformat()
            await db.users.insert_one(doc)
        
        # In production, send OTP via SMS service (Twilio, etc.)
        # For now, return OTP in response (ONLY FOR DEVELOPMENT)
        logging.info(f"OTP for {mobile_number}: {otp}")
        
        return {
            "message": "OTP sent successfully",
            "otp": otp,  # Remove this in production
            "expires_in_minutes": 10
        }
    except Exception as e:
        logging.error(f"Send OTP error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send OTP")

@api_router.post("/auth/verify-otp")
async def verify_otp(request: VerifyOTPRequest):
    """Verify OTP and login user"""
    try:
        mobile_number = request.mobile_number
        otp = request.otp
        
        # Find user
        user = await db.users.find_one({"mobile_number": mobile_number})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check OTP
        if user.get("otp") != otp:
            raise HTTPException(status_code=401, detail="Invalid OTP")
        
        # Check OTP expiry
        otp_expiry = datetime.fromisoformat(user.get("otp_expiry"))
        if datetime.now(timezone.utc) > otp_expiry:
            raise HTTPException(status_code=401, detail="OTP expired")
        
        # Mark as verified
        await db.users.update_one(
            {"mobile_number": mobile_number},
            {"$set": {"is_verified": True, "otp": None, "otp_expiry": None}}
        )
        
        # Create JWT token
        access_token = create_access_token(data={"sub": mobile_number, "user_id": user["id"]})
        
        # Check if user has username
        has_username = bool(user.get("username"))
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "has_username": has_username,
            "username": user.get("username"),
            "user_id": user["id"]
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Verify OTP error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to verify OTP")

@api_router.post("/auth/create-account")
async def create_account(request: CreateAccountRequest):
    """Create username for user account"""
    try:
        mobile_number = request.mobile_number
        username = request.username
        
        # Find user
        user = await db.users.find_one({"mobile_number": mobile_number})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if not user.get("is_verified"):
            raise HTTPException(status_code=401, detail="Mobile number not verified")
        
        # Update username
        await db.users.update_one(
            {"mobile_number": mobile_number},
            {"$set": {"username": username}}
        )
        
        return {
            "message": "Account created successfully",
            "username": username
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Create account error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create account")

def verify_user_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify user JWT token"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("user_id")
        mobile_number: str = payload.get("sub")
        if user_id is None or mobile_number is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return {"user_id": user_id, "mobile_number": mobile_number}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

@api_router.get("/auth/me")
async def get_current_user(user_data: dict = Depends(verify_user_token)):
    """Get current user info"""
    user = await db.users.find_one({"id": user_data["user_id"]}, {"_id": 0, "otp": 0, "otp_expiry": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ==================== CART ROUTES ====================

@api_router.post("/cart/add")
async def add_to_cart(item: AddToCartRequest, user_data: dict = Depends(verify_user_token)):
    """Add item to user's cart"""
    try:
        user_id = user_data["user_id"]
        
        # Create cart item
        cart_item = CartItem(
            product_id=item.product_id,
            name=item.name,
            image=item.image,
            short_description=item.short_description,
            price=item.price,
            selected_size=item.selected_size,
            selected_color=item.selected_color
        )
        
        cart_item_doc = cart_item.model_dump()
        cart_item_doc['added_at'] = cart_item_doc['added_at'].isoformat()
        
        # Check if user cart exists
        user_cart = await db.carts.find_one({"user_id": user_id})
        
        if user_cart:
            # Add item to existing cart
            await db.carts.update_one(
                {"user_id": user_id},
                {"$push": {"items": cart_item_doc}}
            )
        else:
            # Create new cart
            await db.carts.insert_one({
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "items": [cart_item_doc],
                "created_at": datetime.now(timezone.utc).isoformat()
            })
        
        return {
            "message": "Item added to cart successfully",
            "item": cart_item_doc
        }
    except Exception as e:
        logging.error(f"Add to cart error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to add item to cart")

@api_router.get("/cart")
async def get_cart(user_data: dict = Depends(verify_user_token)):
    """Get user's cart items"""
    try:
        user_id = user_data["user_id"]
        
        user_cart = await db.carts.find_one({"user_id": user_id}, {"_id": 0})
        
        if not user_cart:
            return {"items": [], "total_items": 0}
        
        return {
            "items": user_cart.get("items", []),
            "total_items": len(user_cart.get("items", []))
        }
    except Exception as e:
        logging.error(f"Get cart error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get cart")

@api_router.delete("/cart/item/{item_id}")
async def remove_from_cart(item_id: str, user_data: dict = Depends(verify_user_token)):
    """Remove item from user's cart"""
    try:
        user_id = user_data["user_id"]
        
        result = await db.carts.update_one(
            {"user_id": user_id},
            {"$pull": {"items": {"id": item_id}}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Item not found in cart")
        
        return {"message": "Item removed from cart successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Remove from cart error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to remove item from cart")

@api_router.put("/cart/item/{item_id}/toggle-select")
async def toggle_item_selection(item_id: str, user_data: dict = Depends(verify_user_token)):
    """Toggle item selection for WhatsApp enquiry"""
    try:
        user_id = user_data["user_id"]
        
        # Get current cart
        user_cart = await db.carts.find_one({"user_id": user_id})
        if not user_cart:
            raise HTTPException(status_code=404, detail="Cart not found")
        
        # Find and toggle item
        items = user_cart.get("items", [])
        updated = False
        for item in items:
            if item["id"] == item_id:
                item["is_selected"] = not item.get("is_selected", False)
                updated = True
                break
        
        if not updated:
            raise HTTPException(status_code=404, detail="Item not found in cart")
        
        # Update cart
        await db.carts.update_one(
            {"user_id": user_id},
            {"$set": {"items": items}}
        )
        
        return {"message": "Item selection toggled successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Toggle item selection error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to toggle item selection")

@api_router.post("/cart/enquire-selected")
async def enquire_selected_items(user_data: dict = Depends(verify_user_token)):
    """Send WhatsApp enquiry for selected cart items"""
    try:
        user_id = user_data["user_id"]
        
        # Get cart
        user_cart = await db.carts.find_one({"user_id": user_id})
        if not user_cart:
            raise HTTPException(status_code=404, detail="Cart not found")
        
        # Get selected items
        selected_items = [item for item in user_cart.get("items", []) if item.get("is_selected", False)]
        
        if not selected_items:
            raise HTTPException(status_code=400, detail="No items selected")
        
        phone_number = "918072153196"
        
        # Format message with product details
        message_parts = ["*PRODUCT ENQUIRY*%0A%0A"]
        
        for idx, item in enumerate(selected_items, 1):
            message_parts.append(f"*Product {idx}:*%0A")
            message_parts.append(f"Name: {item.get('name', 'N/A')}%0A")
            message_parts.append(f"Price: ₹{item.get('price', 0)}%0A")
            message_parts.append(f"Size: {item.get('selected_size', 'N/A')}%0A")
            message_parts.append(f"Color: {item.get('selected_color', 'N/A')}%0A")
            if item.get('short_description'):
                message_parts.append(f"Description: {item.get('short_description')}%0A")
            if item.get('image'):
                message_parts.append(f"Image: {item.get('image')}%0A")
            message_parts.append("%0A")
        
        message_parts.append("Please confirm availability and provide purchase details.")
        
        message = "".join(message_parts)
        whatsapp_url = f"https://wa.me/{phone_number}?text={message}"
        
        # Store enquiry in database
        enquiry_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "items": selected_items,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.enquiries.insert_one(enquiry_doc)
        
        return {
            "message": "Enquiry prepared successfully",
            "whatsapp_url": whatsapp_url
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Cart enquiry error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process enquiry")

# ==================== PRODUCT ROUTES ====================

@api_router.get("/products", response_model=List[Product])
async def get_all_products(
    category: Optional[str] = None,
    subcategory: Optional[str] = None,
    gender: Optional[str] = None,
    age_group: Optional[str] = None,
    is_new_arrival: Optional[bool] = None,
    show_in_fresh_arrivals: Optional[bool] = None
):
    """Get all products with optional filters"""
    query = {}
    if category:
        query["category"] = category
    if subcategory:
        query["subcategory"] = subcategory
    if gender:
        query["gender"] = gender
    if age_group:
        query["age_group"] = age_group
    if is_new_arrival is not None:
        query["is_new_arrival"] = is_new_arrival
    if show_in_fresh_arrivals is not None:
        query["show_in_fresh_arrivals"] = show_in_fresh_arrivals
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get a single product by ID"""
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate, username: str = Depends(verify_token)):
    """Create a new product (Owner only)"""
    product_dict = product.model_dump()
    product_obj = Product(**product_dict)
    
    doc = product_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.products.insert_one(doc)
    return product_obj

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, updates: ProductUpdate, username: str = Depends(verify_token)):
    """Update a product (Owner only)"""
    existing_product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    
    updated_product = await db.products.find_one({"id": product_id}, {"_id": 0})
    return updated_product

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, username: str = Depends(verify_token)):
    """Delete a product (Owner only)"""
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# ==================== IMAGE UPLOAD ROUTES ====================

@api_router.post("/upload-image")
async def upload_image(file: UploadFile = File(...), username: str = Depends(verify_token)):
    """Upload an image and optionally detect color"""
    try:
        # Read image file
        contents = await file.read()
        
        # Convert to base64
        image_base64 = base64.b64encode(contents).decode('utf-8')
        
        # Optionally resize image if too large
        try:
            img = Image.open(BytesIO(contents))
            if img.width > 1024 or img.height > 1024:
                img.thumbnail((1024, 1024))
                buffer = BytesIO()
                img.save(buffer, format=img.format or 'JPEG')
                image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        except Exception as e:
            logging.warning(f"Image resize failed: {str(e)}")
        
        # For now, return the base64 string
        # In production, you'd upload to cloud storage (S3, Cloudinary, etc.)
        return {
            "image_url": f"data:image/{file.content_type.split('/')[-1]};base64,{image_base64}",
            "image_base64": image_base64,
            "filename": file.filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

@api_router.post("/detect-color", response_model=ColorDetectionResponse)
async def detect_color(image_base64: str = Form(...), username: str = Depends(verify_token)):
    """Detect color from base64 image"""
    result = await detect_color_from_image(image_base64)
    return ColorDetectionResponse(**result)

@api_router.post("/transform-color")
async def transform_color(
    image_base64: str = Form(...),
    target_color: str = Form(...),
    username: str = Depends(verify_token)
):
    """Transform image to show different color using AI"""
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"color-transform-{uuid.uuid4()}",
            system_message="You are an expert in describing how clothing would look in different colors."
        ).with_model("openai", "gpt-5.2")
        
        image_content = ImageContent(image_base64=image_base64)
        
        message = UserMessage(
            text=f"Generate a detailed visual description of how this exact clothing item would look if it were {target_color} color instead. Be specific about the shade, tone, and how the color would appear on this fabric and style.",
            file_contents=[image_content]
        )
        
        response = await chat.send_message(message)
        
        # For now, return the description. In a full implementation, you could use DALL-E or similar
        # to generate actual color-transformed images
        return {
            "success": True,
            "target_color": target_color,
            "description": response.strip(),
            "note": "Color transformation preview available through description"
        }
    except Exception as e:
        logging.error(f"Color transformation error: {str(e)}")
        return {
            "success": False,
            "target_color": target_color,
            "description": f"This item would look great in {target_color}!",
            "note": "Using fallback description"
        }

@api_router.post("/products/{product_id}/add-image")
async def add_product_image(
    product_id: str,
    file: UploadFile = File(...),
    is_primary: bool = Form(False),
    color: Optional[str] = Form(None),
    sizes: Optional[str] = Form(None),  # Comma-separated sizes
    username: str = Depends(verify_token)
):
    """Add an image to a product"""
    # Upload image first
    contents = await file.read()
    image_base64 = base64.b64encode(contents).decode('utf-8')
    image_url = f"data:image/{file.content_type.split('/')[-1]};base64,{image_base64}"
    
    # Add to product
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Parse sizes from comma-separated string
    size_list = []
    if sizes:
        size_list = [s.strip() for s in sizes.split(',') if s.strip()]
    
    new_image = {"url": image_url, "is_primary": is_primary, "color": color, "sizes": size_list}
    
    await db.products.update_one(
        {"id": product_id},
        {"$push": {"images": new_image}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Image added successfully", "image": new_image}

@api_router.delete("/products/{product_id}/remove-image")
async def remove_product_image(product_id: str, image_url: str = Form(...), username: str = Depends(verify_token)):
    """Remove an image from a product"""
    result = await db.products.update_one(
        {"id": product_id},
        {"$pull": {"images": {"url": image_url}}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Product or image not found")
    
    return {"message": "Image removed successfully"}

# ==================== REVIEW ROUTES ====================

@api_router.get("/reviews", response_model=List[Review])
async def get_reviews():
    """Get all reviews"""
    reviews = await db.reviews.find({}, {"_id": 0}).to_list(1000)
    return reviews

@api_router.post("/reviews", response_model=Review)
async def create_review(review: ReviewCreate, username: str = Depends(verify_token)):
    """Create a new review (Owner only)"""
    review_dict = review.model_dump()
    review_obj = Review(**review_dict, date=datetime.now().strftime("%B %Y"))
    
    doc = review_obj.model_dump()
    await db.reviews.insert_one(doc)
    return review_obj

@api_router.put("/reviews/{review_id}", response_model=Review)
async def update_review(review_id: str, updates: ReviewUpdate, username: str = Depends(verify_token)):
    """Update a review (Owner only)"""
    existing_review = await db.reviews.find_one({"id": review_id}, {"_id": 0})
    if not existing_review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    
    await db.reviews.update_one({"id": review_id}, {"$set": update_data})
    
    updated_review = await db.reviews.find_one({"id": review_id}, {"_id": 0})
    return updated_review

@api_router.delete("/reviews/{review_id}")
async def delete_review(review_id: str, username: str = Depends(verify_token)):
    """Delete a review (Owner only)"""
    result = await db.reviews.delete_one({"id": review_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Review deleted successfully"}

@api_router.post("/reviews/public")
async def create_public_review(review: PublicReviewCreate):
    """Create a new review (Public - Customer submission)"""
    review_dict = review.model_dump()
    review_obj = Review(
        **review_dict,
        rating=5,
        date=datetime.now().strftime("%B %Y"),
        location="Customer"
    )
    
    doc = review_obj.model_dump()
    await db.reviews.insert_one(doc)
    return {"message": "Thank you for your feedback! Your review has been submitted.", "review": review_obj}

# ==================== FEEDBACK & WHATSAPP ROUTES ====================

@api_router.post("/feedback")
async def submit_feedback(feedback: FeedbackSubmit):
    """Submit feedback - sends to WhatsApp"""
    try:
        # Format WhatsApp message
        phone_number = "918072153196"
        message = f"*FEEDBACK*%0A%0AFrom: {feedback.name}%0A%0AMessage:%0A{feedback.message}"
        whatsapp_url = f"https://wa.me/{phone_number}?text={message}"
        
        # Store feedback in database
        feedback_doc = {
            "id": str(uuid.uuid4()),
            "name": feedback.name,
            "message": feedback.message,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.feedbacks.insert_one(feedback_doc)
        
        return {
            "message": "Your feedback is valuable. Thank you for your time.",
            "whatsapp_url": whatsapp_url
        }
    except Exception as e:
        logging.error(f"Feedback submission error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit feedback")

@api_router.post("/cart/enquire")
async def cart_enquiry(enquiry: CartEnquiry):
    """Send cart enquiry to WhatsApp"""
    try:
        phone_number = "918072153196"
        
        # Format message with product details
        message_parts = ["*PRODUCT ENQUIRY*%0A%0A"]
        
        for idx, item in enumerate(enquiry.items, 1):
            message_parts.append(f"*Product {idx}:*%0A")
            message_parts.append(f"Name: {item.get('name', 'N/A')}%0A")
            message_parts.append(f"Price: ₹{item.get('price', 0)}%0A")
            message_parts.append(f"Size: {item.get('selectedSize', 'N/A')}%0A")
            message_parts.append(f"Color: {item.get('selectedColor', 'N/A')}%0A")
            if item.get('short_description'):
                message_parts.append(f"Description: {item.get('short_description')}%0A")
            message_parts.append("%0A")
        
        message_parts.append("Please confirm availability and provide purchase details.")
        
        message = "".join(message_parts)
        whatsapp_url = f"https://wa.me/{phone_number}?text={message}"
        
        # Store enquiry in database
        enquiry_doc = {
            "id": str(uuid.uuid4()),
            "items": enquiry.items,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.enquiries.insert_one(enquiry_doc)
        
        return {
            "message": "Enquiry prepared successfully",
            "whatsapp_url": whatsapp_url
        }
    except Exception as e:
        logging.error(f"Cart enquiry error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process enquiry")

# ==================== METADATA ROUTES ====================

@api_router.post("/generate-description")
async def generate_description(
    item_name: str = Form(...),
    short_description: str = Form(...),
    category: str = Form(...),
    subcategory: str = Form(...),
    fabric: str = Form(...),
    username: str = Depends(verify_token)
):
    """Generate detailed product description using AI"""
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"desc-generation-{uuid.uuid4()}",
            system_message="You are a professional fashion copywriter. Generate detailed, engaging product descriptions for clothing items."
        ).with_model("openai", "gpt-5.2")
        
        prompt = f"""Create a detailed product description for an e-commerce clothing store.

Item Name: {item_name}
Short Description: {short_description}
Category: {category}
Subcategory: {subcategory}
Fabric: {fabric}

Generate a compelling 2-3 paragraph description that:
- Highlights the key features and quality
- Describes the fabric characteristics
- Mentions suitable occasions
- Appeals to potential buyers
- Maintains a professional yet warm tone

Keep it concise and engaging."""
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        
        return {"detailed_description": response.strip()}
    except Exception as e:
        logging.error(f"Description generation error: {str(e)}")
        # Fallback to template-based description
        description = f"{item_name} - {short_description}. This exquisite {subcategory} from our {category} collection is crafted from premium {fabric} fabric. Perfect for any occasion, this piece combines comfort with style. Available in multiple colors and sizes."
        return {"detailed_description": description}

@api_router.get("/metadata/colors")
async def get_colors():
    """Get available colors"""
    return {"colors": COLOR_PALETTE}

@api_router.get("/metadata/fabrics")
async def get_fabrics():
    """Get available fabrics"""
    return {"fabrics": FABRIC_OPTIONS}

@api_router.get("/metadata/sizes")
async def get_sizes():
    """Get available sizes"""
    return {
        "letters": SIZE_OPTIONS_LETTERS,
        "numbers": SIZE_OPTIONS_NUMBERS
    }

@api_router.get("/metadata/age-groups")
async def get_age_groups():
    """Get kids age groups"""
    return {"age_groups": AGE_GROUPS}

@api_router.get("/metadata/kids-subcategories")
async def get_kids_subcategories():
    """Get kids subcategories"""
    return {"subcategories": KIDS_SUBCATEGORIES}

@api_router.get("/metadata/accessories-subcategories")
async def get_accessories_subcategories():
    """Get accessories subcategories"""
    return {"subcategories": ACCESSORIES_SUBCATEGORIES}


@api_router.post("/metadata/fabrics")
async def add_custom_fabric(fabric_name: str = Form(...), username: str = Depends(verify_token)):
    """Add a custom fabric to the list"""
    # Check if fabric already exists (case-insensitive)
    existing_fabrics = await db.custom_fabrics.find_one({"name_lower": fabric_name.lower()})
    if existing_fabrics:
        raise HTTPException(status_code=400, detail="Fabric already exists")
    
    fabric_doc = {
        "id": str(uuid.uuid4()),
        "name": fabric_name,
        "name_lower": fabric_name.lower(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.custom_fabrics.insert_one(fabric_doc)
    
    return {"message": "Fabric added successfully", "fabric": fabric_name}

@api_router.get("/metadata/all-fabrics")
async def get_all_fabrics():
    """Get all fabrics including custom ones"""
    custom_fabrics = await db.custom_fabrics.find({}, {"_id": 0, "name": 1}).to_list(1000)
    custom_fabric_names = [f["name"] for f in custom_fabrics]
    all_fabrics = FABRIC_OPTIONS + custom_fabric_names
    return {"fabrics": sorted(list(set(all_fabrics)))}

# ==================== ROOT ROUTE ====================

@api_router.get("/")
async def root():
    return {"message": "Milan Readymades API", "version": "2.0"}

# Include the router in the main app
app.include_router(api_router)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
