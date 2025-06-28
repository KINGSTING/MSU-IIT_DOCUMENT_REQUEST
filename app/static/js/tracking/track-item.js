
// Assign action to back button - Track Item
$('.item-back').on('click', function () {
    window.location.href = '/tracking/form'
})

// Assign action to comment-submit button
$('.add_comment_button').on('click', function () {
    const comment = $('.comment_input').val();

    // Validate comment
    if (!comment.trim()) {
        $('.error_message').removeClass('hidden');
        $('.error_message').text("Comment can't be empty");
        return;
    } else {
        $('.error_message').addClass('hidden');

        const form = $('.form_container')[0];

        const formData = new FormData(form);

        $.ajax({
            url: "/tracking/request",
            method: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                $('.comment_input').val("")
                const email = $('.email_address').text().trim()
                $('.comment_container').append(
                    `
                    <div class="comment_item user">
                        <div class="comment_header">
                            <span><strong>${email}</strong></span>
                            <span>${response.date}</span>
                        </div>
                        ${response.body}
                    </div>
                    `
                )
            },
            error: function (error) {
                alert("Error adding a comment");
                console.error("Error submitting the form", error);
            }
        });
    }
});

