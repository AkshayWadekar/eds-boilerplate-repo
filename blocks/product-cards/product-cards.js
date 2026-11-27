export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('product-card');

    const cells = [...row.children];

    if (cells.length >= 2) {
      cells[0].classList.add('product-name');
      cells[1].classList.add('product-description');
    }
  });
}