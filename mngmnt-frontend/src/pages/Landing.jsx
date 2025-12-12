import React from "react";
import { Link } from "react-router-dom";
import ChatWidget from "../components/chatbot/ChatWidget";
import "./Landing.css";

const Landing = () => {
  return (
    <div className="landing">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-logo">
          <img src="/hubly-logo.png" alt="Hubly" />
          <span>Hubly</span>
        </div>

        <nav className="landing-nav">
          <Link to="/login" className="landing-nav-link">
            Login
          </Link>
          <Link to="/signup" className="landing-btn-primary">
            Sign up
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        {/* Hero content */}
        <div className="landing-hero-content">
          <h1>Grow Your Business Faster with Hubly CRM</h1>
          <p>
            Manage leads, automate workflows, and close deals effortlessly—all
            in one powerful platform.
          </p>

          <div className="landing-hero-actions">
            <Link to="/signup" className="landing-btn-primary landing-btn-lg">
              Get started
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>

            <button className="landing-btn-secondary">
              <img src="/watch-icon.svg" alt="" />
            </button>
          </div>
        </div>

        {/* Hero visuals */}
        <div className="landing-hero-image">
          <img
            src="/hero-icon.svg"
            alt="Business meeting"
            className="landing-hero-main"
          />

          <div className="landing-hero-card landing-hero-notification">
            <img src="/jerry.svg" alt="" className="notification-avatar" />
            <div>
              <span className="notification-name">Jerry Calzoni</span>
              <span className="notification-action"> joined </span>
              <span className="notification-highlight">Swimming</span>
              <p className="notification-time">Class - 9:22 AM</p>
            </div>
          </div>

          <div className="landing-hero-card landing-hero-calendar">
            <img src="/calendar-widget.png" alt="Calendar" />
          </div>

          <div className="landing-hero-card landing-hero-sales">
            <img src="/sales-card.png" alt="Net Sales" />
          </div>
        </div>
      </section>

      {/* Logos */}
      <section className="landing-logos">
        <div className="landing-logos-container">
          <img src="/adobe.svg" alt="" />
          <img src="/elastic.svg" alt="" />
          <img src="/opendoor.svg" alt="" />
          <img src="/airtable.svg" alt="" />
          <img src="/elastic.svg" alt="" />
          <img src="/framer.svg" alt="" />
        </div>
      </section>

      {/* CRM section */}
      <section className="landing-section">
        <div className="landing-section-center">
          <h2>At its core, Hubly is a robust CRM solution.</h2>
          <p>
            Hubly helps businesses streamline customer interactions, track
            leads, and automate tasks—saving you time and maximizing revenue.
            Whether you're a startup or an enterprise, Hubly adapts to your
            needs, giving you the tools to scale efficiently.
          </p>
        </div>
      </section>

      {/* Platform */}
      <section className="landing-platform">
        <span className="landing-platform-content">
          <h3 className="landing-platform-title">
            MULTIPLE PLATFORMS TOGETHER!
          </h3>
          <p className="landing-platform-desc">
            Email communication is a breeze with our fully integrated, drag
            &amp; drop email builder.
          </p>

          <div className="landing-platform-feature">
            <h4>CLOSE</h4>
            <p>
              Capture leads using our landing pages, surveys, forms, calendars,
              inbound phone system &amp; more!
            </p>
          </div>

          <div className="landing-platform-feature">
            <h4>NURTURE</h4>
            <p>
              Capture leads using our landing pages, surveys, forms, calendars,
              inbound phone system &amp; more.
            </p>
          </div>
        </span>

        <span className="landing-platform-image">
          <img src="/funnel-icons.svg" alt="" className="funnel-icons" />
          <img src="/funnel-icon.svg" alt="" className="funnel-icon" />
        </span>
      </section>

      {/* Pricing */}
      <section className="landing-pricing">
        <div className="landing-section-center">
          <h2>We have plans for everyone!</h2>
          <p>
            We started with a strong foundation, then simply built all of the
            sales and marketing tools ALL businesses need under one platform.
          </p>
        </div>

        <div className="landing-pricing-cards">
          {/* Card: Starter */}
          <div className="landing-pricing-card">
            <h3>STARTER</h3>
            <p>
              Best for local businesses needing to improve their online
              reputation.
            </p>

            <div className="landing-price">
              <span className="landing-price-amount">$199</span>
              <span className="landing-price-period">/monthly</span>
            </div>

            <p className="landing-price-label">What's included</p>
            <ul className="landing-features">
              <li>
                <span>✓</span> Unlimited Users
              </li>
              <li>
                <span>✓</span> GMB Messaging
              </li>
              <li>
                <span>✓</span> Reputation Management
              </li>
              <li>
                <span>✓</span> GMB Call Tracking
              </li>
              <li>
                <span>✓</span> 24/7 Award Winning Support
              </li>
            </ul>

            <button className="landing-btn-outline">SIGN UP FOR STARTER</button>
          </div>

          {/* Card: Grow */}
          <div className="landing-pricing-card">
            <h3>GROW</h3>
            <p>
              Best for all businesses that want to take full control of their
              marketing automation and track their leads, click to close.
            </p>

            <div className="landing-price">
              <span className="landing-price-amount">$399</span>
              <span className="landing-price-period">/monthly</span>
            </div>

            <p className="landing-price-label">What's included</p>
            <ul className="landing-features">
              <li>
                <span>✓</span> Pipeline Management
              </li>
              <li>
                <span>✓</span> Marketing Automation Campaigns
              </li>
              <li>
                <span>✓</span> Live Call Transfer
              </li>
              <li>
                <span>✓</span> GMB Messaging
              </li>
              <li>
                <span>✓</span> Embed-able Form Builder
              </li>
              <li>
                <span>✓</span> Reputation Management
              </li>
              <li>
                <span>✓</span> 24/7 Award Winning Support
              </li>
              <br />
            </ul>

            <button className="landing-btn-outline">SIGN UP FOR STARTER</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-content">
          {/* Brand */}
          <div className="landing-footer-brand">
            <div className="landing-logo">
              <img src="/hubly-logo.png" alt="Hubly" />
              <span>Hubly</span>
            </div>
          </div>

          {/* Links */}
          <div className="landing-footer-links">
            <div className="landing-footer-col">
              <h4>Product</h4>
              <a href="#">Universal checkout</a>
              <a href="#">Payment workflows</a>
              <a href="#">Observability</a>
              <a href="#">UpliftAI</a>
              <a href="#">Apps & integrations</a>
            </div>

            <div className="landing-footer-col">
              <h4>Why Primer</h4>
              <a href="#">Expand to new markets</a>
              <a href="#">Boost payment success</a>
              <a href="#">Improve conversion rates</a>
              <a href="#">Reduce payments fraud</a>
              <a href="#">Recover revenue</a>
            </div>

            <div className="landing-footer-col">
              <h4>Developers</h4>
              <a href="#">Primer Docs</a>
              <a href="#">API Reference</a>
              <a href="#">Payment methods guide</a>
              <a href="#">Service status</a>
              <a href="#">Community</a>
            </div>

            <div className="landing-footer-col">
              <h4>Resources</h4>
              <a href="#">Blog</a>
              <a href="#">Success stories</a>
              <a href="#">News room</a>
              <a href="#">Terms</a>
              <a href="#">Privacy</a>
            </div>

            <div className="landing-footer-col">
              <h4>Company</h4>
              <a href="#">Careers</a>
            </div>
          </div>
        </div>

        {/* Socials */}
        <div className="landing-footer-bottom">
          <div className="landing-footer-social">
            <a href="#" aria-label="Email">
              <img src="/msgFooter.svg" alt="" />
            </a>
            <a href="#" aria-label="LinkedIn">
              <img src="/linkedin.svg" alt="" />
            </a>
            <a href="#" aria-label="Twitter">
              <img src="/twitter.png" alt="" />
            </a>
            <a href="#" aria-label="YouTube">
              <img src="/youtube.svg" alt="" />
            </a>
            <a href="#" aria-label="Discord">
              <img src="/discord.svg" alt="" />
            </a>
            <a href="#" aria-label="Figma">
              <img src="/figma.svg" alt="" />
            </a>
            <a href="#" aria-label="Instagram">
              <img src="/insta.svg" alt="" />
            </a>
          </div>
        </div>
      </footer>

      {/* Chat widget */}
      <ChatWidget />
    </div>
  );
};

export default Landing;