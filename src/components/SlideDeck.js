import React from 'react';
import Carousel from 'react-material-ui-carousel';
import { Paper } from '@mui/material';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';

const classes = {
    slideContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        padding: '1rem',
    },
    slide: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
};

const SlideDeck = ({ slides }) => {
    return (
        <div style={classes.slideContainer}>
                <Carousel
                    autoPlay={false}
                    animation='slide'
                    indicators={false}
                    navButtonsAlwaysVisible={true}
                    NextIcon={<ArrowCircleRightIcon />}
                    PrevIcon={<ArrowCircleLeftIcon />}
                >
                    {slides.map((item, i) => (
                        <Item
                            key={i}
                            item={item}
                        />
                    ))}
                </Carousel>
        </div>
    );
};

function Item({ item, isFullscreen }) {
    return (
        <Paper style={isFullscreen ? classes.fullscreenSlide : classes.slide}>
            <img
                src={item.image}
                alt={item.alt}
                style={{height: '80vh'}}
            />
        </Paper>
    );
}

export default SlideDeck;
