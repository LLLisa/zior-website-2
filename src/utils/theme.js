const palette = {
  text: '#333333',
  altText: '#ecf2f9',
  highlight: '#00cccc',
  primaryBG: '#d9e6f2',
  secondaryBG: '#336699',
};

const contentContainer = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100%',
  maxWidth: '800px',
  padding: '1rem 2rem',
  overflowY: 'auto',
  color: palette.text,
};

const slideDeckContainer = {
  height: '100%',
  width: '150dvh',
  overflowX: 'hidden',
}

const theme = {
  palette,
  contentContainer,
  slideDeckContainer,
};

export default theme;