from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
from pymongo import MongoClient
import uuid
from datetime import datetime
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Collections
courses_collection = db.courses
users_collection = db.users
payment_transactions_collection = db.payment_transactions

# Stripe API key
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

# Course packages with fixed prices
COURSE_PACKAGES = {
    "individual": {"name": "Individual Course", "description": "Access to a single course"},
    "bundle": {"name": "Course Bundle", "description": "Access to 3 courses", "price": 199.99},
    "subscription": {"name": "Monthly Subscription", "description": "Unlimited access to all courses", "price": 49.99}
}

# Pydantic models
class Course(BaseModel):
    id: str
    title: str
    description: str
    price: float
    duration: str
    difficulty: str
    image_url: str
    instructor: str
    rating: float
    students: int
    created_at: datetime

class PersonalInfo(BaseModel):
    name: str
    title: str
    bio: str
    skills: List[str]
    experience: List[Dict[str, Any]]
    contact: Dict[str, str]
    social_links: Dict[str, str]
    profile_image: str

class PaymentRequest(BaseModel):
    package_type: str
    course_id: Optional[str] = None
    success_url: str
    cancel_url: str
    metadata: Optional[Dict[str, str]] = None

class WebhookRequest(BaseModel):
    data: bytes

# Initialize sample data
def initialize_sample_data():
    # Sample courses
    if courses_collection.count_documents({}) == 0:
        sample_courses = [
            {
                "id": str(uuid.uuid4()),
                "title": "Full Stack Web Development",
                "description": "Learn to build complete web applications using React, Node.js, and MongoDB. Master both frontend and backend development.",
                "price": 99.99,
                "duration": "12 weeks",
                "difficulty": "Intermediate",
                "image_url": "https://images.unsplash.com/photo-1541178735493-479c1a27ed24?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBlZHVjYXRpb258ZW58MHx8fGJsdWV8MTc1MjgzNjUzNnww&ixlib=rb-4.1.0&q=85",
                "instructor": "Shoraj Tomer",
                "rating": 4.8,
                "students": 1250,
                "created_at": datetime.now()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Python Data Science Masterclass",
                "description": "Master data science with Python, including NumPy, Pandas, Matplotlib, and machine learning with Scikit-learn.",
                "price": 129.99,
                "duration": "10 weeks",
                "difficulty": "Advanced",
                "image_url": "https://images.unsplash.com/photo-1426024120108-99cc76989c71?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwyfHxvbmxpbmUlMjBlZHVjYXRpb258ZW58MHx8fGJsdWV8MTc1MjgzNjUzNnww&ixlib=rb-4.1.0&q=85",
                "instructor": "Shoraj Tomer",
                "rating": 4.9,
                "students": 890,
                "created_at": datetime.now()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "React & TypeScript Fundamentals",
                "description": "Build modern, type-safe React applications with TypeScript. Learn hooks, context, and best practices.",
                "price": 79.99,
                "duration": "8 weeks",
                "difficulty": "Beginner",
                "image_url": "https://images.unsplash.com/photo-1651796704084-a115817945b2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwzfHxvbmxpbmUlMjBlZHVjYXRpb258ZW58MHx8fGJsdWV8MTc1MjgzNjUzNnww&ixlib=rb-4.1.0&q=85",
                "instructor": "Shoraj Tomer",
                "rating": 4.7,
                "students": 2150,
                "created_at": datetime.now()
            }
        ]
        courses_collection.insert_many(sample_courses)

# Initialize sample data on startup
initialize_sample_data()

# API Routes
@app.get("/")
async def root():
    return {"message": "Shoraj Tomer Portfolio API"}

@app.get("/api/personal-info")
async def get_personal_info():
    return {
        "name": "Shoraj Tomer",
        "title": "Full Stack Developer & Tech Educator",
        "bio": "Passionate full-stack developer with 5+ years of experience building scalable web applications. I specialize in React, Node.js, Python, and cloud technologies. I love sharing knowledge and helping others learn to code.",
        "skills": [
            "JavaScript/TypeScript", "React/Next.js", "Node.js", "Python", 
            "MongoDB", "PostgreSQL", "AWS", "Docker", "Git", "REST APIs"
        ],
        "experience": [
            {
                "title": "Senior Full Stack Developer",
                "company": "TechCorp Inc.",
                "duration": "2022 - Present",
                "description": "Lead development of microservices architecture serving 100K+ users"
            },
            {
                "title": "Full Stack Developer",
                "company": "StartupXYZ",
                "duration": "2020 - 2022",
                "description": "Built and maintained React/Node.js applications, reduced loading times by 40%"
            },
            {
                "title": "Frontend Developer",
                "company": "WebSolutions",
                "duration": "2019 - 2020",
                "description": "Developed responsive web applications using React and modern CSS frameworks"
            }
        ],
        "contact": {
            "email": "shoraj@shorajtomer.me",
            "phone": "+1 (555) 123-4567",
            "location": "San Francisco, CA"
        },
        "social_links": {
            "github": "https://github.com/shorajtomer",
            "linkedin": "https://linkedin.com/in/shorajtomer",
            "twitter": "https://twitter.com/shorajtomer",
            "youtube": "https://youtube.com/shorajtomer"
        },
        "profile_image": "https://images.unsplash.com/photo-1590086782957-93c06ef21604?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwxfHxkZXZlbG9wZXIlMjBwb3J0cmFpdHxlbnwwfHx8Ymx1ZXwxNzUyODM2NTMwfDA&ixlib=rb-4.1.0&q=85"
    }

@app.get("/api/courses")
async def get_courses():
    courses = list(courses_collection.find({}, {"_id": 0}))
    return courses

@app.get("/api/courses/{course_id}")
async def get_course(course_id: str):
    course = courses_collection.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@app.post("/api/payments/v1/checkout/session")
async def create_checkout_session(request: PaymentRequest, http_request: Request):
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe API key not configured")
    
    # Initialize Stripe checkout
    host_url = str(http_request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    # Determine amount based on package type
    amount = None
    metadata = request.metadata or {}
    
    if request.package_type == "individual" and request.course_id:
        # Get course price
        course = courses_collection.find_one({"id": request.course_id})
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        amount = course["price"]
        metadata["course_id"] = request.course_id
        metadata["course_title"] = course["title"]
    elif request.package_type in COURSE_PACKAGES:
        if request.package_type in ["bundle", "subscription"]:
            amount = COURSE_PACKAGES[request.package_type]["price"]
        else:
            raise HTTPException(status_code=400, detail="Invalid package type for pricing")
    else:
        raise HTTPException(status_code=400, detail="Invalid package type")
    
    metadata["package_type"] = request.package_type
    metadata["timestamp"] = datetime.now().isoformat()
    
    # Create checkout session request
    checkout_request = CheckoutSessionRequest(
        amount=amount,
        currency="usd",
        success_url=request.success_url,
        cancel_url=request.cancel_url,
        metadata=metadata
    )
    
    try:
        # Create checkout session
        session = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Store payment transaction
        payment_transaction = {
            "id": str(uuid.uuid4()),
            "session_id": session.session_id,
            "amount": amount,
            "currency": "usd",
            "package_type": request.package_type,
            "course_id": request.course_id,
            "metadata": metadata,
            "payment_status": "pending",
            "status": "initiated",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        payment_transactions_collection.insert_one(payment_transaction)
        
        return {"url": session.url, "session_id": session.session_id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create checkout session: {str(e)}")

@app.get("/api/payments/v1/checkout/status/{session_id}")
async def get_checkout_status(session_id: str):
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe API key not configured")
    
    # Find payment transaction
    payment_transaction = payment_transactions_collection.find_one({"session_id": session_id}, {"_id": 0})
    if not payment_transaction:
        raise HTTPException(status_code=404, detail="Payment transaction not found")
    
    try:
        # Initialize Stripe checkout
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
        
        # Get checkout status from Stripe
        checkout_status = await stripe_checkout.get_checkout_status(session_id)
        
        # Update payment transaction if status changed
        if payment_transaction["payment_status"] != checkout_status.payment_status:
            payment_transactions_collection.update_one(
                {"session_id": session_id},
                {
                    "$set": {
                        "payment_status": checkout_status.payment_status,
                        "status": checkout_status.status,
                        "updated_at": datetime.now()
                    }
                }
            )
        
        return {
            "session_id": session_id,
            "status": checkout_status.status,
            "payment_status": checkout_status.payment_status,
            "amount_total": checkout_status.amount_total,
            "currency": checkout_status.currency,
            "metadata": checkout_status.metadata
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get checkout status: {str(e)}")

@app.post("/api/webhook/stripe")
async def handle_stripe_webhook(request: Request):
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe API key not configured")
    
    try:
        # Get request body and headers
        body = await request.body()
        signature = request.headers.get("Stripe-Signature")
        
        # Initialize Stripe checkout
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
        
        # Handle webhook
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        # Update payment transaction based on webhook event
        if webhook_response.session_id:
            payment_transactions_collection.update_one(
                {"session_id": webhook_response.session_id},
                {
                    "$set": {
                        "payment_status": webhook_response.payment_status,
                        "webhook_event_id": webhook_response.event_id,
                        "webhook_event_type": webhook_response.event_type,
                        "updated_at": datetime.now()
                    }
                }
            )
        
        return {"status": "success", "event_type": webhook_response.event_type}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Webhook processing failed: {str(e)}")

@app.get("/api/packages")
async def get_packages():
    return COURSE_PACKAGES

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)