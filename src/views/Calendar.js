import React from "react";

const classes = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
};

const Calendar = () => {
  return (
    <div style={classes.container}>
      <iframe src="https://calendar.google.com/calendar/embed?src=0994f22fd2f97cedaa5213db3b2b8ab0f2325b0ec366356ec8aefc4dfd4b8f9f%40group.calendar.google.com&ctz=America%2FNew_York" style={{width:"80%", height:600 }} scrolling="no"></iframe>
    </div>
  );
}

export default Calendar;