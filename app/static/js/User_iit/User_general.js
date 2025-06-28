/** Original list of requests */
let originalList
/** Interval check for new notifications */
let checkNewNotifInterval
/** Student ID */
let student_id
/** Current Notif Count */
let notifCount

/** On document load */
$(document).ready(function () {
    $('.overlay-container').hide()

    originalList = $('.table_data')
    originalNotifCount = $('.notification_item').length
    student_id = $('.student_id').val()
    notifCount = Number($('.notif_count').text().trim())

    checkNewNotifInterval = setInterval(() => {
        $.ajax({
            url: `http://127.0.0.1:5001/api/notification/get/user/count/${student_id}`,
            method: "GET",
            success: function (response) {
                /** Reload window if there is new notification */
                response != originalNotifCount ? location.reload() : null
            },
            error: function (error) {
                console.error("Error:", error.responseJSON?.error || error.statusText)
            }
        })
    }, 5000)

    /** Show first 4 notifications */
    $('.notification_item').slice(4).hide()

    $(document).on('mousedown', (event) => {
        /** Collapse Account Panel when clicked outside */
        if (
            !$(event.target).closest('.account_container').length &&
            !$(event.target).closest('.account_button').length
        ) {
            $('.account_container').addClass('hidden')
        }
        /** Collapse Notif Panel when clicked outside - Reset notif state*/
        if (
            !$(event.target).closest('.notification_container').length &&
            !$(event.target).closest('.notif_button').length
        ) {
            $('.notification_container').addClass('hidden')
            $('.notification_item').slice(4).hide()
            $('.expand_notification').html('View all notifications')
        }
    })

    /** Search and Sort Initialization */
    const $searchInput = $('input[name="keyword"]')
    const $sortSelect = $('select[name="filter"]')

    // Attach search listener
    $searchInput.on('input', function () {
        const searchTerm = $(this).val().toLowerCase()
        filterTable(searchTerm, $sortSelect.val())
    })

    // Attach sort listener
    $sortSelect.on('change', function () {
        const sortBy = $(this).val()
        console.log(sortBy)
        filterTable($searchInput.val().toLowerCase(), sortBy)
    })

    // Clear search button
    $('button[onClick="handleClear()"]').on('click', function () {
        $searchInput.val('')
        filterTable('', $sortSelect.val())
    })
})

/** Clear Interval on close */
$(window).on('unload', () => {
    clearInterval(checkNewNotifInterval)
})

/** Toggle Account Panel */
const toggleAccount = () => {
    $('.account_container').toggleClass('hidden')
}

/** Toggle Notification Panel */
const toggleNotif = () => {
    $('.notification_container').toggleClass('hidden')
}

/** Toggle collapse notifications */
const toggleViewAll = () => {
    const notificationItems = $('.notification_item')
    // Expand the notif here
    if ($('.expand_notification').html() == 'Show fewer') {
        $('.notification_item').slice(4).hide()
        $('.expand_notification').html('View all notifications')
    } else {
        notificationItems.show()
        $('.expand_notification').html('Show fewer')
    }
}

/** Filter and Sort Table */
const filterTable = (searchTerm, sortBy) => {
    const $rows = $('.table_data')

    // Filter rows based on search term
    $rows.each(function () {
        const rowText = $(this).text().toLowerCase()
        const matchesSearch = rowText.includes(searchTerm)
        $(this).toggle(matchesSearch)
    })

    // Sort rows based on the selected column
    if (sortBy !== 'Default') {
        const columnIndex = parseInt(sortBy, 10) - 1
        const sortedRows = $rows.sort((a, b) => {
            const aText = $(a).children('span').eq(columnIndex).text().toLowerCase()
            const bText = $(b).children('span').eq(columnIndex).text().toLowerCase()

            // Handle numeric and alphabetic sorting
            if (!isNaN(aText) && !isNaN(bText)) {
                return parseFloat(aText) - parseFloat(bText)
            }
            return aText.localeCompare(bText)
        })

        // Append sorted rows back to the container
        $('.data_container').append(sortedRows)
    }
    else if (sortBy == 'Default') {
        $('.data_container').append(originalList)
    }
}

/** Set notification as 'read' */
const handleNotificationClick = (event, id, request_id) => {
    const notificationElement = event.currentTarget

    $.ajax({
        url: "http://127.0.0.1:5001/api/notification/set/read",
        method: "PUT",
        contentType: "application/json", // Send data as JSON
        data: JSON.stringify({ notification_id: id }),
        success: function (response) {
            if (notifCount == 1) {
                $('.notif_count').hide()
                $('.notif_count').text(String(notifCount - 1))
            }
            else {
                $('.notif_count').text(String(notifCount - 1))
            }

            console.log(response.msg)
            notificationElement.classList.remove('new')
            trackRequest(request_id)
        },
        error: function (error) {
            console.error("Error:", error.responseJSON?.error || error.statusText)
        }
    })
}

/** Redirect to tracking */
const trackRequest = (id) => {
    $.ajax({
        url: `http://127.0.0.1:5001/user/dashboard/track/${id}`,
        method: "GET",
        success: function (response) {
            if (response.redirect) {
                window.open(response.redirect)
            }
        },
        error: function (error) {
            console.error("Error:", error.responseJSON?.error || error.statusText)
        }
    })
}

// /** Submit new request */
// const submitNewRequest = () => {
//     window.location.href = '/request/documents'
// }

/** Sign out */
const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out?') == true) {
        $.ajax({
            url: `http://127.0.0.1:5001/user/dashboard/sign-out`,
            method: "GET",
            success: function (response) {
                if (response.redirect) {
                    window.location.href = response.redirect
                }
            },
            error: function (error) {
                console.error("Error:", error.responseJSON?.error || error.statusText)
            }
        })
    }
}

const closeOverlay = () => {
    $('.overlay-container').fadeOut()
}

const submitNewRequest = () => {
    $('.overlay-container').fadeIn()
}
