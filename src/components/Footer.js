import React from "react";
import { getEasternTimeAsLocal } from "../utils/getEasternTimeAsLocal";
import theme from "../utils/theme";

const { palette } = theme

const classes = {
    footer: {
        position: 'sticky',
        bottom: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: palette.secondaryBG,
        color: palette.altText,
    },
    a: {
        borderRadious: '0.5rem',
        padding: '0.5rem 1rem',
        backgroundColor: palette.primaryBG,
        border: '1px solid black',
    },
};

const Footer = () => {
    return (
        <footer style={classes.footer}>
            <p>Meeting Time (in your local time zone): {getEasternTimeAsLocal('19:00')} to {getEasternTimeAsLocal('20:00')}</p>
            <a style={classes.a} href="https://us02web.zoom.us/j/75907342333?pwd=MFd0OGo5dzBSbHIzY1ZORUw5Y09xZz09" target="_blank" rel="noreferrer">Join Zoom Meeting</a>
        </footer>
    );
};

export default Footer;