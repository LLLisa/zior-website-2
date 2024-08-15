import React from 'react';
import NavBar from './NavBar';
import theme from '../utils/theme';
import { Link } from 'react-router-dom';

const { palette } = theme;

const classes = {
    header: {
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: palette.secondaryBG,
        color: palette.altText,
    },
    a: {
        color: 'inherit',
        textDecoration: 'none',
        outline: 'none',
    },
};

const Header = () => {
    return (
        <header style={classes.header}>
            <Link style={classes.a} to="/home">
                <h1>Zoom In On Recovery</h1>
            </Link>
            <NavBar />
        </header>
    );
};

export default Header;
