import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import Carousel from 'react-material-ui-carousel';
import { Paper } from '@mui/material';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import { toggleFullscreen, setFullScreenHandle } from '../store/fullscreenReducer';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';

const classes = {
    slideContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
    },
    slide: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
    },
};

const SlideDeck = ({ slides, isFullscreen, toggleFullscreen, setFullScreenHandle }) => {
    const handle = useFullScreenHandle();

    useEffect(() => {
        setFullScreenHandle(handle);
    }, [handle]);

    const handleFullScreenChange = () => {
        if (!document.fullscreenElement) {
            toggleFullscreen(false);
        } else {
            toggleFullscreen(true);
        }
    };

    return (
        <div style={classes.slideContainer}>
            <FullScreen
                handle={handle}
                onChange={handleFullScreenChange}
            >
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
            </FullScreen>
        </div>
    );
};

function Item({ item }) {
    return (
        <Paper style={classes.slide}>
            <img
                src={item.image}
                alt={item.alt}
            />
        </Paper>
    );
}

const mapState = (state) => {
    return {
        isFullscreen: state.fullscreen.isFullscreen,
    };
};

const mapDispatch = (dispatch) => {
    return {
        toggleFullscreen: (fullscreenState) => dispatch(toggleFullscreen(fullscreenState)),
        setFullScreenHandle: (handle) => dispatch(setFullScreenHandle(handle)),
    };
};

export default connect(mapState, mapDispatch)(SlideDeck);
