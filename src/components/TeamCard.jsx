import { useState } from 'react';
import { getLogoUrl } from '../nflData';

export default function TeamCard({ team, draggable = false, onDragStart, onClick, style, compact = false }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDragStart = (e) => {
    if (draggable && onDragStart) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', JSON.stringify(team));
      onDragStart(e, team);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  if (compact) {
    return (
      <div
        className={`team-card compact ${draggable ? 'draggable' : ''}`}
        draggable={draggable}
        onDragStart={handleDragStart}
        onClick={onClick}
        style={style}
      >
        <div className="compact-logo">
          {!imageLoaded && <div className="logo-placeholder">...</div>}
          {imageError ? (
            <div className="logo-error-small">{team.abbr}</div>
          ) : (
            <img
              src={getLogoUrl(team.abbr)}
              alt={team.name}
              className="team-logo-small"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </div>
        <div className="compact-name">{team.name}</div>
      </div>
    );
  }

  return (
    <div
      className={`team-card ${draggable ? 'draggable' : ''}`}
      draggable={draggable}
      onDragStart={handleDragStart}
      onClick={onClick}
      style={style}
    >
      <div className="team-card-logo-container">
        {!imageLoaded && <div className="logo-placeholder">Loading...</div>}
        {imageError ? (
          <div className="logo-error">{team.name}</div>
        ) : (
          <img
            src={getLogoUrl(team.abbr)}
            alt={team.name}
            className="team-logo"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
      </div>
      <div className="team-name">{team.name}</div>
    </div>
  );
}
