import React from 'react';
import Carousel from 'react-material-ui-carousel'
import { Paper, Button } from '@mui/material'
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import { FullScreen, useFullScreenHandle } from "react-full-screen";

function SlideDeck(props)
{
    const handle = useFullScreenHandle();
    var items = [
        {
            name: "Random Name #1",
            description: "Probably the most random thing you have ever seen!"
        },
        {
            name: "Random Name #2",
            description: "Hello World!"
        }
    ]

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
                        items.map( (item, i) => <Item key={i} item={item} /> )
                    }
                </Carousel>
            </FullScreen>
            <button onClick={handle.enter}>Full Screen</button>
        </div>
    )
}

function Item(props)
{
    return (
        <Paper>
            <h2>{props.item.name}</h2>
            <p>{props.item.description}</p>

            <Button className="CheckButton">
                Check it out!
            </Button>
        </Paper>
    )
}

export default SlideDeck;