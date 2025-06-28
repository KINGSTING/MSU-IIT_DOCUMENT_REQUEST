import React, { useEffect, useState } from 'react'
import style from './Flash.module.css'

function Flash({ flashInfo, setFlashInfo }) {
    useEffect(() => {
        if (flashInfo.type == 'success') {
            const delay = setTimeout(() => setFlashInfo(null), 5000)
            return () => clearTimeout(delay)
        }
    }, [flashInfo, setFlashInfo])

    return (
        <>
            <div className={`${style.flash_box} ${style[flashInfo.type]}`}>
                <span>
                    {flashInfo.message}
                </span>
            </div>
        </>
    )
}

export default Flash
