from typing import List, Dict, Any, Optional
try:
    import chromadb
    from chromadb.config import Settings as ChromaSettings
    CHROMA_AVAILABLE = True
except ImportError:
    CHROMA_AVAILABLE = False
    chromadb = None

from app.config import settings
from app.services.backend_client import backend_client
import logging
import os

logger = logging.getLogger(__name__)

class VectorDBService:
    """
    Vector database service using ChromaDB for RAG (Retrieval-Augmented Generation).
    Stores course content as embeddings for semantic search.
    """
    
    def __init__(self):
        self.client = None
        self.collection = None
        self._initialize_db()
    
    def _initialize_db(self):
        """Initialize ChromaDB client and collection"""
        if not CHROMA_AVAILABLE:
            logger.warning("ChromaDB not available. RAG features will be disabled.")
            return

        try:
            # Create data directory if it doesn't exist
            os.makedirs(settings.vector_db_path, exist_ok=True)
            
            # Initialize ChromaDB client
            self.client = chromadb.PersistentClient(
                path=settings.vector_db_path,
                settings=ChromaSettings(
                    anonymized_telemetry=False,
                    allow_reset=True
                )
            )
            
            # Get or create collection
            try:
                self.collection = self.client.get_collection(
                    name=settings.vector_db_collection
                )
                logger.info(f"Loaded existing collection: {settings.vector_db_collection}")
            except:
                self.collection = self.client.create_collection(
                    name=settings.vector_db_collection,
                    metadata={"description": "HAR Academy course content"}
                )
                logger.info(f"Created new collection: {settings.vector_db_collection}")
                
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {e}")
            self.client = None
            self.collection = None
    
    async def ingest_course(self, course_id: str) -> bool:
        """
        Ingest a course's content into the vector database.
        Fetches course data from backend and stores as embeddings.
        """
        if not self.collection:
            logger.error("ChromaDB not initialized")
            return False
        
        try:
            # Fetch course data
            course = await backend_client.get_course_by_id(course_id)
            if not course:
                logger.warning(f"Course {course_id} not found")
                return False
            
            # Extract text content from course
            documents = []
            metadatas = []
            ids = []
            
            # Add course description
            if course.get("description"):
                documents.append(course["description"])
                metadatas.append({
                    "course_id": course_id,
                    "type": "description",
                    "title": course.get("title", "")
                })
                ids.append(f"{course_id}_description")
            
            # Add modules and lessons (if available)
            modules = course.get("modules", [])
            for i, module in enumerate(modules):
                module_title = module.get("title", f"Module {i+1}")
                module_desc = module.get("description", "")
                
                if module_desc:
                    documents.append(f"{module_title}: {module_desc}")
                    metadatas.append({
                        "course_id": course_id,
                        "type": "module",
                        "module_index": i,
                        "title": module_title
                    })
                    ids.append(f"{course_id}_module_{i}")
                
                # Add lessons
                lessons = module.get("lessons", [])
                for j, lesson in enumerate(lessons):
                    lesson_title = lesson.get("title", f"Lesson {j+1}")
                    lesson_content = lesson.get("content", "")
                    
                    if lesson_content:
                        documents.append(f"{lesson_title}: {lesson_content}")
                        metadatas.append({
                            "course_id": course_id,
                            "type": "lesson",
                            "module_index": i,
                            "lesson_index": j,
                            "title": lesson_title
                        })
                        ids.append(f"{course_id}_module_{i}_lesson_{j}")
            
            # Add to collection
            if documents:
                self.collection.add(
                    documents=documents,
                    metadatas=metadatas,
                    ids=ids
                )
                logger.info(f"Ingested {len(documents)} documents for course {course_id}")
                return True
            else:
                logger.warning(f"No content found for course {course_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error ingesting course {course_id}: {e}")
            return False
    
    def search(
        self, 
        query: str, 
        course_id: Optional[str] = None,
        top_k: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Search for relevant content using semantic similarity.
        
        Args:
            query: Search query
            course_id: Optional course ID to filter results
            top_k: Number of results to return
            
        Returns:
            List of relevant documents with metadata
        """
        if not self.collection:
            logger.error("ChromaDB not initialized")
            return []
        
        try:
            # Build filter
            where_filter = None
            if course_id:
                where_filter = {"course_id": course_id}
            
            # Query collection
            results = self.collection.query(
                query_texts=[query],
                n_results=top_k,
                where=where_filter
            )
            
            # Format results
            documents = []
            if results and results.get("documents") and len(results["documents"]) > 0:
                for i in range(len(results["documents"][0])):
                    documents.append({
                        "content": results["documents"][0][i],
                        "metadata": results["metadatas"][0][i] if results.get("metadatas") else {},
                        "distance": results["distances"][0][i] if results.get("distances") else 0
                    })
            
            return documents
            
        except Exception as e:
            logger.error(f"Error searching vector DB: {e}")
            return []
    
    def delete_course(self, course_id: str) -> bool:
        """Delete all content for a specific course"""
        if not self.collection:
            return False
        
        try:
            # Get all IDs for this course
            results = self.collection.get(
                where={"course_id": course_id}
            )
            
            if results and results.get("ids"):
                self.collection.delete(ids=results["ids"])
                logger.info(f"Deleted {len(results['ids'])} documents for course {course_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error deleting course {course_id}: {e}")
            return False
    
    def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about the vector database"""
        if not self.collection:
            return {"error": "ChromaDB not initialized"}
        
        try:
            count = self.collection.count()
            return {
                "collection_name": settings.vector_db_collection,
                "document_count": count,
                "status": "active"
            }
        except Exception as e:
            logger.error(f"Error getting stats: {e}")
            return {"error": str(e)}

# Singleton instance
vector_db_service = VectorDBService()
