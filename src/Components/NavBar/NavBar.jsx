import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faEnvelope } from '@fortawesome/fontawesome-free-solid'
import {fab,faGithub} from "@fortawesome/free-brands-svg-icons";
import 'font-awesome/css/font-awesome.min.css';

export const NavBar = () => {
    return (
        <>
        <section className = "nav-container">
            <div className="logo">
                <a href="/">Shorten.It</a>
            </div>
            <div className = "social-container">
            <div className="link">
                    <a href="#">
                        <FontAwesomeIcon icon = {faGithub} />
                    </a>
                </div>
                {/* <div className="link">
                    <a href="#">
                        <FontAwesomeIcon icon = {faEnvelope} />
                    </a>
                </div> */}
            </div>
        </section>
        </>
    )
}
