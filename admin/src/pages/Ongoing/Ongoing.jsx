import React, { useContext, useEffect, useState } from 'react'
import style from './Ongoing.module.css'
import Content from '../../components/Content/Content'
import axios from 'axios'
import { appContext } from '../../App'

function Ongoing() {
    document.title = 'On-going Requests'
    const [isLoading, setIsLoading] = useState(true)
    const { selectedRequestId, setSelectedRequestId, requestList, setRequestList } = useContext(appContext)

    useEffect(() => {
        async function fetchRequests() {
            setIsLoading(true)
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_HOST}/api/requests`, {
                    params: { admin_id: localStorage.getItem('admin_id') }
                })
                setRequestList(response.data)
                console.log('Fetched ongoing requests')
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
            <div className={style.page_title}>On-going Requests</div>
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

export default Ongoing
