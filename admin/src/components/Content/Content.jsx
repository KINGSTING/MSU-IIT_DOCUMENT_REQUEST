import style from './Content.module.css'
import { recieveConfig } from '../../static/utils/helper-configs.js'
import { useEffect, useState } from 'react'

function Content({ isLoading, requestList, selectedRequestId, setSelectedRequestId }) {
    const [filteredRequests, setFilteredRequests] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [filterTerm, setFilterTerm] = useState('Default')

    useEffect(() => {
        setFilteredRequests(requestList)
    }, [requestList])

    useEffect(() => {
        let updatedList = requestList

        if (searchTerm) {
            updatedList = updatedList.filter(request =>
                Object.values(request).some(value =>
                    value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                )
            )
        }

        if (filterTerm && filterTerm !== 'Default') {
            updatedList = [...updatedList].sort((a, b) => {
                switch (filterTerm) {
                    case "Student ID":
                        return a.student_id.localeCompare(b.student_id)
                    case "Category":
                        return a.category.localeCompare(b.category)
                    case "Full Name":
                        return a.full_name.localeCompare(b.full_name)
                    case "Requested Documents":
                        return a.requested_documents.localeCompare(b.requested_documents)
                    case "Receive Type":
                        return a.receive_type.localeCompare(b.receive_type)
                    case "Date of Request":
                        return new Date(a.date_of_request) - new Date(b.date_of_request)
                    case "Assigned":
                        return a.assigned.localeCompare(b.assigned)
                    case "Status":
                        return a.status.localeCompare(b.status)
                    default:
                        return 0
                }
            })
        }

        setFilteredRequests(updatedList)
    }, [searchTerm, filterTerm, requestList])

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value)
    }

    const handleFilterChange = (e) => {
        setFilterTerm(e.target.value)
    }

    const handleClear = () => {
        setSearchTerm('')
    }

    return (
        <>
            <div className={style.search_container}>
                <span className={style.key_search}>
                    <label htmlFor="keyword_search">Search Keywords:</label>
                    <input
                        type="text"
                        name="keyword"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder='Enter search term in real time'
                    />
                    <button title='Clear search' onClick={handleClear}>Clear</button>
                </span>
                <span className={style.filter_search}>
                    <label htmlFor="filter">Sort By:</label>
                    <select
                        name="filter"
                        value={filterTerm}
                        onChange={handleFilterChange}
                    >
                        <option value="Default">Default</option>
                        <option value="Student ID">Student ID</option>
                        <option value="Category">Category</option>
                        <option value="Full Name">Full Name</option>
                        <option value="Requested Documents">Requested Documents</option>
                        <option value="Receive Type">Receive Type</option>
                        <option value="Date of Request">Date of Request</option>
                        <option value="Assigned">Assigned</option>
                        <option value="Status">Status</option>
                    </select>
                </span>
            </div>

            <div className={style.table_container}>
                <div className={style.data_container}>
                    <div className={style.table_head}>
                        <span>Student ID</span>
                        <span>Category</span>
                        <span>Full Name</span>
                        <span>Requested Documents</span>
                        <span>Receive Type</span>
                        <span>Date of Request</span>
                        <span>Assigned</span>
                        <span>Status</span>
                    </div>
                    {isLoading && (
                        <div className={style.loading_icon}>Loading...</div>
                    )}
                    {!isLoading && !Array.isArray(filteredRequests) && (
                        <div className={style.loading_icon}>Requests Empty</div>
                    )}
                    {!isLoading && Array.isArray(filteredRequests) && (
                        <>
                            {filteredRequests.map((request, index) => (
                                <div
                                    className={`${style.table_data} ${selectedRequestId == request.request_id ? style.selected : null}`}
                                    key={index}
                                    onClick={() => setSelectedRequestId(request.request_id)}
                                >
                                    <span>{request.student_id}</span>
                                    <span>{request.category}</span>
                                    <span>{request.full_name}</span>
                                    <span>{request.requested_documents}</span>
                                    <span>{recieveConfig[request.receive_type]}</span>
                                    <span>{request.date_of_request}</span>
                                    <span>{request.assigned ? request.assigned : "none"}</span>
                                    <span className={style[request.status.toLowerCase()]}>
                                        {request.status.toUpperCase()}
                                    </span>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

export default Content
