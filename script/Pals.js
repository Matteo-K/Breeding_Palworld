class BreedNode {
  constructor(palId, parentA = null, parentB = null, prev = null) {
    this.palId = palId;
    this.parentA = parentA;
    this.parentB = parentB;
    this.prev = prev; // génération précédente
    this.children = [];
  }

  getPath() {
    const path = [];
    let n = this;
    while (n) {
      path.push({
        result: n.palId,
        parents: n.parentA && n.parentB ? [n.parentA, n.parentB] : null
      });
      n = n.prev;
    }
    return path.reverse();
  }
}



class Pals {
  constructor() {
    this.pals = [];
    this.graph = new Map();
  }

  /* =====================
     Chargement des données
     ===================== */
  async create() {
    const response = await fetch('data/palworld.json');
    this.pals = Object.values(await response.json());
    this.initGraph();
  }

  /* =====================
     Génération du graphe
     ===================== */
  initGraph() {
    const palArray = this.pals;

    // Initialisation des nœuds
    for (const pal of palArray) {
      this.graph.set(Number(pal.id), new Set());
    }

    // Génération des arêtes via breeding
    for (const parent1 of palArray) {
      for (const parent2 of palArray) {
        const child = this.breeding(parent1, parent2);

        const from = Number(parent1.id);
        const to = Number(child.id);

        this.graph.get(from).add(to);
      }
    }
  }

  /* =====================
     Logique de reproduction
     ===================== */
  breeding(parent1, parent2) {
    const targetRank = Math.floor(
      (parent1.breeding.rank + parent2.breeding.rank + 1) / 2
    );

    return this.pals.reduce((closest, pal) => {
      return Math.abs(pal.breeding.rank - targetRank) <
             Math.abs(closest.breeding.rank - targetRank)
        ? pal
        : closest;
    }, this.pals[0]);
  }

  findPath(requiredList, finalId) {
    let bestPath = null;

    for (let i = 0; i < requiredList.length; i++) {
      const start = requiredList[i];
      const rest = requiredList.filter((_, idx) => idx !== i);

      const orders = this.permutations(rest);

      for (const order of orders) {
        const points = [start, ...order, finalId];
        let fullPath = [];
        let valid = true;

        for (let j = 0; j < points.length - 1; j++) {
          const segment = this.bfs(points[j], points[j + 1]);

          if (!segment) {
            valid = false;
            break;
          }

          if (j > 0) segment.shift();
          fullPath.push(...segment);
        }

        if (valid && (!bestPath || fullPath.length < bestPath.length)) {
          bestPath = fullPath;
        }
      }
    }

    return bestPath;
  }

  permutations(arr) {
    if (arr.length <= 1) return [arr];

    const res = [];

    for (let i = 0; i < arr.length; i++) {
      const rest = arr.slice(0, i).concat(arr.slice(i + 1));

      for (const p of this.permutations(rest)) {
        res.push([arr[i], ...p]);
      }
    }
    return res;
  }

  bfs(start, goal) {
    const queue = [[start, [start]]];
    const visited = new Set([start]);

    while (queue.length) {
      const [current, path] = queue.shift();

      if (current === goal) return path;

      for (const next of this.graph.get(current) || []) {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push([next, [...path, next]]);
        }
      }
    }
    return null;
  }

  buildBreedingTree(startPals, targetId, maxDepth = 6) {
    const visited = new Set(startPals);

    const roots = startPals.map(id => new BreedNode(id));
    const queue = [...roots];

    while (queue.length) {
      const node = queue.shift();

      if (node.palId === targetId) {
        return node;
      }

      if (node.getPath().length > maxDepth) continue;

      for (const other of this.pals) {
        const otherId = Number(other.id);

        const child = this.breeding(
          this.getPal(node.palId),
          this.getPal(otherId)
        );

        const childId = Number(child.id);

        if (visited.has(childId)) continue;
        visited.add(childId);

        const childNode = new BreedNode(
          childId,
          node.palId,
          otherId,
          node
        );

        node.children.push(childNode);
        queue.push(childNode);
      }
    }

    return null;
  }

  getPal(id) {
    return this.pals.find(p => Number(p.id) === id);
  }


}
