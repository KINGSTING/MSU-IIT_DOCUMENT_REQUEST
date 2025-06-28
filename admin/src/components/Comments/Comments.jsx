import React, { useState } from 'react'
import style from './Comments.module.css'
import axios from 'axios'

function Comments({ selectedRequestId, comments, setComments, request }) {
    const [newComment, setNewComment] = useState('')
    const [error, setError] = useState('')
    const isCompletedSelected = location.pathname.includes('completed')

    const handleAddComment = () => {
        if (newComment.trim().length == 0) {
            setError('Comment cannot be empty')
            return
        }

        // Optimistic Rendering
        const currentDate = new Date()
        const formattedDate = currentDate.toLocaleString('en-US', {
            month: 'long',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
        const new_comment = {
            "admin_name": localStorage.getItem('admin_name'),
            "comment_body": newComment,
            "comment_date": formattedDate,
            "comment_id": null,
            "user_name": null,
            "user_type": "admin"
        }

        axios.post(`${import.meta.env.VITE_API_HOST}/api/request/comment/add`, {
            "request_id": selectedRequestId,
            "user_type": "admin",
            "comment_body": newComment,
            "admin_id": localStorage.getItem('admin_id'),
            "student_id": "",
        }, {
            params: {
                admin_id: localStorage.getItem('admin_id')
            }
        }).then(response => {
            setError('')
            setNewComment('')
            if (!Array.isArray(comments)) {
                setComments([new_comment])
            }
            else {
                setComments(c => [...c, new_comment])
            }
            axios.post(`${import.meta.env.VITE_API_HOST}/api/notification/add`,
                {
                    "request_id": selectedRequestId,
                    "new_request": "",
                    "user_type": "admin",
                    "notification_body": "Added a comment",
                    "admin_id": "",
                    "student_id": request.student_id
                }
            ).then(() => {
                console.log('Successfully added notification')
                // Send email to User
                axios.post(`${import.meta.env.VITE_API_HOST}/api/email/send`,
                    {
                        subject: "IIT Registrar Request Status",
                        body: "Your request has a new comment",
                        code: selectedRequestId
                    }
                ).then((email_res) => {
                    console.log('Email sent:', email_res.data)
                }
                ).catch((err) => {
                    console.error('Error sending email:', err)
                })
            }).catch(error => {
                console.error('Error adding notification', err);
            })
            console.log(`Sucessfully added comment:`, response.data)
        }).catch(error => {
            setError('Error: Failed to add comment')
            console.error('Failed to add comment.', error)
        })
    }

    return (
        <>
            {!isCompletedSelected && (
                <div className={style.section}>
                    {request.status != 'Completed' && (
                        <div className={style.form_container}>
                            <textarea rows={4} placeholder='Type comment here...' value={newComment} onChange={(e) => setNewComment(e.target.value)}></textarea>
                            <br />
                            <span className={style.error_message}>{error}</span>
                            <button onClick={handleAddComment}>Add Comment</button>
                        </div>
                    )}
                </div>
            )}
            <div className={style.section}>
                <div className={style.section_header}>
                    <span>All Comments ({!Array.isArray(comments) ? 0 : comments.length})</span>
                </div>
                <div className={style.comment_container}>
                    {Array.isArray(comments) ?
                        comments.map((comment, index) => (
                            <div className={`${style.comment_item} ${style[comment.user_type]}`} key={index}>
                                <div className={style.comment_header}>
                                    {comment.user_type == 'admin' && (
                                        <span><strong>{comment.admin_name}</strong></span>
                                    )}
                                    {comment.user_type == 'user' && (
                                        <span><strong>{comment.user_name}</strong></span>
                                    )}

                                    <span>{comment.comment_date}</span>
                                </div>
                                {comment.comment_body}
                            </div>
                        )) : null}
                    {!Array.isArray(comments) && (
                        <div className={style.empty_status}>Comments Empty</div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Comments
