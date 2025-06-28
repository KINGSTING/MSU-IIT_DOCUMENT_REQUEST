from sqlalchemy.exc import NoResultFound
from sqlalchemy import Enum, ForeignKey, CheckConstraint, desc
from sqlalchemy.orm import relationship
import enum
from . import db

# Enum definitions
class CategoryEnum(enum.Enum):
    Within_Philippines = "Within Philippines"
    Abroad = "Abroad"
    For_Pickup = "For Pickup"

class StudentTypeEnum(enum.Enum):
    Current = "Current"
    Alumni = "Alumni"
    Former = "Former"

class RequestStatusEnum(enum.Enum):
    Pending = "Pending"
    Clarifying = "Clarifying"
    Processing = "Processing"
    Ready = "Ready"
    Completed = "Completed"

class DocumentCategoryEnum(enum.Enum):
    Special = "Special"
    Certification = "Certification"
    Authentication = "Authentication"

# Define each table as a class
class MockUser(db.Model):
    __tablename__ = 'Mock_User'

    student_id = db.Column(db.String(15), primary_key=True, index=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(50), nullable=False) 
    email = db.Column(db.String(70), unique=True, nullable=False)
    birth_date = db.Column(db.Date, nullable=False)
    tor_pages = db.Column(db.Integer, nullable=False)
    liabilities = db.Column(db.Boolean, default=False)

    requests = relationship('Request', back_populates='student', lazy=True)
    comments = relationship('Comment', back_populates='student', lazy=True)
    notifications = relationship('Notifications', back_populates='student', lazy=True)

class Admin(db.Model):
    __tablename__ = 'Admin'

    admin_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    first_name = db.Column(db.String(50), unique=True, nullable=False)
    last_name = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    logged_in = db.Column(db.Boolean, nullable=False, default=False)

    requests = relationship('Request', back_populates='admin', lazy=True)
    comments = relationship('Comment', back_populates='admin', lazy=True)
    notifications = relationship('Notifications', back_populates='admin', lazy=True)

class ReceiveInfo(db.Model):
    __tablename__ = 'ReceiveInfo'

    receive_info_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    request_id = db.Column(db.Integer, ForeignKey('Request.request_id', ondelete="CASCADE"), nullable=False)
    category = db.Column(Enum(CategoryEnum), nullable=False)
    courier = db.Column(db.String(50))
    shipping_number = db.Column(db.String(15))
    address = db.Column(db.Text)
    contact_number = db.Column(db.String(15))

    request = relationship('Request', back_populates='receive_info')

class Payment(db.Model):
    __tablename__ = 'Payment'

    payment_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    request_id = db.Column(db.Integer, ForeignKey('Request.request_id', ondelete="CASCADE"), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    proof_of_payment = db.Column(db.String(255))

    request = relationship('Request', back_populates='payment')

class Request(db.Model):
    __tablename__ = 'Request'

    request_id = db.Column(db.Integer, primary_key=True, autoincrement=True, index=True)
    student_id = db.Column(db.String(15), ForeignKey('Mock_User.student_id'), nullable=False)
    student_type = db.Column(Enum(StudentTypeEnum), nullable=False)
    request_datetime = db.Column(db.DateTime, server_default=db.func.now())
    request_updated_datetime = db.Column(db.DateTime, server_default=db.func.now())
    tracking_code = db.Column(db.String(50), unique=True)
    category = db.Column(Enum(RequestStatusEnum), nullable=False, index=True)
    purpose = db.Column(db.String(255), nullable=False)
    read_status = db.Column(db.Boolean, default=False)
    admin_id = db.Column(db.Integer, ForeignKey('Admin.admin_id'))
    
    receive_info = relationship('ReceiveInfo', back_populates='request', uselist=False)
    payment = relationship('Payment', back_populates='request', uselist=False)
    document_requests = relationship('DocumentRequest', back_populates='request', lazy=True)
    student = relationship('MockUser', back_populates='requests')
    admin = relationship('Admin', back_populates='requests')
    comments = relationship('Comment', back_populates='request', lazy=True)
    notifications = relationship('Notifications', back_populates='request', lazy=True)

    @staticmethod
    def get_latest_request_id():
        latest_request = db.session.query(Request).order_by(desc(Request.request_datetime)).first()

        if latest_request:
            return latest_request.request_id
        else:
            return None

class Document(db.Model):
    __tablename__ = 'Document'

    document_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    document_type = db.Column(db.String(100), unique=True, nullable=False)
    document_category = db.Column(Enum(DocumentCategoryEnum), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    per_page = db.Column(db.Boolean, default=False)

    document_requests = relationship('DocumentRequest', back_populates='document', lazy=True)

    @staticmethod
    def get_document_id_by_type(document_type):
        try:
            document = db.session.query(Document).filter_by(document_type=document_type).one()
            return document.document_id
        except NoResultFound:
            return None

class DocumentRequest(db.Model):
    __tablename__ = 'Document_Request'

    document_request_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    request_id = db.Column(db.Integer, ForeignKey('Request.request_id', ondelete="CASCADE"), nullable=False)
    document_id = db.Column(db.Integer, ForeignKey('Document.document_id', ondelete="CASCADE"), nullable=False)
    copies_requested = db.Column(db.Integer, default=1)
    sem_year = db.Column(db.String(100))
    file_upload = db.Column(db.String(255))
    additional_info = db.Column(db.Text)

    request = relationship('Request', back_populates='document_requests')
    document = relationship('Document', back_populates='document_requests')

class Comment(db.Model):
    __tablename__ = 'comments'

    comment_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    comment_body = db.Column(db.String(400), nullable=False)
    request_id = db.Column(db.Integer, ForeignKey('Request.request_id', ondelete="CASCADE"), nullable=False)
    comment_datetime = db.Column(db.DateTime, server_default=db.func.now())
    user_type = db.Column(Enum('admin', 'user', name='user_type_enum'), nullable=False)
    admin_id = db.Column(db.Integer, ForeignKey('Admin.admin_id'), nullable=True)
    student_id = db.Column(db.String(15), ForeignKey('Mock_User.student_id'), nullable=True)

    __table_args__ = (
        CheckConstraint(
            "(user_type = 'admin' AND admin_id IS NOT NULL AND student_id IS NULL) OR "
            "(user_type = 'user' AND student_id IS NOT NULL AND admin_id IS NULL)",
            name='user_type_admin_student_check'
        ),
    )

    request = relationship('Request', back_populates='comments')
    admin = relationship('Admin', back_populates='comments')
    student = relationship('MockUser', back_populates='comments')

class Notifications(db.Model):
    __tablename__ = 'notifications'

    notification_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    notification_body = db.Column(db.String(400), nullable=False)
    request_id = db.Column(db.Integer, db.ForeignKey('Request.request_id', ondelete="CASCADE"), nullable=True)
    new_request = db.Column(db.Boolean, nullable=True)
    notification_datetime = db.Column(db.DateTime, server_default=db.func.now())
    user_type = db.Column(db.Enum('admin', 'user', name='user_type_enum'), nullable=False)
    admin_id = db.Column(db.Integer, db.ForeignKey('Admin.admin_id'), nullable=True)
    student_id = db.Column(db.String(15), db.ForeignKey('Mock_User.student_id'), nullable=True)
    read_status = db.Column(db.Boolean, default=False)

    __table_args__ = (
        CheckConstraint(
            "(user_type = 'admin' AND student_id IS NOT NULL AND admin_id IS NULL) OR "
            "(user_type = 'user' AND admin_id IS NOT NULL AND student_id IS NULL AND new_request IS NULL) OR "
            "(user_type = 'user' AND admin_id IS NULL AND student_id IS NOT NULL AND new_request IS NOT NULL) OR "
            "(user_type = 'user' AND request_id IS NOT NULL AND new_request IS NULL) OR "
            "(user_type = 'user' AND new_request IS NOT NULL AND request_id IS NULL)",
            name='user_type_student_admin_check'
        ),
    )

    request = db.relationship('Request', back_populates='notifications')
    admin = db.relationship('Admin', back_populates='notifications')
    student = db.relationship('MockUser', back_populates='notifications')

class ShippingPrice(db.Model):
    __tablename__ = 'shipping_price'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    region = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Integer, nullable=False, default=0)
    

    