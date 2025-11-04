"use client";

import { useEffect, useMemo, useState } from "react";

type AgentId = "rich" | "business";

type Flight = {
  id: string;
  airline: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  duration: string;
  cabin: string;
  price: number;
  aircraft: string;
  perks: string[];
  seatsRemaining: number;
};

type Hotel = {
  id: string;
  name: string;
  city: string;
  vibe: string;
  nightlyRate: number;
  rating: number;
  distanceToEvent: string;
  highlights: string[];
  suitesAvailable: string[];
};

type AgentProfile = {
  id: AgentId;
  displayName: string;
  role: string;
  persona: string;
  focus: string;
};

type AgentState = {
  flights: string[];
  hotels: string[];
  notes: string;
};

type MemoryEvent = {
  id: string;
  agentId: AgentId;
  timestamp: number;
  summary: string;
  detail?: string;
};

const AGENT_STORAGE_KEY = "travel_agents_state_v1";
const TIMELINE_STORAGE_KEY = "travel_agents_timeline_v1";

const agentProfiles: Record<AgentId, AgentProfile> = {
  rich: {
    id: "rich",
    displayName: "Ava Sinclair",
    role: "Ultra-High-Net-Worth Strategist",
    persona: "Designs indulgent, seamless experiences for billionaires with an eye for privacy and prestige.",
    focus: "Prioritises private suites, on-board exclusivity, and couture concierge tie-ins."
  },
  business: {
    id: "business",
    displayName: "Marcus Reed",
    role: "Executive Mobility Director",
    persona: "Optimises complex itineraries for C-suite teams balancing productivity with recovery.",
    focus: "Locks-in flexible corporate fares, loyalty perks, and meeting-ready hotel suites."
  }
};

const flights: Flight[] = [
  {
    id: "SQ221",
    airline: "Singapore Airlines",
    origin: "New York (JFK)",
    destination: "Singapore (SIN)",
    departure: "Tue · 18 Jun · 22:45",
    arrival: "Thu · 20 Jun · 06:15",
    duration: "18h 30m",
    cabin: "Suites",
    price: 10850,
    aircraft: "Airbus A380",
    perks: ["Private double suite", "Book the Cook menu", "Lalique bedding kit"],
    seatsRemaining: 2
  },
  {
    id: "CX805",
    airline: "Cathay Pacific",
    origin: "Los Angeles (LAX)",
    destination: "Hong Kong (HKG)",
    departure: "Fri · 5 Jul · 00:55",
    arrival: "Sat · 6 Jul · 06:45",
    duration: "15h 50m",
    cabin: "First",
    price: 8890,
    aircraft: "Boeing 777-300ER",
    perks: ["Caviar tasting course", "Private wellness suite in The Wing", "On-board pajamas"],
    seatsRemaining: 3
  },
  {
    id: "LH721",
    airline: "Lufthansa",
    origin: "Shanghai (PVG)",
    destination: "Frankfurt (FRA)",
    departure: "Wed · 26 Jun · 13:15",
    arrival: "Wed · 26 Jun · 19:15",
    duration: "12h 00m",
    cabin: "First",
    price: 7450,
    aircraft: "Boeing 747-8",
    perks: ["Private First Class Terminal access", "Dedicated personal assistant", "Caviar service"],
    seatsRemaining: 1
  },
  {
    id: "QR900",
    airline: "Qatar Airways",
    origin: "Doha (DOH)",
    destination: "Sydney (SYD)",
    departure: "Sun · 14 Jul · 20:10",
    arrival: "Mon · 15 Jul · 17:35",
    duration: "15h 25m",
    cabin: "Qsuite Business",
    price: 5120,
    aircraft: "Airbus A350-1000",
    perks: ["Quad-suite meeting pod", "Brics amenity kit", "Dine-on-demand"],
    seatsRemaining: 6
  }
];

const hotels: Hotel[] = [
  {
    id: "capella-singapore",
    name: "Capella Singapore",
    city: "Sentosa Island",
    vibe: "Private colonial estate with rainforest seclusion",
    nightlyRate: 1650,
    rating: 5,
    distanceToEvent: "7 minutes to Marina Bay helipad",
    highlights: ["Dedicated personal assistant", "In-villa plunge pools", "Chef's table degustation"],
    suitesAvailable: ["Constellation Suite", "Colonial Manor", "Capella Manor"]
  },
  {
    id: "rosewood-hkg",
    name: "Rosewood Hong Kong",
    city: "Victoria Dockside",
    vibe: "Skyline penthouses with harbour boardrooms",
    nightlyRate: 1280,
    rating: 4.9,
    distanceToEvent: "Connected to K11 Musea executive lounge",
    highlights: ["In-room wellness lab", "24h elite butler", "Asaya wellness treatments"],
    suitesAvailable: ["Harbour House", "Manor Suite", "Grand Harbour Corner"]
  },
  {
    id: "ritz-carlton-berlin",
    name: "The Ritz-Carlton Berlin",
    city: "Potsdamer Platz",
    vibe: "Art Deco command centre for executive summits",
    nightlyRate: 890,
    rating: 4.8,
    distanceToEvent: "5 minutes to Berlin Congress Center",
    highlights: ["Club lounge strategy suites", "Bentley airport transfers", "Michelin-starred facilitation"],
    suitesAvailable: ["Carlton Suite", "The Ritz-Carlton Apartment"]
  },
  {
    id: "four-seasons-sydney",
    name: "Four Seasons Hotel Sydney",
    city: "Circular Quay",
    vibe: "Harbourfront hospitality with private residences",
    nightlyRate: 730,
    rating: 4.7,
    distanceToEvent: "2 minutes to Barangaroo corporate precinct",
    highlights: ["Private sky-suite dining", "On-call executive assistant", "Endota spa recovery"],
    suitesAvailable: ["Presidential Suite", "Signature Suites", "Two-Bedroom Deluxe Residence"]
  }
];

const defaultAgentState: Record<AgentId, AgentState> = {
  rich: {
    flights: [],
    hotels: [],
    notes: "Curate seamless privacy-first transit with couture hospitality natively aligned to Ava's personal brand."
  },
  business: {
    flights: [],
    hotels: [],
    notes: "Stabilise a back-to-back board week with reliable rest windows and plug-and-play meeting environments."
  }
};

const agentIdList: AgentId[] = ["rich", "business"];

const MAX_TIMELINE_ENTRIES = 40;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);
}

function createEventId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function getAgentBadge(agentId: AgentId) {
  return agentId === "rich" ? "Couture Concierge" : "Enterprise Navigator";
}

export default function HomePage() {
  const [agents, setAgents] = useState<Record<AgentId, AgentState>>(defaultAgentState);
  const [timeline, setTimeline] = useState<MemoryEvent[]>([]);
  const [noteDrafts, setNoteDrafts] = useState<Record<AgentId, string>>({
    rich: defaultAgentState.rich.notes,
    business: defaultAgentState.business.notes
  });

  useEffect(() => {
    try {
      const rawAgents = window.localStorage.getItem(AGENT_STORAGE_KEY);
      if (rawAgents) {
        const parsed = JSON.parse(rawAgents) as Record<AgentId, AgentState>;
        setAgents({
          rich: { ...defaultAgentState.rich, ...parsed.rich },
          business: { ...defaultAgentState.business, ...parsed.business }
        });
        setNoteDrafts({
          rich: parsed.rich?.notes ?? defaultAgentState.rich.notes,
          business: parsed.business?.notes ?? defaultAgentState.business.notes
        });
      }
    } catch (error) {
      console.warn("Failed to hydrate agent memory", error);
    }

    try {
      const rawTimeline = window.localStorage.getItem(TIMELINE_STORAGE_KEY);
      if (rawTimeline) {
        const parsedTimeline = JSON.parse(rawTimeline) as MemoryEvent[];
        setTimeline(parsedTimeline);
      }
    } catch (error) {
      console.warn("Failed to hydrate timeline", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.localStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    window.localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(timeline));
  }, [timeline]);

  const flightLookup = useMemo(() => {
    const dictionary: Record<string, Flight> = {};
    flights.forEach((flight) => {
      dictionary[flight.id] = flight;
    });
    return dictionary;
  }, []);

  const hotelLookup = useMemo(() => {
    const dictionary: Record<string, Hotel> = {};
    hotels.forEach((hotel) => {
      dictionary[hotel.id] = hotel;
    });
    return dictionary;
  }, []);

  const assignFlight = (agentId: AgentId, flightId: string) => {
    setAgents((previous) => {
      const agent = previous[agentId];
      if (!agent || agent.flights.includes(flightId)) {
        return previous;
      }
      const updatedAgent: AgentState = {
        ...agent,
        flights: [...agent.flights, flightId]
      };
      appendTimelineEvent(agentId, `${agentProfiles[agentId].displayName} locked ${flightLookup[flightId].airline} ${flightId}`, `${flightLookup[flightId].cabin} · ${flightLookup[flightId].origin} → ${flightLookup[flightId].destination}`);
      return {
        ...previous,
        [agentId]: updatedAgent
      };
    });
  };

  const releaseFlight = (agentId: AgentId, flightId: string) => {
    setAgents((previous) => {
      const agent = previous[agentId];
      if (!agent || !agent.flights.includes(flightId)) {
        return previous;
      }
      const updatedAgent: AgentState = {
        ...agent,
        flights: agent.flights.filter((id) => id !== flightId)
      };
      appendTimelineEvent(agentId, `${agentProfiles[agentId].displayName} released ${flightLookup[flightId].airline} ${flightId}`);
      return {
        ...previous,
        [agentId]: updatedAgent
      };
    });
  };

  const assignHotel = (agentId: AgentId, hotelId: string) => {
    setAgents((previous) => {
      const agent = previous[agentId];
      if (!agent || agent.hotels.includes(hotelId)) {
        return previous;
      }
      const updatedAgent: AgentState = {
        ...agent,
        hotels: [...agent.hotels, hotelId]
      };
      appendTimelineEvent(agentId, `${agentProfiles[agentId].displayName} reserved ${hotelLookup[hotelId].name}`, `${hotelLookup[hotelId].city} · ${hotelLookup[hotelId].vibe}`);
      return {
        ...previous,
        [agentId]: updatedAgent
      };
    });
  };

  const releaseHotel = (agentId: AgentId, hotelId: string) => {
    setAgents((previous) => {
      const agent = previous[agentId];
      if (!agent || !agent.hotels.includes(hotelId)) {
        return previous;
      }
      const updatedAgent: AgentState = {
        ...agent,
        hotels: agent.hotels.filter((id) => id !== hotelId)
      };
      appendTimelineEvent(agentId, `${agentProfiles[agentId].displayName} released ${hotelLookup[hotelId].name}`);
      return {
        ...previous,
        [agentId]: updatedAgent
      };
    });
  };

  const appendTimelineEvent = (agentId: AgentId, summary: string, detail?: string) => {
    setTimeline((previous) => {
      const next = [
        {
          id: createEventId("memory"),
          agentId,
          timestamp: Date.now(),
          summary,
          detail
        },
        ...previous
      ];
      return next.slice(0, MAX_TIMELINE_ENTRIES);
    });
  };

  const submitNotes = (agentId: AgentId) => {
    const draft = noteDrafts[agentId];
    setAgents((previous) => {
      const agent = previous[agentId];
      if (!agent) {
        return previous;
      }
      if (agent.notes === draft) {
        return previous;
      }
      appendTimelineEvent(agentId, `${agentProfiles[agentId].displayName} reframed their brief`, draft);
      return {
        ...previous,
        [agentId]: {
          ...agent,
          notes: draft
        }
      };
    });
  };

  return (
    <main className="page">
      <section className="hero">
        <div>
          <h1>Agentic Travel Memory Console</h1>
          <p>
            Deploy specialized concierges that remember premium flight locks and bespoke hotel requirements for demanding
            clientele. Track commitments, adapt briefs, and keep both agents fully aligned without losing context.
          </p>
        </div>
        <div className="hero-metrics">
          <div className="metric">
            <span className="metric-value">{flights.length}</span>
            <span className="metric-label">Premium Flights Curated</span>
          </div>
          <div className="metric">
            <span className="metric-value">{hotels.length}</span>
            <span className="metric-label">Hospitality Suites Ready</span>
          </div>
          <div className="metric">
            <span className="metric-value">{timeline.length}</span>
            <span className="metric-label">Agent Memories Stored</span>
          </div>
        </div>
      </section>

      <section className="grid two-column">
        <div className="column">
          <div className="section-header">
            <h2>Agent Briefings</h2>
            <p>Review commitments and calibrate intent for each persona-driven concierge.</p>
          </div>
          <div className="agent-grid">
            {agentIdList.map((agentId) => {
              const profile = agentProfiles[agentId];
              const agent = agents[agentId];
              return (
                <article key={agentId} className="card agent-card">
                  <header className="card-header">
                    <div>
                      <p className="agent-badge">{getAgentBadge(agentId)}</p>
                      <h3>{profile.displayName}</h3>
                      <p className="role">{profile.role}</p>
                    </div>
                  </header>
                  <p className="persona">{profile.persona}</p>
                  <p className="focus-line">
                    <strong>Strategic focus:</strong> {profile.focus}
                  </p>

                  <div className="memory-block">
                    <div className="memory-heading">
                      <h4>Flights secured</h4>
                      <span>{agent.flights.length || "—"}</span>
                    </div>
                    {agent.flights.length === 0 ? (
                      <p className="empty-state">No flights yet. Assign a premium cabin to lock-in inventory.</p>
                    ) : (
                      agent.flights.map((flightId) => {
                        const flight = flightLookup[flightId];
                        return (
                          <div key={flightId} className="memory-item">
                            <div>
                              <p className="memory-title">
                                {flight.airline} {flight.id}
                              </p>
                              <p className="memory-subtitle">
                                {flight.origin} → {flight.destination}
                              </p>
                              <p className="memory-aux">
                                {flight.departure} · {flight.cabin} · {flight.duration}
                              </p>
                            </div>
                            <button className="ghost-button" onClick={() => releaseFlight(agentId, flightId)}>
                              Release
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="memory-block">
                    <div className="memory-heading">
                      <h4>Hotel mandates</h4>
                      <span>{agent.hotels.length || "—"}</span>
                    </div>
                    {agent.hotels.length === 0 ? (
                      <p className="empty-state">Zero suites held. Tag a property that aligns to the brief.</p>
                    ) : (
                      agent.hotels.map((hotelId) => {
                        const hotel = hotelLookup[hotelId];
                        return (
                          <div key={hotelId} className="memory-item">
                            <div>
                              <p className="memory-title">{hotel.name}</p>
                              <p className="memory-subtitle">{hotel.city}</p>
                              <p className="memory-aux">
                                {hotel.vibe} · {formatCurrency(hotel.nightlyRate)}/night
                              </p>
                            </div>
                            <button className="ghost-button" onClick={() => releaseHotel(agentId, hotelId)}>
                              Release
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="notes-block">
                    <label htmlFor={`${agentId}-notes`}>Brief refinements</label>
                    <textarea
                      id={`${agentId}-notes`}
                      value={noteDrafts[agentId]}
                      onChange={(event) =>
                        setNoteDrafts((previous) => ({
                          ...previous,
                          [agentId]: event.target.value
                        }))
                      }
                      onBlur={() => submitNotes(agentId)}
                      placeholder="Outline micro-requirements, ground support, or brand considerations."
                    />
                    <p className="notes-hint">Blur to save + log revisions to timeline memory.</p>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="card timeline-card">
            <header className="card-header">
              <div>
                <p className="eyebrow">Shared context</p>
                <h3>Agent Memory Stream</h3>
              </div>
            </header>
            {timeline.length === 0 ? (
              <p className="empty-state">Once assignments begin, live updates populate here in reverse chronological order.</p>
            ) : (
              <ul className="timeline">
                {timeline.map((entry) => (
                  <li key={entry.id} className={`timeline-item timeline-${entry.agentId}`}>
                    <div className="timeline-meta">
                      <span className="timeline-agent">{agentProfiles[entry.agentId].displayName}</span>
                      <time>{new Date(entry.timestamp).toLocaleString()}</time>
                    </div>
                    <p className="timeline-summary">{entry.summary}</p>
                    {entry.detail ? <p className="timeline-detail">{entry.detail}</p> : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="column">
          <div className="section-header">
            <h2>Inventory</h2>
            <p>Align both agents with curated flights and hospitality assets ready for reservation.</p>
          </div>

          <div className="card inventory-card">
            <header className="card-header">
              <div>
                <p className="eyebrow">Flight catalogue</p>
                <h3>First & Business Availability</h3>
              </div>
            </header>
            <div className="inventory-grid">
              {flights.map((flight) => (
                <article key={flight.id} className="inventory-item">
                  <div className="inventory-header">
                    <h4>
                      {flight.airline} <span>{flight.id}</span>
                    </h4>
                    <p>{flight.origin}</p>
                    <p className="inventory-arrow">⟶</p>
                    <p>{flight.destination}</p>
                  </div>
                  <div className="inventory-meta">
                    <span>{flight.departure}</span>
                    <span>{flight.duration}</span>
                    <span>{flight.aircraft}</span>
                  </div>
                  <div className="inventory-tags">
                    <span className="tag cabin">{flight.cabin}</span>
                    <span className="tag seats">{flight.seatsRemaining} seats left</span>
                    <span className="tag price">{formatCurrency(flight.price)}</span>
                  </div>
                  <ul className="perks">
                    {flight.perks.map((perk) => (
                      <li key={perk}>{perk}</li>
                    ))}
                  </ul>
                  <div className="inventory-actions">
                    <button
                      className="primary-button"
                      onClick={() => assignFlight("rich", flight.id)}
                      disabled={agents.rich.flights.includes(flight.id)}
                    >
                      Assign to Ava
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => assignFlight("business", flight.id)}
                      disabled={agents.business.flights.includes(flight.id)}
                    >
                      Assign to Marcus
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="card inventory-card">
            <header className="card-header">
              <div>
                <p className="eyebrow">Hotel pipeline</p>
                <h3>Suites on Retainer</h3>
              </div>
            </header>
            <div className="inventory-grid">
              {hotels.map((hotel) => (
                <article key={hotel.id} className="inventory-item">
                  <div className="inventory-header">
                    <h4>{hotel.name}</h4>
                    <p>{hotel.city}</p>
                  </div>
                  <div className="inventory-meta">
                    <span>{hotel.vibe}</span>
                    <span>{hotel.distanceToEvent}</span>
                  </div>
                  <div className="inventory-tags">
                    <span className="tag rating">{hotel.rating.toFixed(1)} ★</span>
                    <span className="tag price">{formatCurrency(hotel.nightlyRate)}/night</span>
                    <span className="tag suites">{hotel.suitesAvailable.length} suites</span>
                  </div>
                  <ul className="perks">
                    {hotel.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                  <div className="suite-grid">
                    {hotel.suitesAvailable.map((suite) => (
                      <span key={suite} className="suite-chip">
                        {suite}
                      </span>
                    ))}
                  </div>
                  <div className="inventory-actions">
                    <button
                      className="primary-button"
                      onClick={() => assignHotel("rich", hotel.id)}
                      disabled={agents.rich.hotels.includes(hotel.id)}
                    >
                      Tag for Ava
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => assignHotel("business", hotel.id)}
                      disabled={agents.business.hotels.includes(hotel.id)}
                    >
                      Tag for Marcus
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
