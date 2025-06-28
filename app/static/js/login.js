

function selectOption(button) {

    button.classList.add('selected');
    if (button.value == 'no') {
        fetch('login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                "choice": button.value
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.redirect) {
                window.location.href = data.redirect
            }
        })
        .catch(err => {
            console.log("Error", err)
        })
    } else {
        fetch('myiit-signin', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({"choice": button.value})
        })
        .then(response => response.json())
        .then(data => {
            if (data.redirect) {
                console.log(data.redirect)
                window.location.href = data.redirect
            }
        })
        .catch(err => {
            console.log("Error", err)
        })
    } 
}
