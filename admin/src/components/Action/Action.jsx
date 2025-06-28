import React, { useEffect, useRef, useState } from 'react'
import style from './Action.module.css'
import { actionActionConfig } from '../../static/utils/helper-configs'
import axios from 'axios'

function Action({ adminList, selectedRequestId, setSelectedRequestId, requestList, setRequestList, setShowOverlay, overlayInfo, setFlashInfo }) {
    const [isActive, setIsActive] = useState(false)
    const { status, clarify, prices } = overlayInfo
    const actionConfig = actionActionConfig[status]

    const [error, setError] = useState('')
    const confirmMessageRef = useRef(null);
    const filterRef = useRef(null);
    const shippingNumber = useRef(null);

    useEffect(() => {
        setIsActive(true)
    }, [])

    const handleBack = () => {
        setIsActive(false)
        const timeout = setTimeout(() => setShowOverlay(null), 300)
        return () => clearTimeout(timeout)
    }

    const sendNotification = (type) => {
        const message = type == 'Comment' ? "Added a comment" : "Updated the request"
        const student_id = requestList.find(request => request.request_id == selectedRequestId)?.student_id
        // Add notification
        axios.post(`${import.meta.env.VITE_API_HOST}/api/notification/add`,
            {
                "request_id": selectedRequestId,
                "new_request": "",
                "user_type": "admin",
                "notification_body": message,
                "admin_id": "",
                "student_id": student_id
            }
        ).then(() => {
            console.log('Successfully added notification')
        }).catch(error => {
            console.error('Error adding notification', err);
        })
        // Send email to User
        axios.post(`${import.meta.env.VITE_API_HOST}/api/email/send`,
            {
                subject: "IIT Registrar Request Status",
                body: "Your request has been updated",
                code: selectedRequestId
            }
        ).then((email_res) => {
            console.log('Email sent:', email_res.data)
        }
        ).catch((err) => {
            console.error('Error sending email:', err)
        })
    }

    const handleConfirm = () => {
        if (status == 'shipping') {
            setFlashInfo({
                "type": "loading",
                "message": "Updating shipping Prices..."
            })
            // Update shipping settings
            axios.post(`${import.meta.env.VITE_API_HOST}/api/shipping`, {
                "mindanao": prices.mindanao,
                "visayas": prices.visayas,
                "luzon": prices.luzon
            }, {
                params: {
                    admin_id: localStorage.getItem('admin_id')
                }
            }).then(() => {
                setFlashInfo({
                    "type": "success",
                    "message": "Sucessfully updated Prices"
                })
            }).catch(err => {
                setFlashInfo({
                    "type": "error",
                    "message": "Error updating Prices"
                })
                console.error('Error updating price list', err);
            });
            console.log('Update shipping prices')
            setIsActive(false)
            const timeout = setTimeout(() => setShowOverlay(null), 300)
            return () => clearTimeout(timeout)
        }

        if (status == 'Clarifying' && clarify && confirmMessageRef.current.value == '') {
            setError('Please enter a clarifying message')
            return
        }
        if (((status == 'Clarifying' && !clarify) || (actionConfig.statusText == 'Processing')) && filterRef.current.value == 'hidden') {
            setError('Please assign a person for this task')
            return
        }
        if (((status == 'Processing' && requestList.find(request => request.request_id == selectedRequestId)?.receive_type == 'Within_Philippines')) && shippingNumber.current.value.trim().length != 12) {
            if (shippingNumber.current.value == '') {
                setError('Please enter a shipping number for this request')
            }
            else {
                setError('Please enter a valid 12 digit number')
            }
            return
        }

        let admin_id

        // Put/Post requests: assuming request update is successful
        switch (actionConfig.statusText) {
            case 'Clarifying':
                if (clarify) {
                    axios.post(`${import.meta.env.VITE_API_HOST}/api/request/comment/add`, {
                        "request_id": selectedRequestId,
                        "user_type": "admin",
                        "comment_body": confirmMessageRef.current.value,
                        "admin_id": localStorage.getItem('admin_id'),
                        "student_id": "",
                    }, {
                        params: {
                            admin_id: localStorage.getItem('admin_id')
                        }
                    }).then(() => {
                        sendNotification('Comment')
                    }).catch(error => {
                        setError('Error: Failed to add comment')
                        console.error('Failed to add comment.', error)
                    })
                }
                break;
            case 'Processing':
                admin_id = filterRef.current.value
                axios.put(`${import.meta.env.VITE_API_HOST}/api/requests/assign/${selectedRequestId}`, {
                    "assigned_admin_id": admin_id
                }, {
                    params: {
                        admin_id: localStorage.getItem('admin_id')
                    }
                }).catch(error => {
                    console.error('Failed to assign request.', error)
                })
                break;
            case 'Ready':
                if (requestList.find(request => request.request_id == selectedRequestId)?.receive_type == 'Within_Philippines') {
                    const shipping_number = shippingNumber.current.value
                    axios.put(`${import.meta.env.VITE_API_HOST}/api/requests/shipping_number/${selectedRequestId}`, {
                        "shipping_number": shipping_number
                    }, {
                        params: {
                            admin_id: localStorage.getItem('admin_id')
                        }
                    }).catch(error => {
                        console.error('Failed to add shipping number.', error)
                    })
                }
                break;
        }

        // Make Put requests and render list immediately
        if (status != 'shipping') {
            setFlashInfo({
                "type": "loading",
                "message": "Updating status of Request..."
            })
        }
        let updatedRequestList
        if (status == 'Clarifying' && !clarify) {
            console.log(`Updating request to Proessing`)
            admin_id = filterRef.current.value
            axios.put(`${import.meta.env.VITE_API_HOST}/api/requests/assign/${selectedRequestId}`, {
                "assigned_admin_id": admin_id
            }, {
                params: {
                    admin_id: localStorage.getItem('admin_id')
                }
            }).catch(error => {
                console.error('Failed to assign request.', error)
            })
            axios.put(`${import.meta.env.VITE_API_HOST}/api/requests/update/${selectedRequestId}`, {
                "category": "Processing",
            }, {
                params: {
                    admin_id: localStorage.getItem('admin_id')
                }
            }).then(response => {
                sendNotification('Update')
                setSelectedRequestId(null)
                setFlashInfo({
                    "type": "success",
                    "message": "Sucessfully updated Request"
                })
                const name = adminList.find(admin => admin.admin_id == admin_id)?.last_name
                updatedRequestList = requestList.map(request =>
                    request.request_id === selectedRequestId
                        ? { ...request, assigned: name, status: "Processing" }
                        : request
                )
                setRequestList(updatedRequestList)
            }).catch(error => {
                setFlashInfo({
                    "type": "error",
                    "message": "Error updating Request"
                })
            })
        }
        else if (status != 'shipping') {
            console.log(`Updating request to ${actionConfig.statusText}`)
            axios.put(`${import.meta.env.VITE_API_HOST}/api/requests/update/${selectedRequestId}`, {
                "category": actionConfig.statusText,
            }, {
                params: {
                    admin_id: localStorage.getItem('admin_id')
                }
            }).then(response => {
                sendNotification('Update')
                setSelectedRequestId(null)
                setFlashInfo({
                    "type": "success",
                    "message": "Sucessfully updated Request"
                })
                if (actionConfig.statusText == 'Completed') {
                    updatedRequestList = requestList.filter(request => request.request_id !== selectedRequestId);
                }
                else if (actionConfig.statusText == 'Processing') {
                    const name = adminList.find(admin => admin.admin_id == admin_id)?.last_name
                    updatedRequestList = requestList.map(request =>
                        request.request_id === selectedRequestId
                            ? { ...request, assigned: name, status: actionConfig.statusText }
                            : request
                    )
                }
                else {
                    updatedRequestList = requestList.map(request =>
                        request.request_id === selectedRequestId
                            ? { ...request, status: actionConfig.statusText }
                            : request
                    )
                }
                setRequestList(updatedRequestList)
            }).catch(error => {
                setFlashInfo({
                    "type": "error",
                    "message": "Error updating Request"
                })
                console.error("Error updating Request", error)
            })
        }

        setShowOverlay(null)
    }

    return (
        <>
            <div className={`${style.action_container} ${isActive ? style.active : ''}`}>
                {status == 'Clarifying' && clarify && (
                    <div className={style.confirm_section}>
                        <span className={style.section_header}>Clarify Message</span>
                        <span className={style.confirm_message}>
                            <form>
                                <textarea name="confirm_message" id="confirm_message"
                                    placeholder='(Input clarification message)' rows={5} cols={40} ref={confirmMessageRef} />
                            </form>
                        </span>
                        <span className={style.error_message}>
                            {error}
                        </span>
                    </div>
                )}
                {((status == 'Clarifying' && !clarify) || (status == 'Pending')) && (
                    <div className={style.confirm_section}>
                        <span className={style.section_header}>Assign Task</span>
                        <span className={style.select_admin}>
                            <form>
                                <select name="filter" id="filter" defaultValue="hidden" ref={filterRef}>
                                    <option value="hidden" hidden>(Select Admin)</option>
                                    {adminList.map((admin, index) => (
                                        <option value={admin.admin_id} key={index}>{admin.last_name}</option>
                                    ))}
                                </select>
                            </form>
                        </span>
                        <span className={style.error_message}>
                            {error}
                        </span>
                    </div>
                )}
                {(status == 'Processing' && requestList.find(request => request.request_id == selectedRequestId)?.receive_type == 'Within_Philippines') && (
                    <div className={style.confirm_section}>
                        <span className={style.section_header}>Shipping Number</span>
                        <span className={style.confirm_message}>
                            <form>
                                <input type='number' name="shipping_number" className={style.shipping_number}
                                    placeholder='(Input shipping number)' ref={shippingNumber} />
                            </form>
                        </span>
                        <span className={style.error_message}>
                            {error}
                        </span>
                    </div>
                )}
                <div className={style.confirm_section}>
                    <span className={style.section_header}>Confirm Action</span>
                    {status == 'Clarifying' && !clarify && (
                        <span className={style.confirm_message}>
                            Are you sure you want to move this request for
                            <span className={style.processing}> Processing</span>
                            ?
                        </span>
                    )}
                    {((status != 'Clarifying' && !clarify) || (status == 'Clarifying' && clarify)) && (
                        <span className={style.confirm_message}>
                            {actionConfig.message}
                            <span className={style[actionConfig.className]}>{actionConfig.statusText}</span>
                            ?
                        </span>
                    )}
                    {status == 'shipping' && (
                        <span className={style.confirm_message}>
                            Are you sure you want to update shipping Prices?
                        </span>
                    )}
                </div>
                <div className={style.button_section}>
                    <button className={style.confirm_button} onClick={handleConfirm}>
                        Confirm
                    </button>
                    <button className={style.back_button} onClick={handleBack}>
                        Cancel
                    </button>
                </div>
            </div>
        </>
    )
}

export default Action
