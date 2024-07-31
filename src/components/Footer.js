import React from "react";
import { getEasternTimeAsLocal } from "../utils/getEasternTimeAsLocal";

const classes = {
    footer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'lightblue',
        color: 'black',
        padding: '1rem',
    },
};

const Footer = () => {
    return (
        <footer style={classes.footer}>
            <p>Meeting Time: {getEasternTimeAsLocal('19:00')} to {getEasternTimeAsLocal('20:00')}</p>
            <a href="https://us02web.zoom.us/j/75907342333?pwd=MFd0OGo5dzBSbHIzY1ZORUw5Y09xZz09" target="_blank" rel="noreferrer">Join Zoom Meeting</a>
            <img src="/zoomQrCode" alt="Zoom QR code" />
        </footer>
    );
};

export default Footer;