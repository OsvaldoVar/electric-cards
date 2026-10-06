import { Link } from 'react-router-dom';
import { CharacterPortrait } from '../CharacterPortrait';
import { Icon } from '../Icon';
import { gateUnlocks } from '../../data/unlocks';

export function GateCard({ gate, unlocked = true }) {
  const Container = unlocked ? Link : 'article';
  return (
    <Container
      to={unlocked ? `/learn/${gate.id.toLowerCase()}` : undefined}
      className={`gate-card family-${gate.family}${unlocked ? '' : 'gate-card-locked'}`}
      aria-label={
        unlocked
          ? `Compuerta ${gate.name}: ${gate.character.name}, ${gate.character.role}`
          : `Compuerta ${gate.name}. Bloqueada hasta completar el nivel ${gateUnlocks[gate.id]}`
      }
    >
      <div className="gate-card-top">
        <span className="gate-card-id mono">{gate.name}</span>
        <span className="gate-card-expression mono">{gate.expression}</span>
      </div>
      <CharacterPortrait gate={gate} />
      <div className="gate-card-body">
        <h2 className="gate-card-name">{gate.character.name}</h2>
        <p className="gate-card-role">{gate.character.role}</p>
        <span className="gate-card-action">
          {unlocked ? (
            <>
              Conocer compuerta <Icon name="arrow" size={16} />
            </>
          ) : (
            <>
              <Icon name="lock" size={16} />
              Completa el nivel {gateUnlocks[gate.id]}
            </>
          )}
        </span>
      </div>
    </Container>
  );
}
