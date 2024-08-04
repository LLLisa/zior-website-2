import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import theme from '../utils/theme';
import Header from './Header';
import Footer from './Footer';
import Routes from './Routes';

const classes = {
    main: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        width: '1200px',
        backgroundColor: theme.primary,
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
