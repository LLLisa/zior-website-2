import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import DOMPurify from 'dompurify';
import { loadJFT } from '../store/jftReducer';
import { toggleFullscreen, setFullScreenHandle } from '../store/fullscreenReducer';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import theme from '../utils/theme';

const classes = {
    renderedJft: {
        backgroundColor: '#f9f9f9',
        padding: '40px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        marginBottom: '20px',
        fontSize: '16px',
    },
    fullscreenJFT: {
        fontSize: '24px',
        backgroundColor: '#f9f9f9',
        height: '100vh',
        width: '80vw',
        margin: '0 auto',
        padding: '10px 40px 40px 40px',
    },
};

const JFT = ({ jft, loadJFT, isFullscreen, toggleFullscreen, setFullScreenHandle }) => {
    const handle = useFullScreenHandle();

    useEffect(() => {
        if (!jft.length) loadJFT();
    }, []);

    useEffect(() => {
        setFullScreenHandle(handle);
    }, [handle]);

    const handleFullScreenChange = () => {
        if (!document.fullscreenElement) {
            toggleFullscreen(false);
        } else {
            toggleFullscreen(true);
        }
    };

    return (
        <div style={theme.contentContainer}>
            <FullScreen
                handle={handle}
                onChange={handleFullScreenChange}
            >
                <div
                    style={isFullscreen ? classes.fullscreenJFT : classes.renderedJft}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(jft) }}
                />
            </FullScreen>
        </div>
    );
};

const mapState = (state) => {
    return {
        jft: state.jft,
        isFullscreen: state.fullscreen.isFullscreen,
    };
};

const mapDispatch = (dispatch) => {
    return {
        loadJFT: () => dispatch(loadJFT()),
        toggleFullscreen: (fullscreenState) => dispatch(toggleFullscreen(fullscreenState)),
        setFullScreenHandle: (handle) => dispatch(setFullScreenHandle(handle)),
    };
};

export default connect(mapState, mapDispatch)(JFT);
