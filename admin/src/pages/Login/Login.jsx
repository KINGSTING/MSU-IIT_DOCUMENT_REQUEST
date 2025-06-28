import React, { useEffect, useState } from 'react'
import style from './Login.module.css'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import video from '../../assets/vid/reel-16.mp4'
import logo from '../../assets/img/login_logo.png'

function Login() {
    const [errMessage, setErrMessage] = useState('')
    const redirect = useNavigate()

    useEffect(() => {
        if (localStorage.getItem("admin_id")) {
            redirect('/')
        }
    }, [])

    const onSubmit = (data) => {
        axios.post(`${import.meta.env.VITE_API_HOST}/api/auth/login`, data).then((res) => {
            if (res.data.err) {
                setErrMessage(res.data.err)
            }
            else {
                localStorage.setItem('admin_name', res.data.admin_name)
                localStorage.setItem('admin_id', res.data.admin_id)
                alert(res.data.msg)
                redirect('/dashboard/ongoing')
            }
        }, {
            params: {
                admin_id: localStorage.getItem('admin_id')
            }
        }).catch((error) => {
            console.error("Error during login:", error);
        })
    }

    const initialValues = {
        email: '',
        password: '',
    }

    const validationSchema = Yup.object().shape({
        email: Yup.string().required('You must enter an Email'),
        password: Yup.string().required('You must enter a Password'),
    })

    return (
        <>
            <div className={style.container}>
                <div className={style.form_container}>
                    <img src={logo} alt="Login IIT Logo" />
                    <span className={style.header}>Sign-in to Continue to<br />Registrar Document Request Admin</span>
                    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
                        <Form>
                            <Field id='email' name='email' type='email' placeholder='Enter Email' className={style.email} /><br />
                            <ErrorMessage name='email' component='div' className={style.error} />
                            <Field id='password' name='password' type='password' placeholder='Enter Password' className={style.password} /><br />
                            <ErrorMessage name='password' component='div' className={style.error} />

                            <button type='submit' className={style.submit_button}> Sign-in </button>
                            <div className={style.login_error}>{errMessage}</div>
                        </Form>
                    </Formik>
                </div>
                <div className={style.movie_container}>
                    {/* <img src={video} alt="Video Here" /> */}
                    <video controls loop autoPlay muted>
                        <source src={video} type="video/mp4"
                        />
                        Sorry, your browser doesn't support videos.
                    </video>
                </div>
            </div>
        </>
    )
}

export default Login
