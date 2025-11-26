from typing import List, Dict, Any
from app.services.vector_db_service import vector_db_service
from app.models.schemas import ChatSource
import logging

logger = logging.getLogger(__name__)

class ChatbotService:
    """
    RAG-based chatbot service that answers questions using course content.
    Uses ChromaDB for retrieval and simple template-based responses.
    """
    
    def answer_question(
        self,
        message: str,
        course_id: str,
        conversation_history: List[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Answer a question using RAG (Retrieval-Augmented Generation).
        
        Steps:
        1. Retrieve relevant context from vector DB
        2. Generate answer based on context
        3. Return answer with sources
        """
        try:
            # Retrieve relevant content
            relevant_docs = vector_db_service.search(
                query=message,
                course_id=course_id,
                top_k=3
            )
            
            if not relevant_docs:
                return {
                    "reply": "Je n'ai pas trouvé d'informations pertinentes dans le contenu du cours pour répondre à cette question.",
                    "sources": [],
                    "confidence": 0.0
                }
            
            # Extract context
            context_parts = []
            sources = []
            
            for doc in relevant_docs:
                context_parts.append(doc["content"])
                metadata = doc.get("metadata", {})
                
                sources.append(
                    ChatSource(
                        lessonId=metadata.get("lesson_id", "unknown"),
                        lessonTitle=metadata.get("title", "Unknown"),
                        excerpt=doc["content"][:150] + "..."
                    )
                )
            
            # Generate answer (simple template-based approach)
            answer = self._generate_answer(message, context_parts)
            
            # Calculate confidence based on relevance
            avg_distance = sum(doc.get("distance", 1.0) for doc in relevant_docs) / len(relevant_docs)
            confidence = max(0.0, 1.0 - avg_distance)
            
            return {
                "reply": answer,
                "sources": [s.dict(by_alias=True) for s in sources],
                "confidence": round(confidence, 2)
            }
            
        except Exception as e:
            logger.error(f"Error answering question: {e}")
            return {
                "reply": "Désolé, une erreur s'est produite lors du traitement de votre question.",
                "sources": [],
                "confidence": 0.0
            }
    
    def _generate_answer(self, question: str, context_parts: List[str]) -> str:
        """
        Generate answer from context using template-based approach.
        In production, this would use an LLM.
        """
        # Simple approach: return most relevant context
        if not context_parts:
            return "Je n'ai pas trouvé d'informations pertinentes."
        
        # Check if question is asking for definition
        question_lower = question.lower()
        
        if any(word in question_lower for word in ["qu'est-ce", "c'est quoi", "définition", "what is", "define"]):
            return f"D'après le contenu du cours : {context_parts[0]}"
        
        # Check if question is asking how to do something
        if any(word in question_lower for word in ["comment", "how to", "how do"]):
            return f"Voici ce que le cours explique : {context_parts[0]}"
        
        # Check if question is asking why
        if any(word in question_lower for word in ["pourquoi", "why"]):
            return f"Le cours explique que : {context_parts[0]}"
        
        # Default: provide context
        return f"Basé sur le contenu du cours, voici les informations pertinentes : {context_parts[0]}"
    
    def is_on_topic(self, message: str, course_id: str) -> bool:
        """
        Check if a question is related to the course content.
        Simple keyword-based approach.
        """
        # In production, use more sophisticated topic modeling
        off_topic_keywords = [
            "météo", "weather", "sport", "politique", "politics",
            "recette", "recipe", "film", "movie"
        ]
        
        message_lower = message.lower()
        return not any(keyword in message_lower for keyword in off_topic_keywords)

# Singleton instance
chatbot_service = ChatbotService()
