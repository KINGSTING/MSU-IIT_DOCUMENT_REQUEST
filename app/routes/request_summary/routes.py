from flask import render_template, redirect, url_for, request as flask_request, session, flash, jsonify
from app.models import Request, DocumentRequest, ReceiveInfo, Document, MockUser, Payment, ShippingPrice, Notifications
from flask import Blueprint
from app import db
import cloudinary.uploader
from flask_mail import Message
from flask_mail import Mail
from sqlalchemy.exc import IntegrityError
from uuid import uuid4

mail = Mail()

summary_bp = Blueprint('summary', __name__) 

@summary_bp.route('/summary', methods=['GET', 'POST'])
def request_summary():
    print(session)
    print("Session Keys in Request Summary:", session)
    if "user_info" not in session or 'ship_category' not in session:
        return redirect(url_for("auth.login"))
    
    with_google = False 
    if 'google_info' in session:
        with_google = True
    
    client_info = MockUser.query.filter_by(student_id=session['id_number']).first()
    
    # Get total
    documents = session['document_requests']
    print(documents)
    price = 0
    for document in documents:
        if document.get('documentType') == 'Authentication':
            pages = document.get('pages')
            price = price + (float(document.get("price").replace("Php ", ""))*int(pages))
        elif document.get('documentCategory') == 'Transcripts of Records':
            price = price + (float(document.get("price").replace("Php ", ""))*int(client_info.tor_pages))
        else:
            price = price + float(document.get("price").replace("Php ", ""))   
        
    session['price'] = price

    shipping_result = None
    shipping_price = 0
    payment_result  = None
    if session['ship_category'] == 'philippines':
        # Add shipping region and price per region
        selected_region = session['area']
        print(f"Area:", selected_region)
        
        shipping_price_entry = ShippingPrice.query.filter_by(region=selected_region).first()
        print("Shipping Price Entry:", shipping_price_entry)

        shipping_price = shipping_price_entry.price if shipping_price_entry else 0  # Default to 0 if not found
        print(f"Ship price: {shipping_price}")
        session['price'] = price + (shipping_price if shipping_price else 0)

        shipping_result = {
            "category": session['ship_category'],
            "contact_number": session['contact_number'],
            "courier": session['courier'],
            "address": session['address'],
            "region": session['area'],
            "price":  session['price']
        }
        
        payment_result = {
            "amount": price + (shipping_price if shipping_price else 0)
        }
    else:
        shipping_result = {
            "category": session['ship_category'],
            "contact_number": session['contact_number'],
            "price":  session['price']
        }
        payment_result = {
            "amount": price
        }
        
    request = {
        "purpose": session['purpose'],
        "student_type": session['student_category'],
        "request_id": session['id_number']
    }
        
    return render_template('/user_client/request_summary/request_summary.html', title='Request Summary',
                               document_result=session['document_requests'], 
                               shipping_result=shipping_result,
                               payment_result=payment_result, 
                               request=request,
                               shipping_price=shipping_price,
                               client_info=client_info,
                               tor_pages=client_info.tor_pages,
                               with_google=with_google)


@summary_bp.route('/submit', methods=['GET', 'POST'])
def finish_request():
    print("Session Keys in Submit Request:", session)
    if "user_info" not in session and "id_number" not in session:
        return redirect(url_for("auth.login"))

    # request_obj = Request.query.get(id)
    payment = None

    if flask_request.method == 'POST':
        # Magic Happens here - Submit to the database
        
        # Add request
        new_request = Request(
            student_id=session['id_number'],
            student_type=session['student_category'],  # Insert `student_category` into the Request table
            category=session['category'],
            admin_id=None,
            purpose=session['purpose'],
            tracking_code=str(uuid4())
        )
        try:
            db.session.add(new_request)
            db.session.commit()
        except IntegrityError as e:
            db.session.rollback()
            print(f"Database error: {e}")
            return jsonify({"status": "error", "message": "Database error occurred while saving the request."}), 500
        
        session['tracking_code'] = new_request.tracking_code
        
        # Add documents
        document_requests = session['document_requests']
        for doc_req in document_requests:
            document_type = doc_req.get("documentCategory")
            category = doc_req.get("documentType")
            document_id = Document.get_document_id_by_type(document_type=document_type)
            document_request = DocumentRequest(
                request_id=new_request.request_id,
                document_id=document_id,
                copies_requested=doc_req.get("pages"),
                sem_year = doc_req.get('sem_year'),
                file_upload = doc_req.get('file_upload') if category == 'Authentication' else None
            )
            db.session.add(document_request)
            
        # Add recieve info
        new_receive_info = None
        if session["ship_category"] == 'pickup':
            new_receive_info = ReceiveInfo(
                request_id=new_request.request_id,
                category="For_Pickup",
                courier="N/A",
                address="N/A",
                contact_number=session["contact_number"]
            )
        else:
            new_receive_info = ReceiveInfo(
                request_id=new_request.request_id,
                category="Within_Philippines",
                courier=session["courier"],
                address=session["address"]+"[region]="+session['area'],
                contact_number=session["contact_number"]
            )
        try:
            db.session.add(new_receive_info)
            db.session.commit()
        except Exception as e:
            print(f"Error saving ReceiveInfo entry: {str(e)}")  # Debugging error message
            return jsonify({"status": "error", "message": "Error saving shipping details."}), 500

        # Get img URL and Add payment
        # Handle file upload if proof doesn't exist
        image_file = flask_request.files.get('proof_payment_img')
        amount = flask_request.form.get('amount')
        image_url = None
        
        if image_file:
            print("File received for upload")
            try:
                print("Uploading image to Cloudinary...")
                upload_result = cloudinary.uploader.upload(image_file)
                image_url = upload_result.get('secure_url')
                if not image_url:
                    raise ValueError("Failed to obtain secure URL from Cloudinary.")
                else:
                    print("Uploaded successfully", image_url)
                    # Upload payment to database 
                    payment = Payment(
                        request_id=new_request.request_id,
                        amount=session['price'],
                        proof_of_payment=image_url
                    )
                    db.session.add(payment)
                    db.session.commit()
                    
            except Exception as e:
                flash(f"An error occurred while uploading: {str(e)}", "danger")
    
        tracking_code = session['tracking_code']
        
        print(f"TRACKING CODE HEEEEEEREEEEEEEE: {tracking_code}")
        
        # Send email
        try:
            html_content = render_template('email_template.html', 
                                        subject="Request Submitted Successfully", 
                                        body="Congratulations! You have successfully submitted your request.", 
                                        code= session['tracking_code'],  
                                        status="submit")

            msg = Message(
                subject="Request Submitted Successfully",
                recipients=[session["email"]]
            )
            msg.html = html_content
            
            mail.send(msg)
        except Exception as e:
            return f"Error: {e}"
        
        # Add notification
        new_notification = Notifications(
            request_id = None,
            new_request= True,
            user_type = "user",
            notification_body = "Submitted a request",
            admin_id = None,
            student_id = session['id_number']
        )
        
        db.session.add(new_notification)
        
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
        
        # Clear session after submit
        if 'google_info' in session:
            session_google_info = session['google_info']
            session.clear()
            session['google_info'] = session_google_info
            return jsonify({"msg": "success"})
        else:
            session.clear()
            return render_template('/user_client/request_summary/finish_request.html', tracking_code=tracking_code)
    
    return jsonify({"msg": "why are we here"})