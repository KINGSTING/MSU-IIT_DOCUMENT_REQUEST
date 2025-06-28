import React, { useContext, useEffect, useState } from 'react'
import style from './Completed.module.css'
import Content from '../../components/Content/Content'
import axios from 'axios'
import { appContext } from '../../App'

function Completed() {
    document.title = 'Completed Requests'
    const [isLoading, setIsLoading] = useState(true)
    const { selectedRequestId, setSelectedRequestId, requestList, setRequestList } = useContext(appContext)

    useEffect(() => {
        async function fetchRequests() {
            setIsLoading(true)
            try {
                console.log('Fetching completed requests...')
                const response = await axios.get(`${import.meta.env.VITE_API_HOST}/api/requests/completed`, {
                    params: { admin_id: localStorage.getItem('admin_id') }
                })
                setRequestList(response.data)
            } catch (err) {
                if (err.response.status == 401) {
                    localStorage.clear()
                    navigator('/login')
                }
                console.error('Failed to fetch requests.', err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchRequests()
    }, [])

    return (
        <>
            <div className={style.page_title}>Completed Requests</div>
            <div className={style.body_container}>
                <Content
                    requestList={requestList}
                    isLoading={isLoading}
                    setSelectedRequestId={setSelectedRequestId}
                    selectedRequestId={selectedRequestId}
                />
            </div>
        </>
    )
}

export default Completed
