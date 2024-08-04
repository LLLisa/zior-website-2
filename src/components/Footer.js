import React from "react";
import { getEasternTimeAsLocal } from "../utils/getEasternTimeAsLocal";
import theme from "../utils/theme";

const classes = {
    footer: {
        position: 'sticky',
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: theme.secondaryBG,
        color: theme.text,
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