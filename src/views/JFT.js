import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import DOMPurify from 'dompurify';
import { loadJFT } from '../store/jftReducer';
import { FullScreen, useFullScreenHandle } from "react-full-screen";
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
};

const JFT = ({ jft, loadJFT }) => {
    const handle = useFullScreenHandle();

    useEffect(() => {
      if (!jft.length) loadJFT();
    }, []);

    return (
        <div style={theme.contentContainer}>
            <FullScreen handle={handle}>
                <div
                    style={classes.renderedJft}
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
