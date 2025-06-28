import React from 'react'
import style from './Details.module.css'
import { recieveConfig } from '../../static/utils/helper-configs'

function Details({ request, documents, showOverlay, setFlashInfo }) {

    const copyToClipboard = (string) => {
        navigator.clipboard.writeText(string)
        setFlashInfo({
            "type": "success",
            "message": `'${string}' copied to clipboard`
        })
    }

    return (
        <>
            <div className={style.section}>
                <div className={style.section_header}>
                    <span>Client Information</span>
                    <span className={style.assigned}>Assigned: <strong>{request.admin_name ? request.admin_name : "none"}</strong></span>
                </div>
                <div className={style.section_data}>
                    <span className={style.data_label}>Student ID Number</span>
                    <span className={`${style.data_content} ${style.copy_clipboard}`} title='Copy Student ID' onClick={() => copyToClipboard(request.student_id)}>
                        <strong>{request.student_id}</strong>
                    </span>
                </div>
                <div className={style.section_data}>
                    <span className={style.data_label}>Full Name</span>
                    <span className={`${style.data_content} ${style.copy_clipboard}`} title='Copy Full Name' onClick={() => copyToClipboard(request.full_name)}>
                        <strong>{request.full_name}</strong>
                    </span>
                </div>
                <div className={style.section_data}>
                    <span className={style.data_label}>Category</span>
                    <span className={style.data_content}>{request.category} Student</span>
                </div>
                <div className={style.section_data} style={{ borderBottom: "1px solid #DAD8D1" }}>
                    <span className={style.data_label}>E-mail</span>
                    <span className={`${style.data_content} ${style.copy_clipboard}`} title='Copy Email' onClick={() => copyToClipboard(request.email)}>
                        {request.email}
                    </span>
                </div>
                <div className={style.section_data} style={{ marginTop: "10px" }}>
                    <span className={style.data_label}>Purpose</span>
                    <span className={style.data_content}>{request.purpose}</span>
                </div>
                <div className={style.section_data}>
                    <span className={style.data_label}>Date Requested</span>
                    <span className={style.data_content}>{request.date_of_request}</span>
                </div>
            </div>
            <div className={style.section}>
                <div className={style.section_header}>
                    <span>Documents Requested</span>
                </div>
                {documents.map((document, index) => (
                    <div className={style.section_data} key={index}>
                        <span className={style.document_label}>Document {index + 1}</span>
                        <span className={style.document_content}>
                            <strong>{document.document_type}</strong> <br />
                            Copies: <strong>{document.copies_requested}</strong> <br />
                            {document.file_upload ? (
                                <>
                                    File Uploaded: <a href={document.file_upload} target="_blank" rel="noopener noreferrer">Uploaded File</a> <br />
                                </>
                            ) : null}
                            {document.sem_year && document.sem_year != 'N/A, N/A' ? (
                                <>
                                    Additional Info: {document.sem_year}
                                </>
                            ) : null}

                        </span>
                    </div>
                ))}
            </div>
            <div className={style.section}>
                <div className={style.section_header}>
                    <span>Receive Information</span>
                </div>
                <div className={style.section_data}>
                    <span className={style.data_label}>Category</span>
                    <span className={style.data_content}><strong>{recieveConfig[request.receive_type]}</strong></span>
                </div>
                {request.address != 'N/A' && (
                    <div className={style.section_data}>
                        <span className={style.data_label}>Address</span>
                        <span className={`${style.data_content} ${style.copy_clipboard}`} title='Copy Address' onClick={() => copyToClipboard(request.address)}>
                            {request.address.split("[region]=")[0]}
                        </span>
                    </div>
                )}
                <div className={style.section_data}>
                    <span className={style.data_label}>Contact Number</span>
                    <span className={`${style.data_content} ${style.copy_clipboard}`} title='Copy Contact Number' onClick={() => copyToClipboard(request.contact_number)}>
                        {request.contact_number}
                    </span>
                </div>
                {(request.receive_type == 'Within_Philippines' && request.status == 'Ready') && (
                    <div className={style.section_data}>
                        <span className={style.data_label}>Shipping Number</span>
                        <span className={`${style.data_content} ${style.copy_clipboard}`} title='Copy Shipping Number' onClick={() => copyToClipboard(request.shipping_number)}>
                            {request.shipping_number}
                        </span>
                    </div>
                )}
            </div>
            <div className={style.section}>
                <div className={style.section_header} style={{ border: "none", marginTop: "15px", marginBottom: "15px" }}>
                    <span>Payment Information</span>
                    <button className={style.show_payment} onClick={() => showOverlay('Payment')}>See Price and Payment</button>
                </div>
            </div>
        </>
    )
}

export default Details
