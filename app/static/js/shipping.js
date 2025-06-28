const data = {
  NCR: {
    provinces: {
      "Metro Manila": ["Manila", "Makati", "Quezon City"],
    },
    municipalities: {
      Manila: ["Barangay1", "Barangay2"],
      Makati: ["Barangay3", "Barangay4"],
      "Quezon City": ["Barangay5", "Barangay6"],
    },
  },
  CAR: {
    provinces: {
      Benguet: ["Baguio", "La Trinidad"],
      Ifugao: ["Banaue", "Kiangan"],
    },
    municipalities: {
      Baguio: ["Camp7", "Loakan"],
      "La Trinidad": ["Balili", "Puguis"],
      Banaue: ["Batad", "Bangaan"],
      Kiangan: ["Hapao", "Nagacadan"],
    },
  },
  Region1: {
    provinces: {
      Pangasinan: ["Dagupan", "Alaminos"],
      LaUnion: ["San Fernando", "Bauang"],
    },
    municipalities: {
      Dagupan: ["Bonuan", "Malued"],
      Alaminos: ["Lucap", "Poblacion"],
      "San Fernando": ["Barangay1", "Barangay2"],
      Bauang: ["Barangay3", "Barangay4"],
    },
  },
  Region2: {
    provinces: {
      Cagayan: ["Tuguegarao", "Aparri"],
      Isabela: ["Ilagan", "Santiago"],
    },
    municipalities: {
      Tuguegarao: ["BarangayA", "BarangayB"],
      Aparri: ["BarangayC", "BarangayD"],
      Ilagan: ["BarangayE", "BarangayF"],
      Santiago: ["BarangayG", "BarangayH"],
    },
  },
};

function updateProvinces() {
  const region = document.getElementById("region")?.value;
  const provinceDropdown = document.getElementById("province");
  const municipalityDropdown = document.getElementById("municipality");
  const barangayDropdown = document.getElementById("barangay");

  if (provinceDropdown && municipalityDropdown && barangayDropdown) {
    provinceDropdown.innerHTML = `<option value="" disabled selected>Select Province</option>`;
    municipalityDropdown.innerHTML = `<option value="" disabled selected>Select Municipality</option>`;
    barangayDropdown.innerHTML = `<option value="" disabled selected>Select Barangay</option>`;

    if (region && data[region]) {
      const provinces = Object.keys(data[region].provinces);
      provinces.forEach(province => {
        const option = document.createElement("option");
        option.value = province;
        option.textContent = province;
        provinceDropdown.appendChild(option);
      });
    }
  }
}

function updateMunicipalities() {
  const region = document.getElementById("region")?.value;
  const province = document.getElementById("province")?.value;
  const municipalityDropdown = document.getElementById("municipality");
  const barangayDropdown = document.getElementById("barangay");

  if (municipalityDropdown && barangayDropdown) {
    municipalityDropdown.innerHTML = `<option value="" disabled selected>Select Municipality</option>`;
    barangayDropdown.innerHTML = `<option value="" disabled selected>Select Barangay</option>`;

    if (region && province && data[region]?.provinces[province]) {
      const municipalities = data[region].provinces[province];
      municipalities.forEach(municipality => {
        const option = document.createElement("option");
        option.value = municipality;
        option.textContent = municipality;
        municipalityDropdown.appendChild(option);
      });
    }
  }
}

function updateBarangays() {
  const region = document.getElementById("region")?.value;
  const municipality = document.getElementById("municipality")?.value;
  const barangayDropdown = document.getElementById("barangay");

  if (barangayDropdown) {
    barangayDropdown.innerHTML = `<option value="" disabled selected>Select Barangay</option>`;

    if (region && municipality && data[region]?.municipalities[municipality]) {
      const barangays = data[region].municipalities[municipality];
      barangays.forEach(barangay => {
        const option = document.createElement("option");
        option.value = barangay;
        option.textContent = barangay;
        barangayDropdown.appendChild(option);
      });
    }
  }
}

function handleMailChange() {
  const mailChoice = document.querySelector('input[name="mail"]:checked')?.value;
  const withinPhilippinesForm = document.querySelector(".within-Philippines");
  const abroadForm = document.querySelector(".abroad");
  const pickupForm = document.querySelector(".for-pickup");

  if (withinPhilippinesForm && abroadForm && pickupForm) {
    withinPhilippinesForm.style.display = "none";
    abroadForm.style.display = "none";
    pickupForm.style.display = "none";

    if (mailChoice === "philippines") {
      withinPhilippinesForm.style.display = "block";
    } else if (mailChoice === "abroad") {
      abroadForm.style.display = "block";
    } else if (mailChoice === "pickup") {
      pickupForm.style.display = "block";
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  handleMailChange();

  document.querySelectorAll('input[name="mail"]').forEach(radio => {
    radio.addEventListener("change", handleMailChange);
  });

  const categoryElement = document.getElementById("category");
  if (categoryElement) {
    categoryElement.addEventListener("change", toggleCourierField);
  }

  const regionElement = document.getElementById("region");
  if (regionElement) {
    regionElement.addEventListener("change", updateProvinces);
  }

  const provinceElement = document.getElementById("province");
  if (provinceElement) {
    provinceElement.addEventListener("change", updateMunicipalities);
  }

  const municipalityElement = document.getElementById("municipality");
  if (municipalityElement) {
    municipalityElement.addEventListener("change", updateBarangays);
  }
});

// Collect form data dynamically based on form type
function collectFormData(formType) {

  // Helper function to get the selected radio button value
  function getSelectedRadioValue(name) {
    const selectedRadio = document.querySelector(`input[name="${name}"]:checked`);
    return selectedRadio ? selectedRadio.value : ""; // Return the selected radio value or empty string
  }
  // Helper function to get the selected value from input elements
  function getSelectedValue(id) {
    const element = document.getElementById(id);
    return element?.value.trim() || "";
  }

  let data = {};

  if (formType === "philippines") {
    data = {
      category: getSelectedRadioValue("mail"),
      courier: getSelectedValue("courier"),
      area: getSelectedValue("area"),
      region: getSelectedValue("region"),
      province: getSelectedValue("province"),
      municipality: getSelectedValue("municipality"),
      barangay: getSelectedValue("barangay"),
      contactNumber: getSelectedValue("contact"),
      address: getSelectedValue("address1"),
    };
  } else if (formType === "abroad") {
    data = {
      category: getSelectedRadioValue("mail"),
      courier: getSelectedValue("courierAbroad"),
      country: getSelectedValue("country"),
      state: getSelectedValue("STR"),
      city: getSelectedValue("CM"),
      contactNumber: getSelectedValue("contactabroad"),
      address: [
        getSelectedValue("SA"),
        getSelectedValue("CM"),
        getSelectedValue("STR"),
        getSelectedValue("country"),
      ]
        .filter((part) => part.trim() !== "")
        .join(", "),
    };
  } else if (formType === "pickup") {
    data = {
      category: getSelectedRadioValue("mail"),
      contactNumber: getSelectedValue("contact-for-pickup"),
    };
  }

  return data;
}

document.addEventListener("DOMContentLoaded", function () {
  const submitButton = document.querySelector(".submit-button");

  // Event listener for the submit button
  if (submitButton) {
    submitButton.addEventListener("click", async function (event) {
      const formType = document.querySelector('input[name="mail"]:checked')?.value;

      if (!formType) {
        alert("Please select a form type.");
        return;
      }

      // Debugging prints for form data
      console.log("Form type:", formType);
      const formData = collectFormData(formType);
      console.log("Form data:", formData);

      // Flash effect on the continue button
      const continueButton = event.target.querySelector('button[type="submit"]');
      if (continueButton) {
        continueButton.classList.add("flash");
        setTimeout(() => {
          continueButton.classList.remove("flash");
        }, 300);
      }

      const contact = formData.contactNumber

      if (formType == "philippines") {
        if (formData.area == "") {
          alert("Please select an area.")
          return
        }

        else if (formData.address == "") {
          alert("Please type an address.")
          return
        }

        else if (formData.contactNumber == "") {
          alert("Please input a contact number.")
          return
        }
        else if (!Number(formData.contactNumber)) {
          alert("Please input a valid contact number.")
          return
        }
        else if (contact.length < 11) {
          alert("Please input an 11 digit contact number.")
          return
        }
      }
      else if (formType == "pickup") {
        if (formData.contactNumber == "") {
          alert("Please input a contact number.")
          return
        }
        else if (!Number(formData.contactNumber)) {
          alert("Please input a valid contact number.")
          return
        }
        else if (contact.length < 11) {
          alert("Please input an 11 digit contact number.")
          return
        }
      }

      try {
        const response = await fetch("http://127.0.0.1:5001/request/submit-shipping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const responseData = await response.json();
          console.log("Form submitted successfully:", responseData);
          window.location.href = "/request/summary";
        } else {
          const error = await response.json();
          alert("Failed to submit form: " + (error.message || "Unknown error."));
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        alert("An error occurred while submitting the form. Please try again later.");
      }
    });
  }
});
