import React, { useEffect } from "react";
import { connect } from "react-redux";
import axios from "axios";
import DOMPurify from "dompurify";
import { loadJFT } from "../store/jftReducer";

const classes = {
  renderedJft: {
    backgroundColor: "#f9f9f9",
    padding: "40px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    marginBottom: "20px",
    fontSize: "16px",
  },
};

const JFT = ({jft, loadJFT}) => {

    useEffect(() => {
        if(!jft.length) loadJFT();
    }, []);

    return (
        <div>
            <h1>Just For Today</h1>
            <div
                style={classes.renderedJft}
                dangerouslySetInnerHTML={{ __html: jft }}
            />
        </div>
    );
}

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