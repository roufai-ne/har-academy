from typing import List
from app.models.schemas import QuizQuestion, QuizOption, DifficultyLevel, QuestionType
import re
import uuid
import logging

logger = logging.getLogger(__name__)

class QuizGenerationService:
    """
    Quiz generation service using rule-based NLP techniques.
    No LLM required - uses text processing and pattern matching.
    """
    
    def generate_quiz(
        self, 
        content: str, 
        num_questions: int = 5,
        difficulty: DifficultyLevel = DifficultyLevel.MEDIUM,
        language: str = "fr"
    ) -> List[QuizQuestion]:
        """
        Generate quiz questions from content using:
        1. Sentence extraction
        2. Key term identification
        3. Cloze test generation
        4. Distractor generation
        """
        try:
            # Split content into sentences
            sentences = self._split_into_sentences(content)
            
            if len(sentences) < num_questions:
                logger.warning(f"Not enough sentences ({len(sentences)}) for {num_questions} questions")
                num_questions = min(num_questions, len(sentences))
            
            # Select important sentences
            important_sentences = self._select_important_sentences(sentences, num_questions)
            
            # Generate questions
            questions = []
            for i, sentence in enumerate(important_sentences[:num_questions]):
                question = self._generate_question_from_sentence(
                    sentence, 
                    i, 
                    difficulty,
                    language
                )
                if question:
                    questions.append(question)
            
            return questions
            
        except Exception as e:
            logger.error(f"Error generating quiz: {e}")
            return []
    
    def _split_into_sentences(self, content: str) -> List[str]:
        """Split text into sentences"""
        # Simple sentence splitting (can be improved with spaCy)
        sentences = re.split(r'[.!?]+', content)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
        return sentences
    
    def _select_important_sentences(self, sentences: List[str], count: int) -> List[str]:
        """
        Select most important sentences based on:
        - Length (prefer medium-length sentences)
        - Contains numbers or technical terms
        - Not too short or too long
        """
        scored_sentences = []
        for sentence in sentences:
            score = 0
            words = sentence.split()
            
            # Prefer medium-length sentences (10-25 words)
            if 10 <= len(words) <= 25:
                score += 2
            
            # Contains numbers (likely factual)
            if re.search(r'\d+', sentence):
                score += 1
            
            # Contains capitalized words (likely important terms)
            capitalized = sum(1 for w in words if w[0].isupper() and len(w) > 1)
            score += min(capitalized, 3)
            
            scored_sentences.append((sentence, score))
        
        # Sort by score and return top N
        scored_sentences.sort(key=lambda x: x[1], reverse=True)
        return [s[0] for s in scored_sentences[:count]]
    
    def _generate_question_from_sentence(
        self, 
        sentence: str, 
        index: int,
        difficulty: DifficultyLevel,
        language: str
    ) -> QuizQuestion:
        """Generate a cloze-style question from a sentence"""
        words = sentence.split()
        
        # Find a good word to blank out (noun, verb, or number)
        blank_word = self._find_blank_word(words)
        
        if not blank_word:
            blank_word = words[len(words) // 2]  # Fallback: middle word
        
        # Create question text
        question_text = sentence.replace(blank_word, "______")
        
        # Generate options
        correct_option = QuizOption(
            id="A",
            text=blank_word,
            isCorrect=True
        )
        
        # Generate distractors (simple approach)
        distractors = self._generate_distractors(blank_word, difficulty)
        
        options = [correct_option] + [
            QuizOption(id=chr(66 + i), text=d, isCorrect=False)
            for i, d in enumerate(distractors[:3])
        ]
        
        # Shuffle options (in production, randomize)
        
        explanation_text = f"La réponse correcte est '{blank_word}'." if language == "fr" else f"The correct answer is '{blank_word}'."
        
        return QuizQuestion(
            id=str(uuid.uuid4()),
            text=question_text,
            type=QuestionType.MULTIPLE_CHOICE,
            options=options,
            difficulty=difficulty,
            explanation=explanation_text
        )
    
    def _find_blank_word(self, words: List[str]) -> str:
        """Find a good word to blank out (prefer nouns, numbers, or important terms)"""
        # Prefer capitalized words (likely proper nouns or important terms)
        for word in words:
            if len(word) > 3 and word[0].isupper() and word.isalpha():
                return word
        
        # Prefer words with numbers
        for word in words:
            if re.search(r'\d', word):
                return word
        
        # Prefer longer words (likely more meaningful)
        long_words = [w for w in words if len(w) > 6 and w.isalpha()]
        if long_words:
            return long_words[0]
        
        return ""
    
    def _generate_distractors(self, correct_answer: str, difficulty: DifficultyLevel) -> List[str]:
        """Generate plausible wrong answers"""
        distractors = []
        
        # Strategy 1: Similar words (simple approach)
        if correct_answer.isdigit():
            # For numbers, generate nearby numbers
            num = int(correct_answer)
            distractors = [str(num - 1), str(num + 1), str(num * 2)]
        else:
            # For text, generate variations
            distractors = [
                correct_answer + "s",  # Plural
                correct_answer.lower() if correct_answer[0].isupper() else correct_answer.capitalize(),
                correct_answer[::-1][:len(correct_answer)]  # Reversed (placeholder)
            ]
        
        # Ensure we have at least 3 distractors
        while len(distractors) < 3:
            distractors.append(f"Option {len(distractors) + 1}")
        
        return distractors[:3]

# Singleton instance
quiz_service = QuizGenerationService()
