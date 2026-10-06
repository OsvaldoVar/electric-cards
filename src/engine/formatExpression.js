// Format declarative Boolean objectives without evaluating or rewriting them.
export function formatExpression(expression) {
  function format(value) {
    if (typeof value === 'string') return { text: value, precedence: 5 };
    const [type, ...children] = value;
    if (type === 'NOT') {
      const child = format(children[0]);
      return {
        text: `¬${child.precedence < 4 ? `(${child.text})` : child.text}`,
        precedence: 4,
      };
    }
    const operators = {
      AND: ['', 3],
      OR: [' + ', 1],
      XOR: [' ⊕ ', 2],
      NAND: ['', 3],
      NOR: [' + ', 1],
      XNOR: [' ⊕ ', 2],
    };
    const operator = operators[type];
    if (!operator) throw new Error('UNKNOWN_GATE');
    const [separator, precedence] = operator;
    const text = children
      .map((child) => {
        const part = format(child);
        return part.precedence < precedence ? `(${part.text})` : part.text;
      })
      .join(separator);
    return ['NAND', 'NOR', 'XNOR'].includes(type)
      ? { text: `¬(${text})`, precedence: 4 }
      : { text, precedence };
  }
  return format(expression).text;
}
