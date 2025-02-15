import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import theme from '../utils/theme';
import Header from './Header';
import Footer from './Footer';
import Routes from './Routes';

const { palette } = theme

const classes = {
    main: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'start',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        width: '100vw',
        backgroundColor: palette.primaryBG,
    },
};

const Root = () => {
    return (
        <main style={classes.main}>
            <Router>
                <Header />
                <Routes />
                <Footer />
            </Router>
        </main>
    );
};

export default Root;
