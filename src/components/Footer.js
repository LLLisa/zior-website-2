import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { toggleFullscreen } from "../store/fullscreenReducer";
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
        justifyContent: 'space-between',
        backgroundColor: palette.secondaryBG,
        color: palette.altText,
    },
    meetingTime: {
        marginLeft: '6rem',
    },
    a: {
        borderRadious: '0.5rem',
        padding: '0.5rem 1rem',
        marginRight: '6rem',
        backgroundColor: palette.primaryBG,
        border: '1px solid black',
    },
};

const Footer = ({fullscreenHandle}) => {
    const location = useLocation()  
    const [needsFullscreen, setNeedsFullscreen] = useState(false);

    useEffect(() => {
        setNeedsFullscreen(canBeFullscreen(location));
    }, [location]);

    const canBeFullscreen = ({pathname}) => {
        console.log(pathname);
        const fullscreenPaths = ['jft', 'slide-deck-daily', 'slide-deck-anniversary'];
        return fullscreenPaths.some((path) => pathname.includes(path));
    };    

    return (
        <footer style={classes.footer}>
            <p style={classes.meetingTime}>Meeting Time (in your local time zone): {getEasternTimeAsLocal('19:00')} to {getEasternTimeAsLocal('20:00')}</p>
            {needsFullscreen && fullscreenHandle && <button onClick={fullscreenHandle.enter}>Full Screen</button>}
            <a style={classes.a} href="https://us02web.zoom.us/j/75907342333?pwd=MFd0OGo5dzBSbHIzY1ZORUw5Y09xZz09" target="_blank" rel="noreferrer">Join Zoom Meeting</a>
        </footer>
    );
};

const mapState = (state) => {
    return {
        fullscreenHandle: state.fullscreen.fullscreenHandle,
    };
};

const mapDispatch = (dispatch) => {
    return {
        toggleFullscreen: (fullscreenState) => dispatch(toggleFullscreen(fullscreenState)),
    };
};

export default connect(mapState, mapDispatch)(Footer);