/**
 * Safely evaluates a basic arithmetic expression — digits, decimals, the four
 * operators (`+ - * /`, also accepting the display glyphs `× ÷ −`) and
 * parentheses. Returns the result rounded to 2 decimals, or `null` for an
 * empty / incomplete / invalid expression (e.g. while the user is mid-typing).
 *
 * Deliberately a hand-written recursive-descent parser rather than `eval()` /
 * `new Function()` so no arbitrary code can ever run from user input.
 */
export function evalExpression(expr: string): number | null {
  const tokens = tokenize(expr);
  if (!tokens || tokens.length === 0) return null;
  try {
    const parser = new Parser(tokens);
    const value = parser.parseExpression();
    if (!parser.atEnd() || !Number.isFinite(value)) return null;
    return Math.round(value * 100) / 100;
  } catch {
    return null;
  }
}

type Token = { type: 'num'; value: number } | { type: 'op'; value: string };

function tokenize(input: string): Token[] | null {
  const normalized = input.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
  const tokens: Token[] = [];
  let i = 0;
  while (i < normalized.length) {
    const ch = normalized[i];
    if (ch === ' ') {
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let num = '';
      while (i < normalized.length && /[0-9.]/.test(normalized[i])) num += normalized[i++];
      if ((num.match(/\./g) ?? []).length > 1) return null; // e.g. "1.2.3"
      const value = Number(num);
      if (!Number.isFinite(value)) return null;
      tokens.push({ type: 'num', value });
      continue;
    }
    if ('+-*/()'.includes(ch)) {
      tokens.push({ type: 'op', value: ch });
      i++;
      continue;
    }
    return null; // unsupported character
  }
  return tokens;
}

/** Grammar: expression := term (('+'|'-') term)*; term := factor (('*'|'/') factor)*;
 *  factor := ('+'|'-') factor | primary; primary := number | '(' expression ')'. */
class Parser {
  private pos = 0;
  private readonly tokens: Token[];

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  atEnd(): boolean {
    return this.pos >= this.tokens.length;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private next(): Token | undefined {
    return this.tokens[this.pos++];
  }

  parseExpression(): number {
    let value = this.parseTerm();
    for (let t = this.peek(); t?.type === 'op' && (t.value === '+' || t.value === '-'); t = this.peek()) {
      this.next();
      const rhs = this.parseTerm();
      value = t.value === '+' ? value + rhs : value - rhs;
    }
    return value;
  }

  private parseTerm(): number {
    let value = this.parseFactor();
    for (let t = this.peek(); t?.type === 'op' && (t.value === '*' || t.value === '/'); t = this.peek()) {
      this.next();
      const rhs = this.parseFactor();
      if (t.value === '/') {
        if (rhs === 0) throw new Error('divide by zero');
        value /= rhs;
      } else {
        value *= rhs;
      }
    }
    return value;
  }

  private parseFactor(): number {
    const t = this.peek();
    if (t?.type === 'op' && (t.value === '+' || t.value === '-')) {
      this.next();
      const operand = this.parseFactor();
      return t.value === '-' ? -operand : operand;
    }
    return this.parsePrimary();
  }

  private parsePrimary(): number {
    const t = this.next();
    if (!t) throw new Error('unexpected end');
    if (t.type === 'num') return t.value;
    if (t.type === 'op' && t.value === '(') {
      const value = this.parseExpression();
      const close = this.next();
      if (close?.type !== 'op' || close.value !== ')') throw new Error('expected )');
      return value;
    }
    throw new Error('unexpected token');
  }
}
