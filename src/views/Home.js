import React from 'react';
import theme from '../utils/theme';
import { Link } from 'react-router-dom';
import { getEasternTimeAsLocal } from '../utils/getEasternTimeAsLocal';

const classes = {
    titleContainer: {
        display: 'flex',
        justifyContent: 'center',
    },
    linksContainer: {
        display: 'flex',
        width: '100%',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
};

const Home = () => {
    return (
        <div style={theme.contentContainer}>
            <div style={classes.titleContainer}>
                <h1>Welcome to Zoom In On Recovery!</h1>
            </div>
            <p>
                We are an LGBTQIA+ meeting of Narcotics Anonymous, but as the Third Tradition states, the only requirement for membership is a desire to stop using - so ALL are
                welcome here. We meet every day from 7:00 PM to 8:00 PM Eastern Time, which is {getEasternTimeAsLocal('19:00')} to {getEasternTimeAsLocal('20:00')} in your
                local time zone. You may join our meeting by clicking the link below or scanning the QR code on your phone.
            </p>
            <section style={classes.linksContainer}>
                <a
                    href='https://us02web.zoom.us/j/75907342333?pwd=MFd0OGo5dzBSbHIzY1ZORUw5Y09xZz09'
                    target='_blank'
                    rel='noreferrer'
                >
                    Join Zoom Meeting
                </a>
                <img
                    src='/zoomQrCode'
                    alt='Zoom QR code'
                />
            </section>
            <p>Also, please join us 15 minutes before the meeting for fellowship (we call it the 'parking lot') and to make sure you can get in. You can stay after the meeting to let us get to know you as well. We look forward to seeing you there!</p>
            <p>
                The format of the meeting is a book study. We read the Just for Today daily meditation and then our speaker shares for 10-15 minutes on the reading. After that we
                have open shares until 10 minutes before the end of the meeting, at which time we call for a burning desire. We have celebrate anniversaries on the last day of the month,
                and our business meetings are held every 1st and 3rd Monday an hour before the meeting. Check out <Link to='/calendar'>our calendar</Link> for more information.
            </p>
            <p>We hope you will join us and find the love and support that we have found in this fellowship. And above all,</p>
            <p> KEEP COMING BACK!</p>
        </div>
    );
};

export default Home;
