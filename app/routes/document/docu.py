from flask import jsonify, request, Blueprint, render_template, session, redirect, url_for
from app.models import Document

docu = Blueprint("docu", __name__)


# Home page
@docu.route("/documents")
def document_page():
    print("Session Keys in Documents:", session)
    if "user_info" not in session and 'id_number' not in session:
        return redirect(url_for("auth.login"))
    
    print("It work")
    return render_template("user_client/document_request/document.html")


# Modify the submit_request route to handle file upload and semester/year
@docu.route("/submit_request", methods=["POST"])
def submit_request():
    print("Session Keys in Submit Request:", session.keys())
    if "user_info" not in session and "id_number" not in session:
        return redirect(url_for("auth.login"))

    # Log the raw body to debug the request content
    print("Request data (raw):", request.data)

    # Get the JSON data
    data = request.get_json()

    if not data:
        return jsonify({"status": "error", "message": "No data received"}), 400

    print("Received data:", data)

    # Access student_category from the data payload
    student_category1 = data.get("studentCategory")  # Get the student category

    if not student_category1:
        return jsonify({"status": "error", "message": "Student category is required"}), 400

    print("Student category:", student_category1)

    if isinstance(data, list):
        document_requests = data
    else:
        document_requests = data.get("documents", [])

    print("Document requests:", document_requests)

    if not document_requests:
        return jsonify({"status": "error", "message": "No document requests provided"}), 400

    # Storing additional values in the session
    sem_year = data.get("sem_year")
    file_upload = data.get("file_upload")

    # You can store them in the session for further use
    session['sem_year'] = sem_year
    session['file_upload'] = file_upload

    # Populate session
    session['student_category'] = student_category1
    session['category'] = "Pending"
    session['purpose'] = data.get("purpose")
    session['document_requests'] = document_requests

    # Process document requests
    for doc_req in document_requests:
        document_type = doc_req.get("documentCategory")
        if not document_type:
            print(f"Missing document type for request: {doc_req}")
            return jsonify({"status": "error", "message": "Document type is required for each document request"}), 400

        print(f"Processing document type: {document_type}")

        document_id = Document.get_document_id_by_type(document_type)
        if not document_id:
            print(f"Document with type '{document_type}' not found")
            return jsonify({"status": "error", "message": f"Document with type '{document_type}' not found"}), 400

        print(f"Document ID found: {document_id}")

    print("It was a success")
    return jsonify({"id": "none"})
