import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import Routes from "./Routes";

const Root = () => {
    return (
        <div>
            <Header />
            <Routes />
            <Footer />
        </div>
    );
}

export default Root;