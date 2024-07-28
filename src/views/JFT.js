import React, { useEffect } from "react";
import axios from "axios";

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

const JFT = () => {
  const [jft, setJft] = React.useState("");
  
  useEffect(() => {
    fetchJFT();
  }, []);
  
  const fetchJFT = async () => {
    const response = await axios.get("/jft");
    setJft(response.data.jft);
  };

  return (
    <div>
      <h1>Just For Today</h1>
      <div style={classes.renderedJft} dangerouslySetInnerHTML={{ __html: jft}} />
    </div>
  );
}

export default JFT;