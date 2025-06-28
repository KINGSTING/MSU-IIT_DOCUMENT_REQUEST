document.addEventListener("DOMContentLoaded", function () {
    const documentSelect = document.getElementById("documentSelect");
    const addRequestButton = document.getElementById("addRequestBtn");
    const documentTableBody = document.getElementById("documentTableBody");
    const purposeRequestInput = document.getElementById("purpose-request");
    const submitButton = document.querySelector(".submit-button");

    let realURL = ""; // To store the uploaded file URL

    // Function to add selected document to the table
    function addDocumentToTable() {
        const selectedDocument = documentSelect.value;

        if (!selectedDocument) {
            alert("Please select a valid document type.");
            return;
        }

        let documentCategory = "";
        let documentType = "";
        let price = "Php 0.00";
        let pages = 1;

        switch (selectedDocument) {
            case "Evaluation":
                documentCategory = selectedDocument;
                documentType = "Special";
                price = "Php 50.00";
                break;
            case "Diploma":
                documentCategory = selectedDocument;
                documentType = "Special";
                price = "Php 150.00";
                break;
            case "COR Reprinting":
                documentCategory = selectedDocument;
                documentType = "Special";
                price = "Php 20.00";
                break;
            case "Report of Grades":
                documentCategory = selectedDocument;
                documentType = "Special";
                price = "Php 20.00";
                break;
            case "Reprinting of Diploma":
                documentCategory = selectedDocument;
                documentType = "Special";
                price = "Php 150.00";
                break;
            case "Transcripts of Records":
                documentCategory = selectedDocument;
                documentType = "Special";
                price = "Php 50.00";
                break;
            case "Transfer Credentials":
                documentCategory = selectedDocument;
                documentType = "Special";
                price = "Php 150.00";
                break;
            case "CAV (Foreign Employment)":
                documentCategory = selectedDocument;
                documentType = "Special";
                price = "Php 350.00";
                break;
            case "Auth Certificate":
            case "Auth Transcript":
            case "Auth Diploma":
                documentCategory = selectedDocument;
                documentType = "Authentication";
                price = "Php 10.00";
                break;
            default:
                documentCategory = selectedDocument;
                documentType = "Certification";
                price = "Php 50.00";
                break;
        }

        const existingDocuments = Array.from(documentTableBody.querySelectorAll("tr"));
        const isDuplicate = existingDocuments.some(row => {
            const rowDocumentCategory = row.querySelector("td")?.textContent.trim();
            return rowDocumentCategory === selectedDocument;
        });

        if (isDuplicate) {
            alert("This document type has already been added.");
            return;
        }

        const mainRow = document.createElement("tr");
        mainRow.innerHTML = `
            <td>${documentCategory}</td>
            <td>${documentType}</td>
            <td>${price}</td>
            ${documentType === 'Authentication'
                ? `<td><input type="number" min="1" value="${pages}" /></td>`
                : `<td><input type="number" min="1" value="${pages}" disabled/></td>`}
            <td><button class="remove-row"><i class="fa fa-trash" aria-hidden="true"></i></button></td>
        `;
        documentTableBody.appendChild(mainRow);

        // Add sub-row for certain document categories
        if (documentCategory === "Report of Grades" || documentCategory === "COR Reprinting") {
            const subRow = document.createElement("tr");
            subRow.classList.add("sub-row");
            subRow.innerHTML = `
                <td colspan="5">
                    <div class="input-container">
                        <label for="semesterSelect">Semester: </label>
                        <select class="semesterSelect">
                            <option value="1st Sem">1st Semester</option>
                            <option value="2nd Sem">2nd Semester</option>
                        </select>
                        <label for="academicYearInput">Academic Year: </label>
                        <input type="text" class="academicYearInput" style="width: 80px" placeholder="20XX-20XX" />
                    </div>
                </td>
            `;
            documentTableBody.appendChild(subRow);
        }

        if (documentType === "Authentication") {
            const subRow = document.createElement("tr");
            subRow.classList.add("sub-row");
            subRow.innerHTML = `
                <td colspan="5">
                    <label>Upload PDF Only: </label>
                    <input type="file" class="pdf-upload" style="width:90px;" accept="application/pdf"/>
                </td>
            `;
            documentTableBody.appendChild(subRow);
        }
    }

    // Function to upload file
    async function uploadFile(file) {
        const apiKey = "72a7233f831a58dd70837e92256f5b1f"; // Replace with your API key
        const apiUrl = `https://api.imgbb.com/1/upload?key=${apiKey}`;

        try {
            const formData = new FormData();
            formData.append("image", file); // Append the file directly without base64 conversion
            formData.append("name", file.name);

            const response = await fetch(apiUrl, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Failed to upload the file: ${response.statusText}`);
            }

            const result = await response.json();

            // Ensure the returned data contains the URL
            if (result && result.data && result.data.url) {
                console.log("Uploaded File URL:", result.data.url);
                return result.data.url;
            } else {
                throw new Error("Invalid response structure from imgbb API.");
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("An error occurred during file upload. Please try again.");
            return null;
        }
    }

    async function handleFileInput(event) {
        const fileInput = event.target;
        const file = fileInput.files[0];

        if (!file) {
            alert("No file selected.");
            return;
        }

        if (file.type !== "application/pdf") {
            alert("Please upload a valid PDF file.");
            return;
        }

        const uploadedFileUrl = await uploadFile(file);

        if (uploadedFileUrl) {
            console.log("File uploaded successfully!");

            // Create the file link
            const fileLink = document.createElement("a");
            fileLink.href = uploadedFileUrl;
            fileLink.textContent = "Success! View Uploaded PDF";
            fileLink.target = "_blank";

            // Replace the file input with the link
            fileInput.style.display = "none"; // Hide the file input
            fileInput.parentElement.appendChild(fileLink); // Add the link

            // Save the file URL to the row data for later use when submitting
            const row = fileInput.closest('tr');
            if (row) {
                realURL = uploadedFileUrl; // Update realURL with the uploaded file URL
            }
        }
    }

    // Event listener for file input change
    documentTableBody.addEventListener("change", function (event) {
        if (event.target.classList.contains("pdf-upload")) {
            handleFileInput(event);
        }
    });

    // Add document to the table
    if (addRequestButton) {
        addRequestButton.addEventListener("click", addDocumentToTable);
    }

    // Remove document from the table
    documentTableBody.addEventListener("click", function (event) {
        const button = event.target.closest('button.remove-row');
        if (button) {
            const row = button.closest('tr');
            if (row) {
                const nextRow = row.nextElementSibling;
                // Check if the next row is a sub-row and remove it as well
                if (nextRow && nextRow.classList.contains("sub-row")) {
                    nextRow.remove(); // Remove the sub-row (file upload)
                }
                row.remove(); // Remove the main row
            }
        }
    });

    // When submitting the form
    submitButton.addEventListener("click", function () {
        const studentCategory = document.querySelector('input[name="studentType"]:checked')?.value;

        if (!studentCategory) {
            alert("Please select your student category.");
            return;
        }

        const rows = Array.from(documentTableBody.querySelectorAll("tr:not(.sub-row)"));
        const requestData = [];

        for (const row of rows) {
            const cells = row.querySelectorAll("td");

            const documentCategory = cells[0]?.textContent.trim();
            const documentType = cells[1]?.textContent.trim();
            const price = cells[2]?.textContent.trim();
            const pages = parseInt(cells[3]?.querySelector("input")?.value) || 1;
            const file_upload = realURL; // Get the file URL if it exists

            // Get semester and academic year from the sub-row (if present)
            const subRow = row.nextElementSibling; // Get the next row (sub-row)
            let semester = "", academicYear = "";
            if (subRow && subRow.classList.contains("sub-row")) {
                semester = subRow.querySelector('.semesterSelect')?.value;
                academicYear = subRow.querySelector('.academicYearInput')?.value;
            }

            const sem_year = `${semester || "N/A"}, ${academicYear || "N/A"}`;

            if (documentType == 'Authentication' && file_upload == "") {
                alert("Please upload file to be authenticated")
                return
            }
            if (documentCategory == 'COR Reprinting' && academicYear == "") {
                alert("Please enter academic year for COR Reprinting.")
                return
            }
            if (documentCategory == 'Report of Grades' && academicYear == "") {
                alert("Please enter academic year for Report of Grades.")
                return
            }

            console.log("Document Data:", { documentCategory, documentType, price, pages, file_upload, sem_year });

            requestData.push({
                documentCategory,
                documentType,
                price,
                pages,
                file_upload,
                sem_year,
            });
        }

        if (requestData.length === 0) {
            alert("Please add at least one document.");
            return;
        }

        const purpose = purposeRequestInput.value.trim();
        if (!purpose) {
            alert("Please enter the purpose of the request.");
            return;
        }

        const payload = {
            purpose,
            studentCategory,
            documents: requestData,
        };

        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";

        fetch("http://127.0.0.1:5001/request/submit_request", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to submit request.");
                }
                return response.json();
            })
            .then((data) => {
                window.location.href = `/request/ship`;
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("An error occurred while submitting the request.");
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = "Submit";
            });
    });
});
