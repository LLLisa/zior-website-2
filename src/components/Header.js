import React from "react";
import NavBar from "./NavBar";

const classes = {
    header: {
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'lightblue',
        color: 'black',
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