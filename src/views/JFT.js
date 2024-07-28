import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import DOMPurify from 'dompurify';
import { loadJFT } from '../store/jftReducer';
import { FullScreen, useFullScreenHandle } from "react-full-screen";

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
    const [currentDate, setCurrentDate] = useState(new Date().toDateString());
    const handle = useFullScreenHandle();

    useEffect(() => {
      if (!jft.length) loadJFT();
  
      // Fetch new JFT every day if tab is open
      const intervalId = setInterval(() => {
        const now = new Date().toDateString();
        if (now !== currentDate) {
          setCurrentDate(now);
          fetchData();
        }
      }, 60000);
      
      return () => clearInterval(intervalId);
    }, [currentDate]);

    return (
        <div>
            <h1>Just For Today</h1>
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
