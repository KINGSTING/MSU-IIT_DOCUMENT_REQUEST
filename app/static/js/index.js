document.addEventListener("DOMContentLoaded", function () {
    let currentStep = 0;
    const steps = document.querySelectorAll('.step-progress li');
    const documentSelect = document.getElementById("documentSelect");
    const addRequestButton = document.querySelector(".btn-primary");
    const documentTableBody = document.querySelector("#documentTableBody");
    const additionalFieldsContainer = document.getElementById("additionalFieldsContainer");

    // Function to update step progress
    function updateSteps() {
        steps.forEach((step, index) => {
            if (index <= currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    // Function to handle "Next" step button click
    function nextStep() {
        // Prevent any default form submission if inside a form
        event.preventDefault();

        // Collect form data (assuming the form includes the necessary fields)
        const selectedDocument = document.querySelector('#documentSelect').value;
        const studentType = document.querySelector('input[name="studentType"]:checked').value;
        const semester = document.querySelector('#semesterSelect').value;
        const academicYear = document.querySelector('#academicYearInput').value;
        const pages = document.querySelector('#pagesInput').value;

        // Prepare the data to send to Flask
        const formData = {
            document: selectedDocument,
            studentType: studentType,
            semester: semester,
            academicYear: academicYear,
            pages: pages
        };

        // Send the data to Flask via a POST request
        fetch('/submit-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                // Handle the response from Flask (for example, show a success message)
                console.log(data);
                if (data.message) {
                    alert('Request submitted successfully');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            });
    }


    // Function to handle "Previous" step button click
    function previousStep() {
        if (currentStep > 0) {
            currentStep--;
            updateSteps();
        }
    }

    // Add the selected document to the table
    function addDocumentToTable() {
        const selectedDocument = documentSelect.value;

        if (selectedDocument !== "-- Select Request --") {
            // Set default values for price and pages
            let price = "Php 0.00"; // You may want to adjust this based on the document type
            let pages = 1;

            switch (selectedDocument) {
                case "corReprinting":
                    price = "Php 150.00";
                    break;
                case "transcriptOfRecords":
                    price = "Php 200.00";
                    break;
                case "reportOfGrades":
                    price = "Php 100.00";
                    break;
                case "certification":
                    price = "Php 50.00";
                    break;
                case "transfer_Credentials":
                    price = "Php 250.00";
                    break;
                case "reprintingOfMisspelled/DamagedDiploma":
                    price = "Php 150.00";
                    break;
                case "authentication":
                    price = "Php 300.00";
                    break;
                default:
                    price = "Php 0.00";
                    break;
            }

            // Create a new row for the table
            const newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td>${selectedDocument.replace(/([A-Z])/g, ' $1').toUpperCase()}</td>
                <td>${selectedDocument.replace(/([A-Z])/g, ' $1').toUpperCase()}</td>
                <td>${price}</td>
                <td><input type="number" value="${pages}" class="form-control text-center"></td>
            `;
            documentTableBody.appendChild(newRow);

            // If "COR Reprinting" or "Report of Grades" is selected, show the Semester and Academic Year fields under the table
            // if (selectedDocument === "corReprinting" || selectedDocument === "reportOfGrades") {
            //     // Create a div to hold the label and fields
            //     const fieldsDiv = document.createElement("div");
            //     fieldsDiv.classList.add("mb-4");

            //     // Add a label for the additional data
            //     const documentLabel = `${selectedDocument.replace(/([A-Z])/g, ' $1').toUpperCase()}:`;

            //     // Create the Semester select input with options "1st" and "2nd"
            //     const semesterSelect = document.createElement("select");
            //     semesterSelect.classList.add("form-control", "d-inline", "w-auto");
            //     semesterSelect.innerHTML = `
            //         <option value="1st">1st Semester</option>
            //         <option value="2nd">2nd Semester</option>
            //     `;

            //     // Create the Academic Year input
            //     const academicYearInput = document.createElement("input");
            //     academicYearInput.type = "text";
            //     academicYearInput.placeholder = "e.g., 2023-2024";
            //     academicYearInput.classList.add("form-control", "d-inline", "w-auto");

            //     // Add the label, semester select, and academic year input to the div
            //     fieldsDiv.innerHTML = `
            //         <label class="form-label">${documentLabel} Semester: ${semesterSelect.outerHTML} Academic Year: ${academicYearInput.outerHTML}</label>
            //     `;

            //     // Append the fields div under the table
            //     additionalFieldsContainer.appendChild(fieldsDiv);
            // }
        } else {
            alert("Please select a document type.");
        }
    }

    // Attach the add document function to the button click event
    addRequestButton.addEventListener("click", addDocumentToTable);

    // Initialize steps on load
    updateSteps();
});
