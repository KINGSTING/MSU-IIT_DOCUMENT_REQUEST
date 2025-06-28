import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios';
import style from './Navigation.module.css'
import logo from '../../assets/img/iit-logo.png'
import profile from '../../assets/img/profile.png'
import profile_image from '../../assets/img/profile_image.png'
import { useNavigate, useLocation } from 'react-router-dom'
import Notifications from '../Notifications/Notifications'

function Navigation({ setSelectedRequestId, selectedRequestId }) {
    const navigator = useNavigate()
    const location = useLocation()
    const [isExpanded, setIsExpanded] = useState(true)
    const [isNavbarVisible, setIsNavbarVisible] = useState(true)

    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isNotifVisible, setIsNotifVisible] = useState(false)
    const [viewAllNotif, setViewAllNotif] = useState(false)
    const [viewAccount, setViewAccount] = useState(false)
    const [adminName, setAdminName] = useState('')
    const notifRef = useRef(null)
    const accountRef = useRef(null)

    useEffect(() => {
        setAdminName(localStorage.getItem('admin_name') || 'None')
        getNotifications()

        // Collapse notif bar when clicked outside
        function handleClickOutside(event) {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setViewAllNotif(false)
                setIsNotifVisible(false)
            }
            if (accountRef.current && !accountRef.current.contains(event.target)) {
                setViewAccount(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    async function getNotifications() {
        return await axios.get(`${import.meta.env.VITE_API_HOST}/api/notification/get/admin`, {
            params: { admin_id: localStorage.getItem('admin_id') }
        })
            .then(response => {
                console.log("Fetched notifications")
                const data = response.data
                setNotifications(data)
                setUnreadCount(data.filter(item => item.read_status == false).length)
                sessionStorage.setItem("currentNotifCount", data.length)
            })
            .catch(error => {
                sessionStorage.setItem("currentNotifCount", 0)
                console.error("Error fetching notifications", error)
            })
    }

    function handleSignOut() {
        if (confirm('Are you sure you want to log out?') == true) {
            axios.get(`${import.meta.env.VITE_API_HOST}/api/auth/logout`, {
                params: { admin_id: localStorage.getItem('admin_id') }
            }).then(response => {
                console.log(response.data.msg)
                localStorage.clear()
                navigator('/login')
            }).catch(error => {
                console.error("Error fetching notifications", error)
            })
        }
    }

    // Toggle expand/collapse state
    function toggleExpand() {
        setIsExpanded((prev) => !prev)
    }

    function toggleNavbar() {
        setIsNavbarVisible((prev) => !prev)
    }

    function toggleNotif() {
        setIsNotifVisible((prev) => !prev)
    }

    function toggleViewAll() {
        setViewAllNotif((prev) => !prev)
    }

    function toggleAccount() {
        setViewAccount((prev) => !prev)
    }

    function navigateTo(location) {
        setSelectedRequestId(null)
        navigator(`/dashboard/${location}`)
    }

    // Check current page title
    const isOngoingSelected = location.pathname.includes('ongoing')
    const isCompletedSelected = location.pathname.includes('completed')
    const isShippingSelected = location.pathname.includes('ship-settings')

    return (
        <>
            {/* Header Section */}
            <div className={`${style.header} ${isNavbarVisible ? null : style.header_expand}`}>
                <span title="Collapse Sidebar" className={style.collapse_button} onClick={toggleNavbar}><i className="fa fa-bars" aria-hidden="true"></i></span>
                <span title="Account Info" className={style.account_button} onClick={toggleAccount}>
                    <img src={profile_image} alt="Profile Image" />
                    <span>{adminName.toUpperCase()}</span>
                    {viewAccount && (
                        <div className={style.account_container} ref={accountRef}>
                            <img src={profile_image} alt="Profile image" />
                            <span className={style.account_name}>{adminName.toUpperCase()}</span>
                            <span className={style.sign_out}>
                                <button onClick={handleSignOut}>Sign-out</button>
                            </span>
                        </div>
                    )}
                </span>
                <div className={style.notif_container} ref={notifRef}>
                    <Notifications
                        unreadCount={unreadCount}
                        selectedRequestId={selectedRequestId}
                        setUnreadCount={setUnreadCount}
                        setSelectedRequestId={setSelectedRequestId}
                        getNotifications={getNotifications}
                        setNotifications={setNotifications}
                        notifications={notifications}
                        toggleNotif={toggleNotif}
                        isNotifVisible={isNotifVisible}
                        viewAllNotif={viewAllNotif}
                        toggleViewAll={toggleViewAll}
                    />
                </div>
            </div>

            {/* Navigation Section */}
            <div className={`${style.nav_container} ${isNavbarVisible ? style.nav_visible : style.nav_hidden}`} >
                <div className={style.logo_section}>
                    <img src={logo} alt="IIT-Logo" />
                </div>
                {isNavbarVisible && (
                    <>
                        <div className={style.profile}>
                            <img src={profile} alt="Document Picture" />
                            <span>MSU-IIT Online Document Request</span>
                        </div>
                        {/* Options Section */}
                        <div className={style.navigation}>
                            {/* Main Option */}
                            <div className={`${style.main_option} ${style.option}`} onClick={toggleExpand}>
                                <span className={style.option_icon}><i className="fa fa-book" aria-hidden="true"></i></span>
                                <span className={style.option_label}>Online Document Request</span>
                                <span className={style.collapse_option}>
                                    <i className={`fa ${isExpanded ? 'fa-angle-down' : 'fa-angle-left'}`} aria-hidden="true"></i>
                                </span>
                            </div>
                            {/* Sub Option */}
                            <div className={`${style.sub_option_container} ${isExpanded ? style.expanded : style.collapsed}`}>
                                <div className={`${style.option}`} onClick={() => { navigateTo('ongoing') }}>
                                    <span className={style.option_icon}><i className="fa fa-spinner" aria-hidden="true"></i></span>
                                    <span className={`${style.option_label} ${isOngoingSelected ? style.selected : null}`}>On-going</span>
                                </div>
                                <div className={`${style.option}`} onClick={() => { navigateTo('completed') }}>
                                    <span className={style.option_icon}><i className="fa fa-list" aria-hidden="true"></i></span>
                                    <span className={`${style.option_label} ${isCompletedSelected ? style.selected : null}`}>Completed</span>
                                </div>
                                <div className={`${style.option}`} onClick={() => { navigateTo('ship-settings') }}>
                                    <span className={style.option_icon}><i className="fa fa-truck" aria-hidden="true"></i></span>
                                    <span className={`${style.option_label} ${isShippingSelected ? style.selected : null}`}>Shipping</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                {!isNavbarVisible && (
                    <>
                        {/* Collapsed nav */}
                        <div className={style.profile_collapsed}>
                            <img src={profile} alt="Document Picture" />
                        </div>
                        <div className={style.navigation}>
                            <div className={`${style.main_option_collapsed} ${style.option}`}>
                                <span className={style.option_icon}><i className="fa fa-book" aria-hidden="true"></i></span>
                            </div>
                        </div>
                    </>
                )}
            </div >
        </>
    )
}

export default Navigation
