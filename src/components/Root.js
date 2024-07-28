import React from "react";
import { Route, HashRouter} from "react-router-dom";
import Header from "./Header";
import About from "../views/About";
import JFT from "../views/JFT";
import Calendar from "../views/Calendar";
import ForTheNewcomer from "../views/ForTheNewcomer";
import HelpfulLinks from "../views/HelpfulLinks";
import ServiceAtZior from "../views/ServiceAtZior";

const Root = () => {
    return (
        <div>
            <Header />
            <HashRouter>
              <Route exact path="/" component={About} />
              <Route path="/about" component={About} />
              <Route path="/jft" component={JFT} />
              <Route path="/calendar" component={Calendar} />
              <Route path="/for-the-newcomer" component={ForTheNewcomer} />
              <Route path="/helpful-links" component={HelpfulLinks} />
              <Route path="/service-at-zior" component={ServiceAtZior} />
            </HashRouter>
            <div>footer</div>
        </div>
    );
}

export default Root;