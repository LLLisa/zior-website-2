import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import Routes from "./Routes";

const classes = {
    main: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
    },
}

const Root = () => {
    return (
        <main style={classes.main}>
            <Header />
            <Routes />
            <Footer />
        </main>
    );
}

export default Root;