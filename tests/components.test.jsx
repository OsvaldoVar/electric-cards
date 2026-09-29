import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GateSimulator } from '../src/components/GateSimulator';
import { gates } from '../src/data/gates';
import { GateInventory } from '../src/components/GateInventory/GateInventory';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

describe('Educational and inventory components', () => {
  it('lets a learner toggle inputs and highlights the corresponding table row', async () => {
    const user = userEvent.setup();
    render(<GateSimulator gate={gates.XOR} />);
    expect(screen.getByText('Y = 0')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cambiar entrada A' }));
    expect(screen.getByText('Y = 1')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cambiar entrada B' }));
    expect(screen.getByText('Y = 0')).toBeInTheDocument();
    expect(
      screen.getAllByRole('row').filter((row) => row.classList.contains('active-row')),
    ).toHaveLength(1);
  });
  it('disables exhausted inventory and calls add only for available gates', async () => {
    const user = userEvent.setup();
    const add = vi.fn();
    render(
      <MemoryRouter>
        <GateInventory inventory={{ AND: 0, OR: 1 }} onAdd={add} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: 'Añadir AND. 0 disponibles' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Añadir OR. 1 disponibles' }));
    expect(add).toHaveBeenCalledWith('OR');
  });
});
