-- Create the database
CREATE DATABASE IF NOT EXISTS registrar;
USE registrar;

SET GLOBAL time_zone = '+8:00';

-- Create the Mock_User table (mock of the school database students)
CREATE TABLE Mock_User (
    student_id VARCHAR(15) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(70) UNIQUE NOT NULL,
    password VARCHAR(59) NOT NULL,
    birth_date DATE NOT NULL,
    tor_pages INT NOT NULL,
    liabilities BOOLEAN DEFAULT FALSE
);

-- Create the Admin table
CREATE TABLE Admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) UNIQUE NOT NULL,
    last_name VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    logged_in BOOLEAN NOT NULL DEFAULT FALSE,
    password VARCHAR(255) NOT NULL
);

-- Create the ReceiveInfo table
CREATE TABLE ReceiveInfo (
    receive_info_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    category ENUM('Within Philippines', 'Abroad', 'For Pickup') NOT NULL,
    courier VARCHAR(50),
    shipping_number VARCHAR(15),
    address TEXT,
    contact_number VARCHAR(15),
    FOREIGN KEY (request_id) REFERENCES Request(request_id) ON DELETE CASCADE
);

-- Create the Payment table
CREATE TABLE Payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    proof_of_payment VARCHAR(255),
    FOREIGN KEY (request_id) REFERENCES Request(request_id) ON DELETE CASCADE
);

-- Create the Request table
CREATE TABLE Request (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(15) NOT NULL,
    student_type ENUM('Current', 'Alumni', 'Former') NOT NULL,
    request_datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    request_updated_datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    tracking_code VARCHAR(50) UNIQUE NOT NULL,
    category ENUM('Pending', 'Clarifying', 'Processing', 'Ready', 'Completed') NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    read_status BOOLEAN DEFAULT FALSE,
    admin_id INT,
    FOREIGN KEY (student_id) REFERENCES Mock_User(student_id),
    FOREIGN KEY (admin_id) REFERENCES Admin(admin_id)
);

-- Create the Document table
CREATE TABLE Document (
    document_id INT AUTO_INCREMENT PRIMARY KEY,
    document_type VARCHAR(100) UNIQUE NOT NULL,
    document_category ENUM('Special', 'Certification', 'Authentication') NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    per_page BOOLEAN DEFAULT FALSE
);

-- Create the Document_Request table (intermediary for requests and documents)
CREATE TABLE Document_Request (
    document_request_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    document_id INT NOT NULL,
    copies_requested INT DEFAULT 1,
    sem_year VARCHAR(100), -- Ex. 1st Sem - 2024-2025
    file_upload VARCHAR(255),
    additional_info TEXT,
    FOREIGN KEY (request_id) REFERENCES Request(request_id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES Document(document_id) ON DELETE CASCADE
);

-- Create the request comments table
CREATE TABLE comments (
	comment_id INT PRIMARY KEY AUTO_INCREMENT,
	comment_body VARCHAR(400) NOT NULL,
	request_id INT NOT NULL,
    comment_datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_type ENUM('admin', 'user') NOT NULL,
    admin_id INT,
    student_id VARCHAR(15),
    FOREIGN KEY (student_id) REFERENCES Mock_User(student_id),
    FOREIGN KEY (admin_id) REFERENCES Admin(admin_id),
	FOREIGN KEY (request_id) REFERENCES Request(request_id) ON DELETE CASCADE

    CHECK (
        (user_type = 'admin' AND admin_id IS NOT NULL AND student_id IS NULL)
        OR
        (user_type = 'user' AND student_id IS NOT NULL AND admin_id IS NULL)
    )
);

-- Create the notifications table
CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    notification_body VARCHAR(400) NOT NULL,
    request_id INT,
    new_request BOOLEAN,
    notification_datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_type ENUM('admin', 'user') NOT NULL,
    admin_id INT,
    student_id VARCHAR(15),
    read_status BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (student_id) REFERENCES Mock_User(student_id),
    FOREIGN KEY (admin_id) REFERENCES Admin(admin_id),
    FOREIGN KEY (request_id) REFERENCES Request(request_id) ON DELETE CASCADE,
    CHECK (
        (user_type = 'admin' AND student_id IS NOT NULL AND admin_id IS NULL)
        OR
        (user_type = 'user' AND admin_id IS NOT NULL AND student_id IS NULL AND new_request IS NULL)
        OR
        (user_type = 'user' AND admin_id IS NULL AND student_id IS NOT NULL AND new_request IS NOT NULL)
        OR
        (user_type = 'user' AND request_id IS NOT NULL AND new_request IS NULL)
        OR
        (user_type = 'user' AND new_request IS NOT NULL AND request_id IS NULL)
    )
);

-- Create the shipping prices table
CREATE TABLE shipping_price
	id INT PRIMARY KEY  AUTO_INCREMENT,
	region VARCHAR(50) NOT NULL,
	price INT NOT NULL DEFAULT 0;


-- Not in model
-- Create the web session table
CREATE TABLE web_session (
    id INT PRIMARY KEY AUTO_INCREMENT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    email VARCHAR(150) NOT NULL,
    id_number VARCHAR(9) NOT NULL,
    email_code INT NOT NULL
);


-- Triggers to fix time
DELIMITER $$
CREATE TRIGGER set_request_timestamps
BEFORE INSERT ON Request
FOR EACH ROW
BEGIN
    SET NEW.request_datetime = CURRENT_TIMESTAMP + INTERVAL 8 HOUR;
    SET NEW.request_updated_datetime = CURRENT_TIMESTAMP + INTERVAL 8 HOUR;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER set_comments_timestamps
BEFORE INSERT ON comments
FOR EACH ROW
BEGIN
    SET NEW.comment_datetime = CURRENT_TIMESTAMP + INTERVAL 8 HOUR;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER set_notifications_timestamps
BEFORE INSERT ON notifications
FOR EACH ROW
BEGIN
    SET NEW.notification_datetime = CURRENT_TIMESTAMP + INTERVAL 8 HOUR;
END$$
DELIMITER ;

-- Test Queries
INSERT INTO Mock_User VALUES
('2022-0137', 'Christian Dave', 'Janiola', 'password', 'cjaniola01@gmail.com', '2003-08-30', FALSE),
('2022-0138', 'Kyla', 'Reambonanza', 'password', 'kyla@gmail.com', '2003-07-30', FALSE),
('2022-1991', 'Jemar', 'John', 'password', 'lumingkitjemar@gmail.com', '2003-06-30', FALSE),
('2022-1106', 'Zach', 'David', 'password', 'zach@gmail.com', '2003-05-30', TRUE),
('2022-0141', 'Marian', 'Alcantara', 'password', 'marian@gmail.com', '2003-04-30', FALSE),
('2022-0142', 'Elijah', 'Bautista', 'password', 'elijah@gmail.com', '2003-03-30', FALSE),
('2022-0143', 'Sofia', 'Santiago', 'password', 'sofia@gmail.com', '2003-02-28', FALSE),
('2022-0144', 'Noah', 'Dela Cruz', 'password', 'noah@gmail.com', '2003-01-15', FALSE),
('2022-0145', 'Liam', 'Ocampo', 'password', 'liam@gmail.com', '2003-12-12', FALSE);

INSERT INTO Admin (first_name, last_name, email, logged_in, password) VALUES 
('Chris', 'John', 'chris@gmail.com', FALSE, 'password'),
('Angel', 'Chris', 'angel@gmail.com', FALSE, 'password');

INSERT INTO Document (document_type, document_category, price, per_page) VALUES
('Evaluation', 'Special', 50.00, FALSE),
('Diploma', 'Special', 150.00, FALSE),
('COR Reprinting', 'Special', 20.00, FALSE),
('Report of Grades', 'Special', 20.00, FALSE),
('Reprinting of Diploma', 'Special', 150.00, FALSE),
('Transcripts of Records', 'Special', 50.00, TRUE),
('Transfer Credentials', 'Special', 150.00, FALSE),
('CAV (Foreign Employment)', 'Special', 350.00, FALSE),
('Auth Certificate', 'Authentication', 10.00, TRUE),
('Auth Transcript', 'Authentication', 10.00, TRUE),
('Auth Diploma', 'Authentication', 10.00, TRUE),
('Cert. 12.1a: Current Student (Summer)', 'Certification', 50.00, FALSE),
('Cert. 12.1b: Current Student, units earned', 'Certification', 50.00, FALSE),
('Cert. 12.1c: Current Student, GSIS', 'Certification', 50.00, FALSE),
('Cert. 12.1d: Current Student w/o GPA', 'Certification', 50.00, FALSE),
('Cert. 12.1e: Former Student, units earned', 'Certification', 50.00, FALSE),
('Cert. 12.2: Cert. 12.2: Current Student w/ GPA', 'Certification', 50.00, FALSE),
('Cert. 12.3a: Former Student w/ GPA', 'Certification', 50.00, FALSE),
('Cert. 12.3b: Former Student w/o GPA', 'Certification', 50.00, FALSE),
('Cert. 12.4a: English as a Medium of Instruction, Student', 'Certification', 50.00, FALSE),
('Cert. 12.4b: English as a Medium of Instruction, Alumnus (Undergraduate)', 'Certification', 50.00, FALSE),
('Cert. 12.4c: English as a Medium of Instruction, Alumnus (Graduate)', 'Certification', 50.00, FALSE),
('Cert. 12.4d: English as a Medium of Instruction, Alumnus (Undergraduate) Foreign Affairs', 'Certification', 50.00, FALSE),
('Cert. 12.4e: English as a Medium of Instruction, Alumnus (Graduate) Foreign Affairs', 'Certification', 50.00, FALSE),
('Cert. 12.5a: English Units Earned, Student', 'Certification', 50.00, FALSE),
('Cert. 12.5b: Education Units Earned, Former Student', 'Certification', 50.00, FALSE),
('Cert. 12.5c: Education Units Earned, Current Student', 'Certification', 50.00, FALSE),
('Cert. 12.5d: Education Subjects and Units Earned with GPA, Current Student', 'Certification', 50.00, FALSE),
('Cert. 12.5e: Education Subjects and Units Earned with GPA, Former Student', 'Certification', 50.00, FALSE),
('Cert. 12.5f: Education Subjects and Units Earned with GPA, Alumnus', 'Certification', 50.00, FALSE),
('Cert. 12.7: Current Student with Subjects Taken', 'Certification', 50.00, FALSE),
('Cert. 12.8a: Graduating with GPA', 'Certification', 50.00, FALSE),
('Cert. 12.8b: Graduating without GPA', 'Certification', 50.00, FALSE),
('Cert. 12.9a: CAR Pending BOR Res.', 'Certification', 50.00, FALSE),
('Cert. 12.9b: CAR w/o Thesis/Dissertation', 'Certification', 50.00, FALSE),
('Cert. 12.10: Graduation w/o GPA', 'Certification', 50.00, FALSE),
('Cert. 12.11: Graduation with GPA', 'Certification', 50.00, FALSE),
('Cert. 12.11A: Graduation with GPA & Equivalent Grade', 'Certification', 50.00, FALSE),
('Cert. 12.12: Academic Honors', 'Certification', 50.00, FALSE),
('Cert. 12.12A: Academic Honors with No. of Graduates in Respective Program', 'Certification', 50.00, FALSE),
('Cert. 12.13:: Valedictorian/Salutatorian', 'Certification', 50.00, FALSE),
('Cert. 12.14: Grade Equivalency', 'Certification', 50.00, FALSE),
('Cert. 12.21: Practice Teaching Units Earned with GPA, Alumnus', 'Certification', 50.00, FALSE),
('Cert. 12.22: Practice Teaching Units Earned with GPA, CPRT', 'Certification', 50.00, FALSE),
('Cert. 12.23:: Academic Honors with Ranking', 'Certification', 50.00, FALSE),
('Cert. 12.26: Bonafide Student of MSU-IIT with ID', 'Certification', 50.00, FALSE),
('Cert. 12.29: Certification – Foreign Affairs, Consular Section, Alumnus (Undergraduate)', 'Certification', 50.00, FALSE);

INSERT INTO shipping_price (region, price) VALUES
('Mindanao', 150),
('Visayas', 200),
('Luzon', 250);

-- Testing
INSERT INTO Request (student_id, student_type, category, admin_id, request_datetime, request_updated_datetime, tracking_code, purpose) VALUES  
('2022-0137', 'Current', 'Pending', 1, DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_ADD(NOW(), INTERVAL 8 HOUR), UUID(), 'Testing'),
('2022-0137', 'Current', 'Pending', 1, DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_ADD(NOW(), INTERVAL 8 HOUR), UUID(), 'Testing'),
('2022-0137', 'Current', 'Pending', 1, DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_ADD(NOW(), INTERVAL 8 HOUR), UUID(), 'Testing'),
('2022-0138', 'Alumni', 'Pending', 1, DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_ADD(NOW(), INTERVAL 8 HOUR), UUID(), 'Testing'),
('2022-0138', 'Alumni', 'Pending', 1, DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_ADD(NOW(), INTERVAL 8 HOUR), UUID(), 'Testing'),
('2022-0138', 'Alumni', 'Pending', 1, DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_ADD(NOW(), INTERVAL 8 HOUR), UUID(), 'Testing'),
('2022-1991', 'Former', 'Pending', 1, DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_ADD(NOW(), INTERVAL 8 HOUR), UUID(), 'Testing'),
('2022-1991', 'Former', 'Pending', 1, DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_ADD(NOW(), INTERVAL 8 HOUR), UUID(), 'Testing'),
('2022-1991', 'Former', 'Pending', 1, DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_ADD(NOW(), INTERVAL 8 HOUR), UUID(), 'Testing'),
('2022-1106', 'Current', 'Pending', 1, DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_ADD(NOW(), INTERVAL 8 HOUR), UUID(), 'Testing'),
('2022-1106', 'Current', 'Pending', 1, DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_ADD(NOW(), INTERVAL 8 HOUR), UUID(), 'Testing'),
('2022-1106', 'Current', 'Pending', 1, DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_ADD(NOW(), INTERVAL 8 HOUR), UUID(), 'Testing'),
('2022-0141', 'Alumni', 'Pending', 1, DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_ADD(NOW(), INTERVAL 8 HOUR), UUID(), 'Testing'),
('2022-0141', 'Alumni', 'Pending', 2, DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_ADD(NOW(), INTERVAL 8 HOUR), UUID(), 'Testing'),
('2022-0141', 'Alumni', 'Pending', 2, DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_ADD(NOW(), INTERVAL 8 HOUR), UUID(), 'Testing'),
('2022-0142', 'Current', 'Pending', 2, DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_ADD(NOW(), INTERVAL 8 HOUR), UUID(), 'Testing'),
('2022-0142', 'Current', 'Pending', 2, DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_ADD(NOW(), INTERVAL 8 HOUR), UUID(), 'Testing'),
('2022-0142', 'Current', 'Pending', 2, DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_ADD(NOW(), INTERVAL 8 HOUR), UUID(), 'Testing'),
('2022-0143', 'Former', 'Pending', 2, DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_ADD(NOW(), INTERVAL 8 HOUR), UUID(), 'Testing'),
('2022-0143', 'Former', 'Pending', 2, DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_ADD(NOW(), INTERVAL 8 HOUR), UUID(), 'Testing'),
('2022-0143', 'Former', 'Pending', 2, DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_ADD(NOW(), INTERVAL 8 HOUR), UUID(), 'Testing'),
('2022-0144', 'Current', 'Pending', 2, DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_ADD(NOW(), INTERVAL 8 HOUR), UUID(), 'Testing'),
('2022-0144', 'Current', 'Pending', 2, DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_ADD(NOW(), INTERVAL 8 HOUR), UUID(), 'Testing'),
('2022-0144', 'Current', 'Pending', 2, DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_ADD(NOW(), INTERVAL 8 HOUR), UUID(), 'Testing'),
('2022-0145', 'Alumni', 'Pending', 2, DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_ADD(NOW(), INTERVAL 8 HOUR), UUID(), 'Testing');

INSERT INTO Document_Request (request_id, document_id, copies_requested) VALUES
(1, 1, 5),
(1, 2, 5),
(2, 1, 5),
(2, 3, 5),
(3, 1, 5),
(3, 2, 5),
(4, 1, 5),
(5, 1, 5),
(5, 3, 5),
(6, 1, 5),
(6, 2, 5),
(7, 1, 5),
(8, 1, 5),
(8, 2, 5),
(9, 1, 5),
(10, 1, 5),
(11, 1, 5),
(12, 1, 5),
(13, 1, 5),
(14, 1, 5),
(15, 1, 5),
(16, 1, 5),
(17, 1, 5),
(18, 1, 5),
(19, 1, 5),
(20, 1, 5),
(21, 1, 5),
(22, 1, 5),
(23, 1, 5),
(24, 1, 5),
(25, 1, 5);

INSERT INTO ReceiveInfo (request_id, category, courier, address, contact_number) VALUES
(1, 'Within_Philippines', 'LBC', '123 Street, Manila, Philippines', '+639171234567'),
(2, 'Abroad', 'DHL', '456 Avenue, New York, USA', '+639181234567'),
(3, 'For_Pickup', 'N/A', 'N/A', '+639191234567'),
(4, 'Within_Philippines', 'J&T Express', '789 Boulevard, Cebu, Philippines', '+639201234567'),
(5, 'Abroad', 'FedEx', '987 Road, Tokyo, Japan', '+639211234567'),
(6, 'For_Pickup', 'N/A', 'N/A', '+639221234567'),
(7, 'Within_Philippines', 'LBC', '456 Street, Manila, Philippines', '+639231234567'),
(8, 'Abroad', 'DHL', '789 Avenue, London, UK', '+639241234567'),
(9, 'For_Pickup', 'N/A', 'N/A', '+639251234567'),
(10, 'Within_Philippines', 'J&T Express', '123 Road, Davao, Philippines', '+639261234567'),
(11, 'Abroad', 'FedEx', '654 Street, Sydney, Australia', '+639271234567'),
(12, 'For_Pickup', 'N/A', 'N/A', '+639281234567'),
(13, 'Within_Philippines', 'LBC', '789 Street, Manila, Philippines', '+639291234567'),
(14, 'Abroad', 'DHL', '321 Avenue, Berlin, Germany', '+639301234567'),
(15, 'For_Pickup', 'N/A', 'N/A', '+639311234567'),
(16, 'Within_Philippines', 'LBC', '654 Street, Cebu, Philippines', '+639321234567'),
(17, 'Abroad', 'FedEx', '159 Avenue, Paris, France', '+639331234567'),
(18, 'For_Pickup', 'N/A', 'N/A', '+639341234567'),
(19, 'Within_Philippines', 'J&T Express', '852 Boulevard, Baguio, Philippines', '+639351234567'),
(20, 'Abroad', 'DHL', '753 Street, Madrid, Spain', '+639361234567'),
(21, 'For_Pickup', 'N/A', 'N/A', '+639371234567'),
(22, 'Within_Philippines', 'LBC', '369 Avenue, Iloilo, Philippines', '+639381234567'),
(23, 'Abroad', 'FedEx', '147 Avenue, Rome, Italy', '+639391234567'),
(24, 'For_Pickup', 'N/A', 'N/A', '+639401234567'),
(25, 'Within_Philippines', 'J&T Express', '258 Boulevard, Davao, Philippines', '+639411234567');

INSERT INTO Payment (request_id, amount, proof_of_payment) VALUES
(1, 250.00, 'https://res.cloudinary.com/dqaycvt6i/image/upload/v1730536577/57h86wq08zub1_hayfwt.jpg'),
(2, 300.00, 'https://res.cloudinary.com/dqaycvt6i/image/upload/v1730536577/57h86wq08zub1_hayfwt.jpg'),
(3, 450.00, 'https://res.cloudinary.com/dqaycvt6i/image/upload/v1730536577/57h86wq08zub1_hayfwt.jpg'),
(4, 500.00, 'https://res.cloudinary.com/dqaycvt6i/image/upload/v1730536577/57h86wq08zub1_hayfwt.jpg'),
(5, 300.00, 'https://res.cloudinary.com/dqaycvt6i/image/upload/v1730536577/57h86wq08zub1_hayfwt.jpg'),
(6, 400.00, 'https://res.cloudinary.com/dqaycvt6i/image/upload/v1730536577/57h86wq08zub1_hayfwt.jpg'),
(7, 275.00, 'https://res.cloudinary.com/dqaycvt6i/image/upload/v1730536577/57h86wq08zub1_hayfwt.jpg'),
(8, 350.00, 'https://res.cloudinary.com/dqaycvt6i/image/upload/v1730536577/57h86wq08zub1_hayfwt.jpg'),
(9, 420.00, 'https://res.cloudinary.com/dqaycvt6i/image/upload/v1730536577/57h86wq08zub1_hayfwt.jpg'),
(10, 390.00, 'https://res.cloudinary.com/dqaycvt6i/image/upload/v1730536577/57h86wq08zub1_hayfwt.jpg'),
(11, 330.00, 'https://res.cloudinary.com/dqaycvt6i/image/upload/v1730536577/57h86wq08zub1_hayfwt.jpg'),
(12, 360.00, 'https://res.cloudinary.com/dqaycvt6i/image/upload/v1730536577/57h86wq08zub1_hayfwt.jpg'),
(13, 250.00, 'https://res.cloudinary.com/dqaycvt6i/image/upload/v1730536577/57h86wq08zub1_hayfwt.jpg'),
(14, 375.00, 'https://res.cloudinary.com/dqaycvt6i/image/upload/v1730536577/57h86wq08zub1_hayfwt.jpg'),
(15, 400.00, 'https://res.cloudinary.com/dqaycvt6i/image/upload/v1730536577/57h86wq08zub1_hayfwt.jpg'),
(16, 420.00, 'https://res.cloudinary.com/dqaycvt6i/image/upload/v1730536577/57h86wq08zub1_hayfwt.jpg'),
(17, 310.00, 'https://res.cloudinary.com/dqaycvt6i/image/upload/v1730536577/57h86wq08zub1_hayfwt.jpg'),
(18, 450.00, 'https://res.cloudinary.com/dqaycvt6i/image/upload/v1730536577/57h86wq08zub1_hayfwt.jpg'),
(19, 390.00, 'https://res.cloudinary.com/dqaycvt6i/image/upload/v1730536577/57h86wq08zub1_hayfwt.jpg'),
(20, 550.00, 'https://res.cloudinary.com/dqaycvt6i/image/upload/v1730536577/57h86wq08zub1_hayfwt.jpg'),
(21, 275.00, 'https://res.cloudinary.com/dqaycvt6i/image/upload/v1730536577/57h86wq08zub1_hayfwt.jpg'),
(22, 500.00, 'https://res.cloudinary.com/dqaycvt6i/image/upload/v1730536577/57h86wq08zub1_hayfwt.jpg'),
(23, 325.00, 'https://res.cloudinary.com/dqaycvt6i/image/upload/v1730536577/57h86wq08zub1_hayfwt.jpg'),
(24, 460.00, 'https://res.cloudinary.com/dqaycvt6i/image/upload/v1730536577/57h86wq08zub1_hayfwt.jpg'),
(25, 370.00, 'https://res.cloudinary.com/dqaycvt6i/image/upload/v1730536577/57h86wq08zub1_hayfwt.jpg');
