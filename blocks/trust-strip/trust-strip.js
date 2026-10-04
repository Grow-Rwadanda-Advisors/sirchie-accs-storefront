/**
 * Trust Strip — Figma 136:489. First row: the heading line. Each following row: a stat,
 * value in the first cell and label in the second.
 * @param {Element} block The trust strip block element
 */
export default function decorate(block) {
  const [headingRow, ...statRows] = [...block.children];
  const contentOf = (cell) => cell?.querySelector('p') || cell;

  const heading = document.createElement('p');
  heading.className = 'trust-strip-heading';
  const headingCell = contentOf(headingRow?.firstElementChild);
  if (headingCell) heading.append(...headingCell.childNodes);

  const stats = document.createElement('ul');
  stats.className = 'trust-strip-stats';
  statRows.forEach((row) => {
    const [valueCell, labelCell] = row.children;
    const stat = document.createElement('li');
    stat.className = 'trust-strip-stat';
    const value = document.createElement('span');
    value.className = 'trust-strip-value';
    value.append(...(contentOf(valueCell)?.childNodes ?? []));
    const label = document.createElement('span');
    label.className = 'trust-strip-label';
    label.append(...(contentOf(labelCell)?.childNodes ?? []));
    stat.append(value, label);
    stats.append(stat);
  });

  block.replaceChildren(heading, stats);
}
