from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
import re

router = APIRouter()

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[datetime] = None

class ChatRequest(BaseModel):
    userId: str
    courseId: Optional[str] = None
    message: str
    conversationHistory: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    message: str
    sources: Optional[List[str]] = []
    confidence: float

# FAQ Pattern matching (simplified, no RAG/ChromaDB)
FAQ_PATTERNS = {
    r'\b(what|qu\'est-ce que)\b.*\b(lms|platform|plateforme)\b': {
        'answer': "HAR Academy is a Learning Management System (LMS) that offers interactive courses in web development, data science, mobile development, and more.",
        'confidence': 0.95,
        'sources': ["About HAR Academy"]
    },
    r'\b(how|comment)\b.*\b(enroll|inscription|register)\b': {
        'answer': "To enroll in a course: 1) Browse the course catalog, 2) Click on a course you're interested in, 3) Click the 'Enroll' button, 4) Complete payment if required.",
        'confidence': 0.92,
        'sources': ["Enrollment Guide"]
    },
    r'\b(price|cost|prix|tarif)\b': {
        'answer': "We offer three subscription plans: Basic (€9.99/month), Pro (€19.99/month), and Enterprise (€49.99/month). Individual courses can also be purchased separately.",
        'confidence': 0.90,
        'sources': ["Pricing Page"]
    },
    r'\b(certificate|certificat)\b': {
        'answer': "Yes, you receive a certificate of completion after finishing a course with a passing grade. Certificates are verified and can be shared on LinkedIn.",
        'confidence': 0.88,
        'sources': ["Certificates FAQ"]
    },
    r'\b(refund|remboursement)\b': {
        'answer': "We offer a 14-day money-back guarantee for all course purchases. If you're not satisfied, you can request a full refund within 14 days.",
        'confidence': 0.85,
        'sources': ["Refund Policy"]
    },
    r'\b(support|aide|help)\b': {
        'answer': "You can get support through: 1) Our AI chatbot (this one!), 2) Course discussion forums, 3) Email support at support@har-academy.com, or 4) Live chat during business hours.",
        'confidence': 0.87,
        'sources': ["Support Options"]
    },
    r'\b(video|lecture|cours)\b.*\b(download|télécharger)\b': {
        'answer': "Course videos are available for streaming only and cannot be downloaded. This protects instructor intellectual property. You have lifetime access to stream content.",
        'confidence': 0.82,
        'sources': ["Course Access FAQ"]
    },
}

def find_best_match(message: str) -> Optional[Dict]:
    """Find best matching FAQ pattern using regex"""
    message_lower = message.lower()
    best_match = None
    best_score = 0
    
    for pattern, response in FAQ_PATTERNS.items():
        if re.search(pattern, message_lower, re.IGNORECASE):
            # Simple scoring based on pattern length
            score = len(pattern) / 100
            if score > best_score:
                best_score = score
                best_match = response
    
    return best_match

@router.post("/ask", response_model=ChatResponse)
async def ask_question(request: ChatRequest):
    """
    FAQ-based chatbot using pattern matching (no RAG/ChromaDB for Phase 1).
    Matches user questions against predefined patterns.
    """
    # Try to find matching FAQ
    match = find_best_match(request.message)
    
    if match:
        return ChatResponse(
            message=match['answer'],
            sources=match['sources'],
            confidence=match['confidence']
        )
    
    # Fallback response for unmatched questions
    fallback_responses = [
        "I'm not sure I understand your question. Could you rephrase it?",
        "That's a great question! For specific course content, please refer to the course materials or contact your instructor.",
        "I don't have information about that yet. Please contact our support team at support@har-academy.com for assistance.",
    ]
    
    # Use conversation history to provide context-aware fallback
    fallback = fallback_responses[len(request.conversationHistory or []) % len(fallback_responses)]
    
    return ChatResponse(
        message=fallback,
        sources=[],
        confidence=0.3
    )

class FeedbackRequest(BaseModel):
    userId: str
    messageId: str
    helpful: bool
    comment: Optional[str] = None

@router.post("/feedback")
async def submit_feedback(request: FeedbackRequest):
    """Submit feedback on chatbot responses for continuous improvement."""
    return {
        "success": True,
        "message": "Feedback recorded successfully. Thank you for helping us improve!"
    }

@router.get("/history/{user_id}")
async def get_conversation_history(user_id: str, limit: int = 20):
    """Retrieve user's conversation history."""
    # Mock implementation - in production, store in database
    return {
        "userId": user_id,
        "conversations": [],
        "totalCount": 0
    }

@router.get("/faq")
async def get_common_questions():
    """Get list of common FAQ topics."""
    return {
        "categories": [
            {
                "title": "Getting Started",
                "questions": [
                    "How do I enroll in a course?",
                    "What payment methods are accepted?",
                    "Do I get a certificate?"
                ]
            },
            {
                "title": "Account & Billing",
                "questions": [
                    "How do I change my subscription?",
                    "What is the refund policy?",
                    "How do I cancel my subscription?"
                ]
            },
            {
                "title": "Technical Support",
                "questions": [
                    "Video not playing?",
                    "Can I download course materials?",
                    "How do I contact support?"
                ]
            }
        ]
    }
