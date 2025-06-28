import React, { useEffect, useState } from 'react';
import style from './Preview.module.css';
import axios from 'axios';
import { stageActionConfig } from '../../static/utils/helper-configs';
import Details from '../Details/Details';
import Comments from '../Comments/Comments';
import { useLocation } from 'react-router-dom';

function Preview({ selectedRequestId, setShowOverlay, setShowOverlayInfo, setFlashInfo }) {
    const [tab, setTab] = useState('')
    const [request, setRequest] = useState([])
    const [documents, setDocuments] = useState([])
    const [comments, setComments] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // Reset tab location, on tab change and request change
    useEffect(() => {
        setTab('info')
    }, [selectedRequestId, useLocation().pathname])

    useEffect(() => {
        async function fetchRequest(selectedRequestId) {
            setIsLoading(true)
            try {
                console.log('Fetching request, documents, and comments...')
                const response = await axios.get(`${import.meta.env.VITE_API_HOST}/api/request/${selectedRequestId}`, {
                    params: { admin_id: localStorage.getItem('admin_id') }
                })
                setRequest(response.data)
                const document = await axios.get(`${import.meta.env.VITE_API_HOST}/api/request/documents/${selectedRequestId}`, {
                    params: { admin_id: localStorage.getItem('admin_id') }
                })
                setDocuments(document.data)
                const comments = await axios.get(`${import.meta.env.VITE_API_HOST}/api/request/comments/${selectedRequestId}`, {
                    params: { admin_id: localStorage.getItem('admin_id') }
                })
                setComments(comments.data)
            } catch (err) {
                console.error('Failed to fetch request, documents, or comments', err)
            } finally {
                setIsLoading(false)
            }
        }

        selectedRequestId != null ? fetchRequest(selectedRequestId) : null
    }, [selectedRequestId])

    function showOverlay(type) {
        if (type == 'Payment') {
            const data = {
                "documents": documents,
                "request": request,
                // "payment_total": request.payment_total,
                // "tor_pages": request.tor_pages,
                // "proof_of_payment": request.proof_of_payment,
            }
            setShowOverlayInfo(data)
            setShowOverlay('Payment')
        }
        else if (type == 'Action') {
            const data = {
                "status": request.status,
                "clarify": false,
            }
            setShowOverlayInfo(data)
            setShowOverlay('Action')
        }
        else if (type == 'Clarify') {
            const data = {
                "status": "Clarifying",
                "clarify": true,
            }
            setShowOverlayInfo(data)
            setShowOverlay('Action')
        }
    }

    return (
        <>
            <div className={style.preview_container}>
                <div className={style.tab_container}>
                    <span
                        className={tab === 'info' ? style.selected : ''}
                        onClick={() => setTab('info')}>
                        Request Information
                    </span>
                    <span
                        className={tab === 'comment' ? style.selected : ''}
                        onClick={() => setTab('comment')}>
                        Comments
                    </span>
                </div>
                {selectedRequestId != null && !isLoading && (
                    <>
                        {tab == 'info' && (
                            <>
                                <div className={style.content}>
                                    <Details request={request} documents={documents} showOverlay={showOverlay} setFlashInfo={setFlashInfo} />
                                </div>
                                {request.status != 'Completed' && (
                                    <div className={style.buttons_container}>
                                        {request.status == 'Pending' && (
                                            <button className={`${style.action_button} ${style.clarify}`} onClick={() => showOverlay('Clarify')}>
                                                <i className="fa fa-angle-left" aria-hidden="true" style={{ fontWeight: "bold", fontSize: "14px", marginRight: "5px" }}></i>
                                                Clarify
                                            </button>
                                        )}
                                        {request.status == 'Clarifying' && (
                                            <button className={`${style.action_button} ${style.pending}`} onClick={() => showOverlay('Action')}>
                                                Process <i className="fa fa-angle-right" aria-hidden="true" style={{ fontWeight: "bold", fontSize: "14px", marginLeft: "3px" }}></i>
                                            </button>
                                        )}
                                        {request.status != 'Clarifying' && (
                                            <button className={`${style.action_button} ${style[request.status.toLowerCase()]}`} onClick={() => showOverlay('Action')}>
                                                {stageActionConfig[request.status]} <i className="fa fa-angle-right" aria-hidden="true" style={{ fontWeight: "bold", fontSize: "14px", marginLeft: "3px" }}></i>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                        {tab == 'comment' && (
                            <div className={style.content}>
                                <Comments selectedRequestId={selectedRequestId} comments={comments} setComments={setComments} request={request} />
                            </div>
                        )}
                    </>
                )}
                {selectedRequestId != null && isLoading && (
                    <div className={style.no_loading}>Loading...</div>
                )}
                {selectedRequestId == null && (
                    <div className={style.no_selected}>No selected</div>
                )}
            </div>
        </>
    );
}

export default Preview;
