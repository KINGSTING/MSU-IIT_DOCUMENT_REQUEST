
function cancel_session() {
    let text = "Are you sure you want to cancel the session? Doing so will erase all progress."

    if (confirm(text)) {
        fetch('/auth/cancel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "action": "cancel" })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Session Cancelled successfully!')
                    window.location.href = '/user/dashboard'
                } else {
                    alert('Failed to cancel the session.')
                }
            })
            .catch(error => {
                console.error('Error:', error)
                alert('An error occurred. Please try again.')
            })
    } else {
        console.log("You canceled!")
    }
}
