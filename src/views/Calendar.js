import React from "react";

const Calendar = () => {
  return (
    <div>
      <h1>Calendar</h1>
      <p>
        This is the Calendar section.
      </p>
      <iframe src="https://calendar.google.com/calendar/embed?src=45jo7qhqn42igcuumu9tqfu6ak%40group.calendar.google.com&ctz=America%2FNew_York" style={{width:"80%", height:600 }} scrolling="no"></iframe>
    </div>
  );
}

export default Calendar;