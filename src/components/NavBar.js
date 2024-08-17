import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import theme from '../utils/theme';

const { palette } = theme;

const classes = {
    list: {
        display: 'flex',
        justifyContent: 'center',
        listStyle: 'none',
        padding: 0,
        backgroundColor: palette.secondaryBG,
    },
    navItem: {
        margin: '0 1rem',
        padding: '0b0.5rem',
        borderRadius: '0.5rem',
        color: palette.altText,
    },
    selected: {
        outline: '1px solid black',
        color: palette.highlight,
    },
    a: {
        color: 'inherit',
        textDecoration: 'none',
        outline: 'none',
    },
    linkText: {
        textAlign: 'center',
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
    const location = useLocation();
    const [selected, setSelected] = React.useState(null);

    useEffect(() => {
        setSelected(location.pathname);
    }, [location]);

    return (
        <nav>
            <ul style={classes.list}>
                {routes.map((route) => (
                    <li
                        key={route.label}
                        style={route.path === selected ? { ...classes.navItem, ...classes.selected } : classes.navItem}
                    >
                        <Link
                            style={classes.a}
                            to={route.path}
                        >
                            <div style={classes.linkText}>{route.label}</div>
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default NavBar;
