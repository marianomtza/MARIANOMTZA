function App() {
  const [loaded, setLoaded] = React.useState(false);
  
  return (
    <>
      {!loaded && <Loader onDone={() => setLoaded(true)} />}
      {loaded && (
        <>
          <Nav audio={null} />
          <Hero audio={null} />
          <Band items={[
            { name: "SEKS", href: "https://www.instagram.com/seks.gratis/" },
            { name: "LUDBOY", href: "https://www.ludboy.com/" },
            { name: "KNOCKOUT", href: "https://www.instagram.com/knockout.fm/" },
            { name: "LA FAMA", href: "https://www.instagram.com/es.lafama/" }
          ]} label="Colectivos" />
          <Stats />
          <Band items={[
            { name: "Spotify" },
            { name: "Hennessy" },
            { name: "Bacardí" },
            { name: "Zacapa" }
          ]} reverse label="Marcas" />
          <Footer audio={null} />
        </>
      )}
      <div className="grain" />
      <div className="vignette" />
      <BlobBG showStars={true} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
