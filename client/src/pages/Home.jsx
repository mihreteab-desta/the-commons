import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getItems } from '../services/api';
import { useAuth } from '../context/AuthContext';

const fallbackItems = [
  {
    id: 1,
    title: 'Cordless Drill Set',
    category_name: 'Power Tools',
    owner_full_name: 'Sara Tadesse',
    owner_neighborhood: 'Kirkos District',
    rental_price_per_day: 5,
    is_available: true,
  },
  {
    id: 2,
    title: 'Camping Tent, 4-Person',
    category_name: 'Outdoor Gear',
    owner_full_name: 'Mike Abebe',
    owner_neighborhood: 'Arada District',
    rental_price_per_day: 0,
    is_available: true,
  },
];

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [featuredItems, setFeaturedItems] = useState(fallbackItems);

  useEffect(() => {
    getItems()
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setFeaturedItems(res.data.slice(0, 2));
        }
      })
      .catch(() => setFeaturedItems(fallbackItems));
  }, []);

  useEffect(() => {
    const revealItems = document.querySelectorAll('.scroll-reveal');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      revealItems.forEach((item) => item.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.delay || '0';
            entry.target.style.transitionDelay = `${delay}ms`;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -64px 0px' }
    );

    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const formatPrice = (price) => {
    const amount = parseFloat(price || 0);
    return amount > 0 ? `$${amount.toFixed(2)} per day` : 'Free to borrow';
  };

  const recentItems = featuredItems.length >= 2
    ? featuredItems.slice(0, 2)
    : featuredItems.length === 1
      ? [featuredItems[0], featuredItems[0]]
      : fallbackItems;

  const getCardLabel = (item) => item.category_name || item.title || 'Shared Item';

  const categoryRows = [
    ['Power', 'Tools', 'Drills, saws, ladders, repair gear', '34 items nearby'],
    ['Out', 'door Gear', 'Tents, chairs, coolers, yard tools', '21 items nearby'],
    ['Home', 'Essentials', 'Kitchen gear, cleaning tools, project supplies', '18 items nearby'],
  ];

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="landing-nav scroll-reveal">
          <div className="landing-brand">
            
            
          </div>
          
          <div className="landing-nav-right">
            
           
          </div>
        </div>

        <div className="landing-hero-body">
          <div className="scroll-reveal" data-delay="80">
            <h1>
              Buy less,
              <br />
              Borrow smarter,
              <br />
              <em>Stay local.</em>
            </h1>
            <div className="landing-dots" aria-hidden="true">
              <div className="landing-dot">&lsaquo;</div>
              <div className="landing-dot">●</div>
              <div className="landing-dot">&rsaquo;</div>
            </div>
          </div>

          <div className="landing-hero-right scroll-reveal" data-delay="180">
            <p>
              The Commons helps peoples lend tools, outdoor gear, kitchen equipment,
              and everyday items without every household needing to buy the same thing.
            </p>
            <div className="landing-btn-row">
              <Link to={isAuthenticated ? '/items/new' : '/register'} className="landing-pill-btn solid">
                List an item
              </Link>
              <Link to="/items" className="landing-pill-btn">
                Browse items
              </Link>
            </div>
            <div className="landing-stats-row">
              <div className="landing-stat-big">
                <div className="num">100+</div>
                <div className="label">Useful items shared by peoples</div>
              </div>
              <div className="landing-stat-big">
                <div className="num">$0</div>
                <div className="label">Platform fees for local lending</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-panel-wrap scroll-reveal" data-delay="120">
        <div className="landing-panel">
          <div className="landing-panel-tabs">
            <div className="active">Trusted Peoples</div>
            <div>Free To List</div>
            <div>Fast Pickups</div>
          </div>
          <div className="landing-panel-content">
            <div>
              <div className="landing-avatars">
                <div className="av">S</div>
                <div className="av">K</div>
              </div>
              <div className="landing-avatars-label">Members of The Commons</div>
            </div>
            <div>
              <h3>
                We help peoples put idle tools, outdoor gear, and household essentials
                back to use through simple requests, local handoffs, and honest reviews.
              </h3>
              <Link to="/items" className="landing-small-btn">How it works</Link>
            </div>
          </div>
          <div className="landing-badge-row">
            <div className="landing-badge"><div className="landing-badge-circle on">4.8</div><p>Average trust score</p></div>
            <div className="landing-badge"><div className="landing-badge-circle">TC</div><p>Community lending hub</p></div>
            <div className="landing-badge"><div className="landing-badge-circle">98%</div><p>Successful handoffs</p></div>
            <div className="landing-badge"><div className="landing-badge-circle">$0</div><p>No platform fees</p></div>
          </div>
        </div>
      </section>

      <section className="landing-section scroll-reveal" data-delay="80">
        <div className="landing-section-head">
          <h2>Recent <em>Items</em></h2>
          <Link to="/items" className="landing-see-all">Browse All Items</Link>
        </div>
        <div className="landing-listings-grid">
          {recentItems.map((item, index) => (
            <div key={`${item.id || item.title}-${index}`}>
              <Link to={`/items/${item.id}`} className={`landing-listing-card card-${index === 0 ? 'a' : 'b'}`}>
                <div className="tag">{getCardLabel(item)}</div>
                <div className="status-dot">{item.is_available ? 'AVAIL' : 'RSVD'}</div>
                <div className="big-word">{getCardLabel(item)}</div>
                <p className="card-note">
                  Ready nearby for quick neighborhood pickup.
                </p>
              </Link>
              <div className="landing-listing-meta">
                <h4>{item.title}</h4>
                <p>{item.owner_neighborhood || 'Nearby'} · {formatPrice(item.rental_price_per_day)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-categories scroll-reveal" data-delay="80">
        <div className="landing-cat-inner">
          <div className="landing-cat-head">
            <h2>Browse <em>Categories</em></h2>
            
          </div>
          <div className="landing-cat-list">
            {categoryRows.map(([start, end, description, count], index) => (
              <Link to="/items" className="landing-cat-row scroll-reveal" data-delay={index * 90} key={`${start}${end}`}>
                <div className="name">{start}<em>{end}</em></div>
                <div className="meta">{description}<br />{count}</div>
                <div className="arrow">↗</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      
    </div>
  );
};

export default Home;
