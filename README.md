# 📄 MSU-IIT Document Request System

A web-based application developed for the **Office of the Registrar of MSU-IIT** to streamline the process of requesting academic documents.

---

## 🎯 Purpose

This system allows students and alumni to conveniently request, track, and receive academic documents (e.g., TOR, Certificate of Enrollment, etc.) through a secure and user-friendly interface. It reduces foot traffic in the registrar’s office and improves operational efficiency.

---

## 🛠️ Features

- 🧾 Document Request Submission
- 🔐 User Authentication (with My.IIT or manual info)
- 📦 Shipping and Delivery Option
- 📬 Request Status Tracking
- 📤 Email Notifications
- 🔍 Identity Verification
- 📄 Summary and Confirmation Pages
- 🛡️ Admin Dashboard (WIP)

---

## 📁 Project Structure

app/
│
├── static/
│ ├── images/
│ └── js/
├── templates/
│ ├── tracking/
│ ├── user_client/
│ └── ...
├── main.py
├── requirements.txt
└── .env.example

---

## 🚀 Tech Stack

- **Backend**: Python, Flask
- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Authentication**: Google OAuth (optional)
- **Email**: Flask-Mail (SMTP)
- **Deployment**: (to be added)


📌 Notes
Google OAuth credentials should not be pushed to GitHub.

This project is for academic or internal use within MSU-IIT.

Make sure .env and google_client.json are in .gitignore.

🙌 Acknowledgments
This project is maintained by Christian Dave Janiola, Zach Maregmen, Kyla Reambonanza, and Jemar John Lumingkit.
Special thanks to the Ricardo C. Enguito, MPA the Registrar of MSU-IIT and Malikey M. Maulana, MSCS as course adviser for their guidance.

