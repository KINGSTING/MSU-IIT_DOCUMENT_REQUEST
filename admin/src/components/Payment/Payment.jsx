import React, { useEffect, useState } from 'react'
import style from './Payment.module.css'
import axios from 'axios'

function Payment({ setShowOverlay, overlayInfo }) {
    const [isActive, setIsActive] = useState(false)
    // const { documents, payment_total, proof_of_payment } = overlayInfo
    const { documents, request } = overlayInfo
    const [shippingPrices, setShippingPrices] = useState({})

    useEffect(() => {
        setIsActive(true)
        axios.get(`${import.meta.env.VITE_API_HOST}/api/shipping`, {
            params: { admin_id: localStorage.getItem('admin_id') }
        })
            .then(response => {
                const data = response.data;
                setShippingPrices(data)
            })
            .catch(err => {
                if (err.response.status == 401) {
                    localStorage.clear()
                    navigator('/login')
                }
                console.error('Error fetching price list', err);
            });
    }, [])

    const handleBack = () => {
        setIsActive(false)
        const timeout = setTimeout(() => setShowOverlay(null), 300)
        return () => clearTimeout(timeout)
    }

    return (
        <div className={`${style.payment_container} ${isActive ? style.active : ''}`}>
            <div className={style.breakdown_section}>
                <span className={style.section_header}>Price Breakdown</span>
                <span className={style.breakdown_table}>
                    <span className={style.table_head}>
                        <span>Document</span>
                        <span>Copies</span>
                        <span>Price (Php)</span>
                    </span>
                    {documents.map((document, index) => (
                        <span className={style.table_data} key={index}>
                            <span>{document.document_type}</span>
                            <span>{document.copies_requested}</span>
                            <span>{document.price}{document.document_type == 'Transcripts of Records' || document.document_category == 'Authentication' ? (<>/page</>) : null}</span>
                        </span>
                    ))}
                </span>
                {documents.filter(document => document.document_type == 'Transcripts of Records').length > 0 && (
                    <span className={style.table_notes}>
                        *TOR: <strong>{request.tor_pages} Pages</strong><span>Total: <strong>Php {documents.filter(document => document.document_type == 'Transcripts of Records')[0].price * (request.tor_pages)}.00</strong></span>
                    </span>
                )}
                {request.receive_type == 'Within_Philippines' && (
                    <span className={style.table_notes}>
                        *Shipping to: <strong>{request.address.split("[region]=")[1]}</strong><span>Price: <strong>Php {shippingPrices[request.address.split("[region]=")[1]]}.00</strong></span>
                    </span>
                )}
                <span className={style.section_header}></span>
                <span className={style.breakdown_table}>
                    <span className={style.table_total}>
                        <span>Total</span>
                        <span>Php {request.payment_total}</span>
                    </span>
                </span>
            </div>
            <div className={style.proof_section}>
                <span className={style.section_header}>Proof of Payment</span>
                <a href={request.proof_of_payment} target='_blank'>
                    <img src={request.proof_of_payment} alt="Proof of Payment" className={style.image_container} />
                </a>
                <button className={style.back_button} onClick={handleBack}>
                    Back
                </button>
            </div>
        </div>
    )
}

export default Payment
