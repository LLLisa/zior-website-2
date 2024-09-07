import React from "react"
import SlideDeck from "../components/SlideDeck"

const slides = [
    {
        image: `/slides/intro.png`,
        alt: 'This is the intro screen',
    },
    {
        image: `/slides/who.png`,
        alt: 'Who is an addict?',
    },
    {
        image: `/slides/what.png`,
        alt: 'What is the NA program?',
    },
    {
        image: `/slides/why.png`,
        alt: 'Why are we here?',
    },
    {
        image: `/slides/how1.png`,
        alt: 'How it works, part 1',
    },
    {
        image: `/slides/how2.png`,
        alt: 'How it works, part 2',
    },
    {
        image: `/slides/7thTradition.png`,
        alt: '7th Tradition',
    },
];

const DailySlides = () => {
  return (
      <div style={{width: '150dvh' }}>
          <SlideDeck slides={slides} />
      </div>
  )
}

export default DailySlides
