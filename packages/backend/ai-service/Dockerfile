FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Copy application
COPY --chown=appuser:appgroup app/ ./app/

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD python -c "import requests; requests.get('http://localhost:8001/health')"

# Switch to non-root user
USER appuser

# Start application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
