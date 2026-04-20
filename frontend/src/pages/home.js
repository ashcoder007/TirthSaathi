// Home.js
import React from 'react';
import CustomNavbar from '../components/CustomNavbar';
import HeroCarousel from '../components/HeroCarousel';
import Assistcards from '../components/AssistCards';
import AssistDescription from "../components/AssistDescription";

const Home = () => {
  return (
    <>
      <CustomNavbar />
      <main>
        <HeroCarousel />
        <Assistcards />
        <AssistDescription />
        {/* Later sections: features, benefits, footer etc. */}
      </main>
      <footer style={{padding:'24px 0', textAlign:'center', color:'#8a6b63'}}>
        © {new Date().getFullYear()} TirthSaathi. All rights reserved.
      </footer>
    </>
  );
};

export default Home;
