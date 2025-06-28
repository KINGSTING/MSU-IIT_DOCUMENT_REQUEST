import React, { useEffect, useState } from 'react'
import style from './Notifications.module.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Notifications({ toggleNotif, isNotifVisible, viewAllNotif, toggleViewAll, notifications, setNotifications, getNotifications, setSelectedRequestId, selectedRequestId, unreadCount, setUnreadCount }) {
    const [notifCount, setNotifCount] = useState(0)
    const displayedNotifications = viewAllNotif && notifications ? notifications : notifications.slice(0, 4)
    const navigator = useNavigate()

    useEffect(() => {
        function getNotifCount() {
            axios.get(`${import.meta.env.VITE_API_HOST}/api/notification/get/admin/count`, {
                params: { admin_id: localStorage.getItem('admin_id') }
            }).then(response => {
                setNotifCount(response.data - sessionStorage.getItem("currentNotifCount"))
            })
        }
        getNotifCount()
        const checkInterval = setInterval(getNotifCount, 5000)
        return () => clearInterval(checkInterval)
    }, [])

    async function handlePendingNotif() {
        await getNotifications().then(() => {
            toggleNotif()
            setNotifCount(0)
        })
    }

    function handleNotificationClick(notification) {
        toggleNotif()
        setRead(notification.notification_id)
        if (notification.notification_body == 'Submitted a request') {
            setTimeout(() => location.href = "/dashboard/ongoing", 500)
        }
        else if (notification.notification_body == 'Added a comment') {
            toggleViewAll()
            if (selectedRequestId == notification.request_id) {
                setTimeout(() => location.href = "/dashboard/ongoing", 500)
                return
            }
            setSelectedRequestId(notification.request_id)
            if (location.pathname.includes('completed') || location.pathname.includes('ship-settings')) {
                navigator(`/dashboard/ongoing`)
            }
        }
    }

    function setRead(id) {
        axios.put(`${import.meta.env.VITE_API_HOST}/api/notification/set/read`, {
            "notification_id": id
        }, {
            params: {
                admin_id: localStorage.getItem('admin_id')
            }
        }).then(response => {
            // Remove 'new' class from target item
            const updatedNotifications = notifications.map(notification =>
                notification.notification_id == id ? { ...notification, read_status: true } : notification
            );
            setNotifications(updatedNotifications);
            setUnreadCount(prev => prev > 0 ? prev - 1 : 0)
        }).catch((err) => {
            console.error("Failed to mark as read", err)
        })
    }

    return (
        <>
            <span title="Open Notifications" className={style.notif_button} onClick={notifCount == 0 ? toggleNotif : handlePendingNotif}>
                <i className="fa fa-bell" aria-hidden="true"></i>
                {(notifCount + unreadCount) != 0 && (
                    <span className={style.notif_count}>
                        {notifCount + unreadCount}
                    </span>
                )}
            </span>
            {isNotifVisible && (
                <div className={style.notification_container}>
                    <div className={style.notification_header}>Notifications ({sessionStorage.getItem("currentNotifCount")})</div>
                    <div className={style.item_container}>
                        {notifications.length == 0 && (
                            <div>No notifications</div>
                        )}
                        {notifications.length > 0 && (
                            displayedNotifications.map((notification, index) => (
                                <div className={`${style.notification_item} ${!notification.read_status ? style['new'] : null}`} key={index} onClick={() => handleNotificationClick(notification)}>
                                    <div className={style.message_header}>
                                        <span>Client:<strong>{notification.last_name}</strong></span>
                                        <span style={{ fontSize: "8.5px" }}>{notification.notification_datetime}</span>
                                    </div>
                                    <span className={style.message}>{notification.notification_body}</span>
                                </div>
                            ))
                        )}
                    </div>
                    <div className={style.notification_footer}>
                        <span className={style.expand_notification} onClick={toggleViewAll}>
                            {`${viewAllNotif ? "Show fewer" : "View all notifications"}`}
                        </span>
                    </div>
                </div>
            )}
        </>
    )
}

export default Notifications
