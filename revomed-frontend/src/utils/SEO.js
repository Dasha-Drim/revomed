import {Helmet} from 'react-helmet';

let SEO = ({ pageProps }) => {
  return (
    <Helmet encodeSpecialCharacters={true} onChangeClientState={(newState, addedTags, removedTags) => console.log(newState, addedTags, removedTags)}>
      <title>{pageProps.title}</title>
      <meta property="og:title" content={pageProps.title} />
      <meta property="og:image" content={pageProps.thumbnail} />
      <meta property="og:url" content={pageProps.url} />
    </Helmet>    
  )
}

export default SEO;