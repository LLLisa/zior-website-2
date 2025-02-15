import React from "react";
import theme from "../utils/theme";

const HelpfulLinks = () => {
  return (
      <div style={theme.contentContainer}>
          <h1>Helpful Links</h1>
          <p>This is the HelpfulLinks section.</p>
          <ul>
              <li>
                  <a href='https://www.na.org/'>Narcotics Anonymous</a>
              </li>
              <li>
                  <a href='https://www.na.org/?ID=ips-eng-index'>Informational Pamphlets</a>
              </li>
              <li>
                  <a href='https://nadailyinventory.com/'>Daily 10th Step Inventory</a>
              </li>
          </ul>
      </div>
  );
}

export default HelpfulLinks;