const engine = new Pals();

async function init() {
  await engine.create();

  const startSel = document.getElementById('startPals');
  const targetSel = document.getElementById('targetPal');

  engine.pals.forEach(pal => {
    const opt1 = new Option(`#${pal.id}`, pal.id);
    const opt2 = new Option(`#${pal.id}`, pal.id);

    startSel.add(opt1);
    targetSel.add(opt2);
  });
}

function renderTree(path) {
  const tree = document.getElementById('tree');
  tree.innerHTML = '';

  if (!path) {
    tree.textContent = "Aucun chemin trouvé 😢";
    return;
  }

  path.forEach(step => {
    const div = document.createElement('div');
    div.className = 'node';

    if (step.parents) {
      div.innerHTML = `
        <span class="parents">${step.parents[0]} + ${step.parents[1]}</span>
        → <span class="result">${step.result}</span>
      `;
    } else {
      div.innerHTML = `<span class="result">Départ : ${step.result}</span>`;
    }

    tree.appendChild(div);
  });
}

document.getElementById('run').addEventListener('click', () => {
  const start = [...document.getElementById('startPals').selectedOptions]
    .map(o => Number(o.value));

  const target = Number(document.getElementById('targetPal').value);

  if (start.length < 1 || start.length > 4) {
    alert("Sélectionne entre 1 et 4 pals.");
    return;
  }

  const endNode = engine.buildBreedingTree(start, target);

  const path = endNode ? endNode.getPath() : null;

  renderTree(path);
});

init();
