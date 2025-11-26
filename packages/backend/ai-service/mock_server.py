"""
Ultra-Simple AI Service Mock
Uses only Python standard library - no external dependencies!
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import logging
from urllib.parse import urlparse, parse_qs

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)

class AIServiceHandler(BaseHTTPRequestHandler):
    """Simple HTTP request handler for AI service"""
    
    def _set_headers(self, status=200):
        """Set response headers"""
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self._set_headers(200)
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        logger.info(f"GET {path}")
        
        if path == '/health':
            self._set_headers(200)
            response = {
                "status": "ok",
                "service": "ai-service-mock",
                "version": "1.0.0"
            }
            self.wfile.write(json.dumps(response).encode())
        
        elif path == '/':
            self._set_headers(200)
            response = {
                "message": "HAR Academy AI Service (Mock)",
                "endpoints": {
                    "health": "/health",
                    "recommendations": "POST /api/v1/recommendations/personalized",
                    "trending": "GET /api/v1/recommendations/trending",
                    "quiz": "POST /api/v1/content/quiz"
                }
            }
            self.wfile.write(json.dumps(response).encode())
        
        elif path == '/api/v1/recommendations/trending':
            self._set_headers(200)
            response = {
                "success": True,
                "data": {
                    "courses": [
                        {"course_id": "trend_1", "title": "Machine Learning Basics", "enrollments": 1250},
                        {"course_id": "trend_2", "title": "Full Stack Development", "enrollments": 980},
                        {"course_id": "trend_3", "title": "Mobile App Development", "enrollments": 856}
                    ]
                }
            }
            self.wfile.write(json.dumps(response).encode())
        
        else:
            self._set_headers(404)
            response = {"error": "Not found"}
            self.wfile.write(json.dumps(response).encode())
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Read request body
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'
        
        try:
            data = json.loads(body)
        except:
            data = {}
        
        logger.info(f"POST {path}")
        
        if path == '/api/v1/recommendations/personalized':
            self._set_headers(200)
            limit = data.get('limit', 5)
            response = {
                "success": True,
                "data": {
                    "recommendations": [
                        {
                            "course_id": "rec_1",
                            "title": "Introduction to Python Programming",
                            "score": 0.95,
                            "reason": "Based on your learning history"
                        },
                        {
                            "course_id": "rec_2",
                            "title": "Web Development with React",
                            "score": 0.88,
                            "reason": "Complements your JavaScript skills"
                        },
                        {
                            "course_id": "rec_3",
                            "title": "Data Science Fundamentals",
                            "score": 0.82,
                            "reason": "Popular among similar learners"
                        }
                    ][:limit],
                    "source": "mock-service"
                }
            }
            self.wfile.write(json.dumps(response).encode())
        
        elif path == '/api/v1/content/quiz':
            self._set_headers(200)
            num_questions = data.get('num_questions', 3)
            content = data.get('content', '')
            
            # Simple quiz generation
            questions = []
            sentences = [s.strip() for s in content.split('.') if len(s.strip()) > 20]
            
            for i, sentence in enumerate(sentences[:num_questions]):
                words = sentence.split()
                if len(words) > 5:
                    blank_word = words[len(words) // 2]
                    question_text = sentence.replace(blank_word, "______")
                    
                    questions.append({
                        "id": f"q{i+1}",
                        "text": question_text,
                        "type": "multiple_choice",
                        "options": [
                            {"id": "A", "text": blank_word, "isCorrect": True},
                            {"id": "B", "text": blank_word + "s", "isCorrect": False},
                            {"id": "C", "text": "Option C", "isCorrect": False},
                            {"id": "D", "text": "Option D", "isCorrect": False}
                        ],
                        "difficulty": data.get('difficulty', 'medium'),
                        "explanation": f"The correct answer is '{blank_word}'."
                    })
            
            response = {
                "success": True,
                "data": {
                    "questions": questions,
                    "total": len(questions)
                }
            }
            self.wfile.write(json.dumps(response).encode())
        
        elif path == '/api/v1/chatbot/ask':
            self._set_headers(200)
            question = data.get('question', '')
            
            # Simple template responses
            answer = "I'm here to help! This is a mock AI assistant."
            if 'cours' in question.lower() or 'course' in question.lower():
                answer = "You can browse our courses in the Courses section."
            elif 'help' in question.lower():
                answer = "I can help you with course recommendations and general questions."
            
            response = {
                "success": True,
                "data": {
                    "answer": answer,
                    "confidence": 0.75
                }
            }
            self.wfile.write(json.dumps(response).encode())
        
        else:
            self._set_headers(404)
            response = {"error": "Not found"}
            self.wfile.write(json.dumps(response).encode())
    
    def log_message(self, format, *args):
        """Override to use custom logger"""
        return  # Suppress default logging

def run_server(port=8001):
    """Run the mock AI service"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, AIServiceHandler)
    
    logger.info("=" * 60)
    logger.info("HAR Academy AI Service (Mock Server)")
    logger.info("=" * 60)
    logger.info(f"Server running at: http://localhost:{port}")
    logger.info(f"Health check: http://localhost:{port}/health")
    logger.info(f"API docs: http://localhost:{port}/")
    logger.info("=" * 60)
    logger.info("Press Ctrl+C to stop")
    logger.info("")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info("\nShutting down server...")
        httpd.shutdown()

if __name__ == '__main__':
    run_server(8001)
