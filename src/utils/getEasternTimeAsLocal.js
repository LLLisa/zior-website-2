import moment from 'moment-timezone';
import 'moment-timezone';

export const getEasternTimeAsLocal = (milTime) => {
    const easternTime = moment.tz(milTime, 'HH:mm', 'America/New_York');
    const localTime = easternTime.clone().tz(moment.tz.guess());
    return localTime.format('h:mm A');
};
