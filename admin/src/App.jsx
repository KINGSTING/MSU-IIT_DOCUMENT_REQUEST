import React, { createContext, useEffect, useState } from 'react'
import './App.css'
import Navigation from './components/Navigation/Navigation'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Preview from './components/Preview/Preview'
import Payment from './components/Payment/Payment'
import Action from './components/Action/Action'
import Flash from './components/Flash/Flash'
import axios from 'axios'

export const appContext = createContext()

function App() {
  const [requestList, setRequestList] = useState([])
  const [adminList, setAdminList] = useState([])
  const [selectedRequestId, setSelectedRequestId] = useState(null)
  const [showOverlay, setShowOverlay] = useState(null)
  const [overlayInfo, setShowOverlayInfo] = useState({})
  const [flashInfo, setFlashInfo] = useState(null)
  const [isSetttings, setIsSettings] = useState(null)
  const navigator = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Redirect if not logged in
    if (!localStorage.getItem("admin_id")) {
      navigator('/login')
    }

    axios.get(`${import.meta.env.VITE_API_HOST}/api/admin/all`, {
      params: { admin_id: localStorage.getItem('admin_id') }
    })
      .then(response => {
        setAdminList(response.data)
      }).catch(err => {
        if (err.response.status == 401) {
          localStorage.clear()
          navigator('/login')
        }
        console.error("Error fetching admin list", err)
      })
  }, [])

  useEffect(() => {
    setIsSettings(location.pathname.includes('ship-settings'))
  }, [location.pathname])

  return (
    <>
      <div className='global_container'>
        <Navigation setSelectedRequestId={setSelectedRequestId} selectedRequestId={selectedRequestId} />
        <div className={`outlet_container ${isSetttings ? 'no_border' : null}`}>
          <div className="flash_container">
            {flashInfo && flashInfo.message && (
              <Flash flashInfo={flashInfo} setFlashInfo={setFlashInfo} />
            )}
          </div>
          <appContext.Provider value={{
            selectedRequestId, setSelectedRequestId, requestList, setRequestList,
            setShowOverlay, setShowOverlayInfo //For shipping page
          }}>
            <Outlet />
          </appContext.Provider>
        </div>

        <div className='preview_container'>
          {!isSetttings && (
            <Preview
              selectedRequestId={selectedRequestId}
              setShowOverlay={setShowOverlay}
              setShowOverlayInfo={setShowOverlayInfo}
              setFlashInfo={setFlashInfo}
            />
          )}
        </div>
        <div className={`overlay_container ${showOverlay == null ? 'hidden' : null}`}>
          {showOverlay == 'Payment' && (
            <Payment
              setShowOverlay={setShowOverlay}
              overlayInfo={overlayInfo}
            />
          )}
          {showOverlay == 'Action' && (
            <Action
              adminList={adminList}
              setFlashInfo={setFlashInfo}
              selectedRequestId={selectedRequestId}
              setSelectedRequestId={setSelectedRequestId}
              requestList={requestList}
              setRequestList={setRequestList}
              setShowOverlay={setShowOverlay}
              overlayInfo={overlayInfo}
            />
          )}
        </div>
      </div>
    </>
  )
}

export default App
