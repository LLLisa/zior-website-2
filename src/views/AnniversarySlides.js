import React from "react"
import SlideDeck from "../components/SlideDeck"
import theme from "../utils/theme"

const slides = [
    {
        image: '/slides/intro.png',
        alt: 'This is the intro screen',
    },
    {
        image: '/slides/who.png',
        alt: 'Who is an addict?',
    },
    {
        image: '/slides/what.png',
        alt: 'What is the NA program?',
    },
    {
        image: '/slides/why.png',
        alt: 'Why are we here?',
    },
    {
        image: '/slides/how1.png',
        alt: 'How it works, part 1',
    },
    {
        image: '/slides/how2.png',
        alt: 'How it works, part 2',
    },
    {
        image: '/slides/7thTradition.png',
        alt: '7th Tradition',
    },
    {
      image: '/slides/countdownStart.png',
      alt: 'Clean time countdown start',
    },
    {
      image: '/slides/multipleYears.png',
      alt: 'Multiple years clean',
    },
    {
      image: '/slides/18Months.png',
      alt: '18 months clean',
    },
    {
      image: '/slides/1Year.png',
      alt: '1 year clean',
    },
    {
      image: '/slides/9Months.png',
      alt: '9 months clean',
    },
    {
      image: '/slides/6Months.png',
      alt: '6 months clean',
    },
    {
      image: '/slides/90Days.png',
      alt: '3 months clean',
    },
    {
      image: '/slides/60Days.png',
      alt: '60 days clean',
    },
    {
      image: '/slides/30Days.png',
      alt: '30 days clean',
    },
    {
      image: '/slides/1Day.png',
      alt: 'Just for today',
    },
    {
      image: '/slides/welcomeHome.png',
      alt: 'Welcome to the family',
    },
];

const AnniversarySlides = () => {
  return (
      <div style={theme.slideDeckContainer}>
          <SlideDeck slides={slides} />
      </div>
  )
}

export default AnniversarySlides
