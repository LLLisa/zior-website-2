import React from 'react';
import theme from '../utils/theme';

const classes = {
    a: {
        padding: '0.5rem',
    },
};

const links = [
    {
        path: '/daily-script',
        label: 'Daily Script',
    },
    {
        path: '/slide-deck-daily',
        label: 'Slide Deck (daily meeting)',
    },
    {
        path: '/anniversary-script',
        label: 'Anniversary Script',
    },
    {
        path: '/slide-deck-anniversary',
        label: 'Slide Deck (anniversary meeting)',
    },
];

const ServiceAtZior = () => {
    return (
        <div style={theme.contentContainer}>
            <h1>ServiceAtZior</h1>
            <p>
                This is the ServiceAtZior section. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit
                esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <ul>
                {links.map((link) => (
                    <li key={link.label}>
                        <a
                            style={classes.a}
                            href={link.path}
                        >
                            {link.label}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ServiceAtZior;
