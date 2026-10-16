import { Icon } from '../../../shared/ui/Icon';

export function ClockControls({ game }) {
  const hasClock = game.circuit.nodes.some((node) => node.data?.gateType === 'CLOCK');
  return (
    <section className="clock-controls" aria-label="Reloj y memoria">
      <div>
        <h2>Reloj y memoria</h2>
        <p>
          CLK = <strong className="mono">{game.simulation.clock}</strong> · Q cambia en el
          flanco 0 → 1.
        </p>
      </div>
      <div className="clock-actions">
        <button
          className="button button-secondary"
          disabled={!hasClock}
          onClick={game.advanceClock}
        >
          Avanzar reloj
          <Icon name="arrow" size={16} />
        </button>
        <button
          className="button button-quiet"
          disabled={!hasClock}
          aria-pressed={game.clockRunning}
          onClick={game.toggleClock}
        >
          <Icon name="play" size={16} />
          {game.clockRunning ? 'Pausar reloj' : 'Iniciar reloj'}
        </button>
        <button className="button button-quiet" onClick={game.resetSimulation}>
          Reiniciar memoria
        </button>
      </div>
      {!hasClock && <p className="small muted">Añade CLOCK para generar los pulsos.</p>}
    </section>
  );
}
