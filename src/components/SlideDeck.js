import React from 'react';
import Carousel from 'react-material-ui-carousel'
import { Paper } from '@mui/material'
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import { FullScreen, useFullScreenHandle } from "react-full-screen";

const classes = {
    slide: {
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
};

const SlideDeck = ({ slides }) => {
    const handle = useFullScreenHandle();

    return (
        <div>
            <FullScreen handle={handle}>
                <Carousel
                    autoPlay={false}
                    animation='slide'
                    indicators={false}
                    navButtonsAlwaysVisible={true}
                    NextIcon={<ArrowCircleRightIcon />}
                    PrevIcon={<ArrowCircleLeftIcon />}
                >
                    {
                        slides.map( (item, i) => <Item key={i} item={item} /> )
                    }
                </Carousel>
            </FullScreen>
            <button onClick={handle.enter}>Full Screen</button>
        </div>
    )
}

function Item({ item })
{
    return (
        <Paper style={classes.slide}>
            <img src={item.image} alt={item.alt} />
        </Paper>
    )
}

export default SlideDeck;