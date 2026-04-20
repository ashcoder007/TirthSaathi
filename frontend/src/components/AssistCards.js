import React, { useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import TranslatorDropdown from './TranslatorDropdown';
import './AssistCards.css';

const cards = [
  { title: 'AI Guide', icon: '/assests/icons/ai.png', link: '/ai-guide-chat' },
  { title: 'Plan Yatra', icon: '/assests/icons/plan.png', link: '/trip-planner' },
  { title: 'Translator', icon: '/assests/icons/translate.png' },
  { title: 'Elderly Care', icon: '/assests/icons/elder.png', link: '/elder-care' },
  { title: 'Maps', icon: '/assests/icons/maps.png', link: '/maps' },
  { title: 'Book Stay', icon: '/assests/icons/stay.png', link: '/book-stay' },
  { title: 'Emergency', icon: '/assests/icons/emergency.png', link: '/emergencyPage' },
];

const AssistCards = () => {
  const [showTranslator, setShowTranslator] = useState(false);

  return (
    <section id="assist" className="assist-section">
      <div className="container-narrow text-center">
        <h3 className="assist-title">How We Assist You</h3>

        <Row className="g-3 justify-content-center">
          {cards.map((c, idx) => (
            <Col key={idx} xs={6} sm={4} md={2}>

              {c.title === "Translator" ? (
                <Card
                  className="assist-card clickable-card"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowTranslator(!showTranslator)}
                >
                  <Card.Body>
                    <img
                      src={`${process.env.PUBLIC_URL}${c.icon}`}
                      alt={c.title}
                      className="assist-icon"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                    <div className="assist-text">{c.title}</div>
                  </Card.Body>
                </Card>
              ) : c.link ? (
                <Link to={c.link} style={{ textDecoration: "none" }}>
                  <Card className="assist-card clickable-card">
                    <Card.Body>
                      <img
                        src={`${process.env.PUBLIC_URL}${c.icon}`}
                        alt={c.title}
                        className="assist-icon"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                      <div className="assist-text">{c.title}</div>
                    </Card.Body>
                  </Card>
                </Link>
              ) : (
                <Card className="assist-card">
                  <Card.Body>
                    <img
                      src={`${process.env.PUBLIC_URL}${c.icon}`}
                      alt={c.title}
                      className="assist-icon"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                    <div className="assist-text">{c.title}</div>
                  </Card.Body>
                </Card>
              )}

            </Col>
          ))}
        </Row>

        {/* 👇 DROPDOWN APPEARS HERE */}
        {showTranslator && (
          <div style={{ marginTop: "20px" }}>
            <TranslatorDropdown />
          </div>
        )}

      </div>
    </section>
  );
};

export default AssistCards;