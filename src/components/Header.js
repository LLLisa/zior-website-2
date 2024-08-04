import React from "react";
import NavBar from "./NavBar";
import theme from "../utils/theme";

const classes = {
    header: {
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.secondaryBG,
        color: theme.text,
    },
};

const Header = () => {
    return (
        <header style={classes.header}>
            <h1>Zoom In On Recovery</h1>
            <NavBar />
        </header>
    );
}

export default Header;