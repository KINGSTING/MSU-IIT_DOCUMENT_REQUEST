from app.models import db
from sqlalchemy import text

def get_data(code):
    return db.session.execute(
        text("""
            SELECT
                Request.category AS stage,  
                Request.student_type AS category,
                Mock_User.student_id,
                CONCAT(Mock_User.first_name, ' ', Mock_User.last_name) AS full_name,
                Mock_User.email,
                Request.request_datetime AS date_and_time,
                Request.request_updated_datetime AS updated_date_and_time,
                ReceiveInfo.category AS receive_type,
                ReceiveInfo.courier,
                ReceiveInfo.address,
                ReceiveInfo.contact_number,
                Payment.amount,
                Payment.proof_of_payment,
                Request.purpose,
                Admin.last_name,
                Mock_User.tor_pages,
                ReceiveInfo.shipping_number
            FROM 
                Request
            LEFT JOIN 
                Mock_User ON Request.student_id = Mock_User.student_id
            LEFT JOIN 
                Document_Request ON Request.request_id = Document_Request.request_id
            LEFT JOIN 
                ReceiveInfo ON Request.request_id = ReceiveInfo.request_id
            LEFT JOIN 
                Payment ON Request.request_id = Payment.request_id
            LEFT JOIN 
                Admin ON Request.admin_id = Admin.admin_id
            WHERE 
                Request.request_id = :id
        """),
        {'id': code}
    ).fetchone()

def get_documents(code):
    return db.session.execute(
        text("""
            SELECT document_type, price, copies_requested, sem_year, file_upload, document_category
            FROM Document_Request
            LEFT JOIN Document ON Document_Request.document_id = Document.document_id
            WHERE request_id = :id;
        """),
        {'id': code}
    ).fetchall()
    
def get_comments(code):
    return db.session.execute(
        text("""
            SELECT 
                comment_id,
                comment_body,
                user_type,
                COALESCE(Mock_User.email, Admin.email) AS commenter_email,
                comment_datetime
                
            FROM 
                comments
            LEFT JOIN Admin ON comments.admin_id = Admin.admin_id
            LEFT JOIN Mock_User ON comments.student_id = Mock_User.student_id
            WHERE 
                request_id = :id;

        """),
        {'id': code}
    ).fetchall()
    
def get_prices():
    return db.session.execute(
        text("""
            SELECT region, price
            FROM shipping_price;
        """)).fetchall()