import React, { useEffect } from "react";
import axios from "axios";

const fetchJFT = async () => {
  const response = await axios.get("/jft");
  console.log(response);
};

const JFT = () => {
  useEffect(() => {
    fetchJFT();
  }, []);

  return (
    <div>
      <h1>JFT</h1>
      <p>
        This is the JFT section.
      </p>
    </div>
  );
}

export default JFT;