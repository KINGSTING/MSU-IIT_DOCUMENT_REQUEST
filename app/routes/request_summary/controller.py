from app import db
from app.models import DocumentRequest, Document

def get_document_requests(request_id):
    document_requests = (
        db.session.query(DocumentRequest, Document)
        .join(Document, DocumentRequest.document_id == Document.document_id)
        .filter(DocumentRequest.request_id == request_id)
        # .with_entities(DocumentRequest, Document) 
        .all()
    )
    return document_requests