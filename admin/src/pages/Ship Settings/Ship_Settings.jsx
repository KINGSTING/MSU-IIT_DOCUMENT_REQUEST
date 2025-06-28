import React, { useContext, useState, useEffect } from 'react';
import style from './Ship_Settings.module.css';
import { appContext } from '../../App';
import axios from 'axios';

function Ship_Settings() {
    // Set the page title
    useEffect(() => {
        document.title = 'Shipping Settings';
    }, []);

    const [mindanao, setMindanao] = useState(0);
    const [visayas, setVisayas] = useState(0);
    const [luzon, setLuzon] = useState(0);

    const { setShowOverlay, setShowOverlayInfo } = useContext(appContext);

    // Fetch prices on component mount
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_HOST}/api/shipping`, {
            params: { admin_id: localStorage.getItem('admin_id') }
        })
            .then(response => {
                const data = response.data;
                setMindanao(data.Mindanao);
                setVisayas(data.Visayas);
                setLuzon(data.Luzon);
            })
            .catch(err => {
                if (err.response.status == 401) {
                    localStorage.clear()
                    navigator('/login')
                }
                console.error('Error fetching price list', err);
            });
    }, []);

    function handleSubmit() {
        const data = {
            status: 'shipping',
            clarify: true,
            prices: { mindanao, visayas, luzon },
        };

        setShowOverlayInfo(data);
        setShowOverlay('Action');
    }

    return (
        <>
            <div className={style.page_title}>Shipping Settings</div>
            <div className={style.body_container}>
                <div className={style.main_body}>
                    <div className={style.section}>
                        <div className={style.section_header}>
                            <span>Regional Shipping Prices</span>
                        </div>
                    </div>
                    <div className={style.section_data}>
                        <span className={style.data_label}>Within Mindanao</span>
                        <span className={style.data_content}>
                            <input
                                type="number"
                                min="1"
                                max="1000"
                                value={mindanao || 0}
                                onChange={(e) => setMindanao(Number(e.target.value))}
                            /> Php
                        </span>
                    </div>
                    <div className={style.section_data}>
                        <span className={style.data_label}>Mindanao to Visayas</span>
                        <span className={style.data_content}>
                            <input
                                type="number"
                                min="1"
                                max="1000"
                                value={visayas || 0}
                                onChange={(e) => setVisayas(Number(e.target.value))}
                            /> Php
                        </span>
                    </div>
                    <div className={style.section_data}>
                        <span className={style.data_label}>Mindanao to Luzon</span>
                        <span className={style.data_content}>
                            <input
                                type="number"
                                min="1"
                                max="1000"
                                value={luzon || 0}
                                onChange={(e) => setLuzon(Number(e.target.value))}
                            /> Php
                        </span>
                    </div>
                    <div className={style.button_section}>
                        <button className={style.confirm_button} onClick={handleSubmit}>
                            Update Record
                        </button>
                    </div>
                </div>
                <div className={style.notes}>
                    {/* <span><strong>Notes:</strong> Put notes here...</span> */}
                </div>
            </div>
        </>
    );
}

export default Ship_Settings;
