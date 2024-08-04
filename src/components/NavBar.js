import React from 'react';
import { Link } from 'react-router-dom';

const classes = {
    list: {
        display: 'flex',
        justifyContent: 'center',
        listStyle: 'none',
        padding: 0,
        backgroundColor: 'lightblue',
    },
    navItem: {
        margin: '0 1rem',
    },
    a: {
        color: 'inherit',
        textDecoration: 'none',
        outline: 'none',
    },
    selected: {
      outline: '1px solid black',
    },
};

const routes = [
    {
        path: '/about',
        label: 'About Us',
    },
    {
        path: '/for-the-newcomer',
        label: 'For the Newcomer',
    },
    {
        path: '/calendar',
        label: 'Calendar',
    },
    {
        path: '/jft',
        label: 'Just For Today',
    },
    {
        path: '/service-at-zior',
        label: 'Service at ZIOR',
    },
    {
        path: '/helpful-links',
        label: 'Helpful Links',
    },
    {
        path: '/seventh-tradition',
        label: '7th Tradition',
    },
];

const NavBar = () => {
    return (
        <nav>
            <ul style={classes.list}>
                {routes.map((route) => (
                    <li
                        key={route.label}
                        style={classes.navItem}
                    >
                        <Link
                            style={classes.a}
                            to={route.path}>{route.label}</Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default NavBar;
