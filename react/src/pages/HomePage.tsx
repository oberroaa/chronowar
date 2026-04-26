import React, { useState } from 'react';
import styled from 'styled-components';
import { raceOptions, type RaceType } from '../types/gameData';

interface HomePageProps {
  onPlay: (race: RaceType) => void;
}

// Componente principal de la página de inicio
const HomePage: React.FC<HomePageProps> = ({ onPlay }) => {
  // Estado para controlar si el menú móvil está abierto
  const [menuOpen, setMenuOpen] = useState(false);
  // Estado para almacenar la raza seleccionada
  const [selectedRace, setSelectedRace] = useState<RaceType>('valdari');

  // Función que se ejecuta al hacer clic en el botón "Jugar ahora"
  const handlePlayNow = () => {
    console.log("Raza seleccionada:", selectedRace);
    onPlay(selectedRace);
  };

  return (
    <HomePageContainer>
      {/* Header con logo y navegación */}
      <Header>
        <HeaderContainer>
          <Logo>
            <img src="./images/logo.png" alt="ChronoWar" />
          </Logo>
          
          {/* Botón para abrir/cerrar el menú en móviles */}
          <MobileMenuButton 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            ☰
          </MobileMenuButton>
          
          {/* Lista de navegación - se muestra/oculta en móviles */}
          <NavList $isMenuOpen={menuOpen}>
            <NavItem><NavLink href="#">Inicio</NavLink></NavItem>
            <NavItem><NavLink href="#">Juego</NavLink></NavItem>
            <NavItem><NavLink href="#">Comunidad</NavLink></NavItem>
            <NavItem><NavLink href="#">Ayuda</NavLink></NavItem>
            <NavItem><NavLink href="#">Tienda</NavLink></NavItem>
          </NavList>
          
          {/* Botones de autenticación - se muestran/ocultan en móviles */}
          <AuthButtonsContainer $isMenuOpen={menuOpen}>
            <AuthButton>Iniciar sesión</AuthButton>
            <AuthButton>Registrarse</AuthButton>
          </AuthButtonsContainer>
        </HeaderContainer>
      </Header>

      {/* Sección principal con imagen de fondo */}
      <HeroSection>
        <HeroContent>
          <HeroTitle>Forja tu imperio</HeroTitle>
          {/* Selector de raza */}
          <label htmlFor="race-select">Elige tu raza:</label>
          <RaceSelect 
            id="race-select" 
            name="race"
            value={selectedRace}
            onChange={(e) => setSelectedRace(e.target.value as RaceType)}
          >
            {raceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </RaceSelect>
          {/* Botón para comenzar a jugar */}
          <PlayNowButton onClick={handlePlayNow}>
            Jugar ahora
          </PlayNowButton>
        </HeroContent>
      </HeroSection>

      {/* Sección con información sobre las razas disponibles */}
      <GameInfoSection>
        <InfoCardsContainer>
          {raceOptions.map(race => (
            <InfoCard key={race.value}>
              <CardTitle>{race.label.split('(')[0].trim()}</CardTitle>
              <CardDescription>{race.desc}</CardDescription>
            </InfoCard>
          ))}
        </InfoCardsContainer>
      </GameInfoSection>

      {/* Pie de página con enlaces y información */}
      <Footer>
        <FooterLinks>
          <LinkColumn>
            <h4>Juego</h4>
            <ul>
              <li><a href="#">Descripción</a></li>
              <li><a href="#">Reglas</a></li>
              <li><a href="#">Versión móvil</a></li>
            </ul>
          </LinkColumn>
          
          <LinkColumn>
            <h4>Comunidad</h4>
            <ul>
              <li><a href="#">Foro</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Soporte</a></li>
            </ul>
          </LinkColumn>
          
          <LinkColumn>
            <h4>Empresa</h4>
            <ul>
              <li><a href="#">Sobre nosotros</a></li>
              <li><a href="#">Trabajos</a></li>
              <li><a href="#">Contacto</a></li>
            </ul>
          </LinkColumn>
        </FooterLinks>
        
        <FooterBottom>
          <p>© 2025 ChronoWar Games. Todos los derechos reservados.</p>
          <SocialLinks>
            <SocialLink href="#"><span className="icon-facebook"></span></SocialLink>
            <SocialLink href="#"><span className="icon-twitter"></span></SocialLink>
            <SocialLink href="#"><span className="icon-youtube"></span></SocialLink>
          </SocialLinks>
        </FooterBottom>
      </Footer>
    </HomePageContainer>
  );
};

export default HomePage;

// Estilos con styled-components

// Contenedor principal de la página
const HomePageContainer = styled.div`
  background-color: #000;
  color: #fff;
  font-family: Arial, Helvetica, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

// Encabezado de la página
const Header = styled.header`
  background-color: #111;
  border-bottom: 1px solid #333;
  padding: 10px 0;
`;

// Contenedor interno del header
const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

// Estilos para el logo
const Logo = styled.div`
  img {
    height: 50px;
  }
`;

// Props para el menú de navegación
interface NavListProps {
  $isMenuOpen: boolean;
}

// Lista de navegación
const NavList = styled.ul<NavListProps>`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    display: ${({ $isMenuOpen }) => ($isMenuOpen ? 'flex' : 'none')};
    width: 100%;
    margin-top: 20px;
  }
`;

// Elementos de la lista de navegación
const NavItem = styled.li`
  margin: 0 10px;
  
  @media (max-width: 768px) {
    margin: 5px 0;
  }
`;

// Enlaces de navegación
const NavLink = styled.a`
  color: #FFAC04;
  text-decoration: none;
  font-size: 14px;
  text-transform: uppercase;
  padding: 5px 10px;
  border: 1px solid transparent;
  
  &:hover {
    border: 1px solid #FFAC04;
    background-color: #222;
  }
`;

// Props para los botones de autenticación
interface AuthButtonsProps {
  $isMenuOpen: boolean;
}

// Contenedor de botones de autenticación
const AuthButtonsContainer = styled.div<AuthButtonsProps>`
  display: flex;
  gap: 10px;
  
  @media (max-width: 768px) {
    display: ${({ $isMenuOpen }) => ($isMenuOpen ? 'flex' : 'none')};
    flex-direction: row;
    justify-content: center;
    width: 100%;
    margin-top: 15px;
  }
`;

// Botones de autenticación
const AuthButton = styled.button`
  background-color: transparent;
  color: #FFAC04;
  border: 1px solid #FFAC04;
  padding: 5px 15px;
  font-size: 14px;
  cursor: pointer;
  text-transform: uppercase;
  
  &:hover {
    background-color: #FFAC04;
    color: #000;
  }
`;

// Botón de menú móvil
const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: #FFAC04;
  font-size: 24px;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

// Sección principal con imagen de fondo
const HeroSection = styled.section`
  background: url('/images/chronowar.png') no-repeat center center;
  background-size: 100% 100%;
  background-color: #000;
  padding: 100px 0;
  text-align: center;
  color: white;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
`;

// Contenido de la sección principal
const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
  border: 1px solid #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -100px;
`;

// Título principal
const HeroTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: #FFAC04;
  text-transform: uppercase;
`;

// Selector de raza
const RaceSelect = styled.select`
  padding: 8px 15px;
  border-radius: 5px;
  margin: 10px 0;
  background-color: #111;
  color: #FFAC04;
  border: 1px solid #333;
  font-size: 16px;
  width: 80%;
  max-width: 300px;
`;

// Botón principal de jugar
const PlayNowButton = styled.button`
  background: #FFAC04;
  color: #000;
  border: none;
  padding: 12px 30px;
  font-size: 1.2rem;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.3s ease;
  font-weight: bold;
  text-transform: uppercase;

  &:hover {
    background: #ffc107;
    transform: scale(1.05);
  }
`;

// Sección de información del juego
const GameInfoSection = styled.section`
  background-color: #111;
  padding: 40px 20px;
`;

// Contenedor de tarjetas de información
const InfoCardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Tarjetas individuales de información
const InfoCard = styled.div`
  background-color: #222;
  border: 1px solid #333;
  padding: 20px;
  text-align: center;
`;

// Título de las tarjetas
const CardTitle = styled.h3`
  color: #FFAC04;
  margin: 15px 0;
  font-size: 18px;
`;

// Descripción de las tarjetas
const CardDescription = styled.p`
  font-size: 14px;
  line-height: 1.5;
`;

// Pie de página
const Footer = styled.footer`
  background-color: #111;
  border-top: 1px solid #333;
  padding: 30px 20px 20px;
`;

// Enlaces del footer
const FooterLinks = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
`;

// Columnas de enlaces del footer
const LinkColumn = styled.div`
  h4 {
    color: #FFAC04;
    font-size: 16px;
    margin-bottom: 15px;
    text-transform: uppercase;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin-bottom: 8px;
  }

  a {
    color: #ccc;
    text-decoration: none;
    font-size: 14px;
    
    &:hover {
      color: #FFAC04;
    }
  }
`;

// Parte inferior del footer
const FooterBottom = styled.div`
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #333;
  font-size: 12px;
`;

// Enlaces a redes sociales
const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 15px;
`;

// Iconos de redes sociales
const SocialLink = styled.a`
  color: #FFAC04;
  font-size: 20px;
`;