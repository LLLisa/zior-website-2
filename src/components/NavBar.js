import React from "react";

const classes = {
  list: {
    display: "flex",
    justifyContent: "center",
    listStyle: "none",
    padding: 0,
    backgroundColor: 'lightblue',
  },
  navItem: {
    margin: "0 1rem",

  },
};

const routes = [
    {
        path: '/#/about',
        label: 'About',
    },
    {
        path: '/#/calendar',
        label: 'Calendar',
    },
    {
        path: '/#/jft',
        label: 'JFT',
    },
    {
        path: '/#/for-the-newcomer',
        label: 'For the Newcomer',
    },
    {
        path: '/#/service-at-zior',
        label: 'Service at ZIOR',
    },
    {
        path: '/#/helpful-links',
        label: 'Helpful Links',
    },
];

const NavBar = () => {
  return (
    <nav>
      <ul style={classes.list}>
        {routes.map((route) => <li key={route.label} style={classes.navItem}><a href={route.path}>{route.label}</a></li>)}
      </ul>
    </nav>
  );
};

export default NavBar;