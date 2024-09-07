import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import DOMPurify from 'dompurify';
import { loadJFT } from '../store/jftReducer';
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
        padding: '40px',
        paddingTop: '10px',
    },
};

const JFT = ({ jft, loadJFT }) => {
    const handle = useFullScreenHandle();
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        if (!jft.length) loadJFT();
    }, []);

    const handleFullScreenChange = () => {
        if (!document.fullscreenElement) {
            setIsFullScreen(false);
        } else {
            setIsFullScreen(true);
        }
    };

    return (
        <div style={theme.contentContainer}>
            <FullScreen
                handle={handle}
                onChange={handleFullScreenChange}
            >
                <div
                    style={isFullScreen ? classes.fullscreenJFT : classes.renderedJft}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(jft) }}
                />
            </FullScreen>
            <button onClick={handle.enter}>Full Screen</button>
        </div>
    );
};

const mapState = (state) => {
    return {
        jft: state.jft,
    };
};

const mapDispatch = (dispatch) => {
    return {
        loadJFT: () => dispatch(loadJFT()),
    };
};

export default connect(mapState, mapDispatch)(JFT);
