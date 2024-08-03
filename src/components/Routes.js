import React from "react";
import { Route, HashRouter} from "react-router-dom";
import About from "../views/About";
import JFT from "../views/JFT";
import Calendar from "../views/Calendar";
import ForTheNewcomer from "../views/ForTheNewcomer";
import HelpfulLinks from "../views/HelpfulLinks";
import ServiceAtZior from "../views/ServiceAtZior";
import DailySlides from "../views/DailySlides";
import AnniversarySlides from "../views/AnniversarySlides";
import SeventhTradition from "../views/SeventhTradition";
import DailyScript from "../views/DailyScript";
import AnniversaryScript from "../views/AnniversaryScript";

const Routes = () => {
  return (
      <HashRouter>
          <Route exact path="/" component={About} />
          <Route path="/about" component={About} />
          <Route path="/jft" component={JFT} />
          <Route path="/calendar" component={Calendar} />
          <Route path="/for-the-newcomer" component={ForTheNewcomer} />
          <Route path="/helpful-links" component={HelpfulLinks} />
          <Route path="/service-at-zior" component={ServiceAtZior} />
          <Route path="/slide-deck-daily" component={DailySlides} />
          <Route path="/slide-deck-anniversary" component={AnniversarySlides} />
          <Route path="/seventh-tradition" component={SeventhTradition} />
          <Route path="/daily-script" component={DailyScript} />
          <Route path="/anniversary-script" component={AnniversaryScript} />
      </HashRouter>
    )
}

export default Routes