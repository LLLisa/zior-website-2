import React from "react";
import { Route, HashRouter} from "react-router-dom";
import Header from "./Header";
import About from "../views/About";
import JFT from "../views/JFT";

const Root = () => {
    return (
        <div>
            <Header />
            <HashRouter>
              <Route path="/about" component={About} />
              <Route path="/jft" component={JFT} />
            </HashRouter>
            <div>footer</div>
        </div>
    );
}

export default Root;