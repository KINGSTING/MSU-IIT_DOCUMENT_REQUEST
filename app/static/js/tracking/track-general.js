// Assign action to submit button
$('.submit-form').on('click', function () {
    // Submit the form
    $('#track_form').submit()
})

// Assign action to back button - Track Form
$('.back-button').on('click', function () {
    window.location.reload() // Navigate to landing
})

// Assign action to back button - Invalid Info
$('.back-invalid').on('click', function () {
    window.history.back()
})

